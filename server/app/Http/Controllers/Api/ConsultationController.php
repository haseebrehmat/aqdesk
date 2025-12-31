<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use App\Models\ExpertAvailability;
use App\Models\Proposal;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ConsultationController extends Controller
{
    public function index(Request $request)
    {
        $consultations = Consultation::with(['client', 'expert', 'proposal'])
            ->where('client_id', $request->user()->id)
            ->orWhere('expert_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json($consultations);
    }

    public function experts()
    {
        return response()->json(
            User::query()
                ->where('is_active', true)
                ->whereHas('role', fn ($query) => $query->where('role_name', 'Expert'))
                ->with('profile')
                ->orderBy('name')
                ->get(['id', 'name', 'email'])
        );
    }

    public function availability(Request $request)
    {
        $validated = $request->validate(['expert_id' => 'required|exists:users,id']);
        $bookedSlots = Consultation::query()
            ->where('expert_id', $validated['expert_id'])
            ->whereNotIn('status', ['Rejected', 'Cancelled'])
            ->pluck('booking_slot');

        return response()->json(
            ExpertAvailability::query()
                ->where('expert_id', $validated['expert_id'])
                ->where('starts_at', '>', now())
                ->whereNotIn('starts_at', $bookedSlots)
                ->orderBy('starts_at')
                ->get()
        );
    }

    public function storeAvailability(Request $request)
    {
        abort_unless(in_array($request->user()->role?->role_name, ['Expert', 'Admin'], true), 403);
        $validated = $request->validate([
            'starts_at' => 'required|date|after:now',
            'ends_at' => 'required|date|after:starts_at',
        ]);

        $slot = $request->user()->availabilitySlots()->create($validated);

        return response()->json(['message' => 'Availability added.', 'availability' => $slot], 201);
    }

    public function destroyAvailability(Request $request, ExpertAvailability $availability)
    {
        $isAdmin = $request->user()->role?->role_name === 'Admin';
        abort_unless((int) $availability->expert_id === (int) $request->user()->id || $isAdmin, 403);

        $hasBooking = Consultation::query()
            ->where('expert_id', $availability->expert_id)
            ->where('booking_slot', $availability->starts_at)
            ->whereNotIn('status', ['Rejected', 'Cancelled'])
            ->exists();
        if ($hasBooking) {
            return response()->json(['message' => 'Booked availability cannot be removed.'], 422);
        }

        $availability->delete();

        return response()->json(['message' => 'Availability removed.']);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'expert_id' => 'required|exists:users,id',
            'booking_slot' => 'required|date|after:now',
        ]);

        $expert = User::with('role')->findOrFail($validated['expert_id']);
        if ($expert->role?->role_name !== 'Expert' || ! $expert->is_active) {
            throw ValidationException::withMessages(['expert_id' => ['Select an active expert.']]);
        }
        if ((int) $expert->id === (int) $request->user()->id) {
            throw ValidationException::withMessages(['expert_id' => ['You cannot book yourself.']]);
        }

        $consultation = DB::transaction(function () use ($request, $validated) {
            $availability = ExpertAvailability::query()
                ->where('expert_id', $validated['expert_id'])
                ->where('starts_at', $validated['booking_slot'])
                ->where('starts_at', '>', now())
                ->lockForUpdate()
                ->first();
            if (! $availability) {
                throw ValidationException::withMessages(['booking_slot' => ['Select an available expert time.']]);
            }

            $conflict = Consultation::where('expert_id', $validated['expert_id'])
                ->where('booking_slot', $validated['booking_slot'])
                ->whereNotIn('status', ['Rejected', 'Cancelled'])
                ->lockForUpdate()
                ->exists();

            if ($conflict) {
                throw ValidationException::withMessages(['booking_slot' => ['This expert is already booked for that time.']]);
            }

            return Consultation::create([
                'client_id' => $request->user()->id,
                'expert_id' => $validated['expert_id'],
                'booking_slot' => $validated['booking_slot'],
                'status' => 'Pending',
            ]);
        });

        return response()->json([
            'message' => 'Consultation slot booked successfully',
            'consultation' => $consultation->load(['client', 'expert']),
        ], 201);
    }

    public function updateStatus(Request $request, Consultation $consultation)
    {
        $isAdmin = $request->user()->role?->role_name === 'Admin';
        if ((int) $consultation->expert_id !== (int) $request->user()->id && ! $isAdmin) {
            return response()->json(['message' => 'Only the assigned expert can update this consultation.'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:Pending,Approved,Active,Completed,Rejected',
        ]);
        $consultation->update($validated);

        return response()->json($consultation->load(['client', 'expert', 'proposal']));
    }

    public function saveProposal(Request $request, Consultation $consultation)
    {
        $isAdmin = $request->user()->role?->role_name === 'Admin';
        if ((int) $consultation->expert_id !== (int) $request->user()->id && ! $isAdmin) {
            return response()->json(['message' => 'Only the assigned expert can manage the proposal.'], 403);
        }

        $validated = $request->validate([
            'terms' => 'required|string|min:10',
            'budget' => 'required|numeric|min:0',
        ]);

        $proposal = Proposal::updateOrCreate(
            ['consultation_id' => $consultation->id],
            $validated,
        );

        return response()->json([
            'message' => 'Proposal saved successfully.',
            'proposal' => $proposal,
        ]);
    }
}
