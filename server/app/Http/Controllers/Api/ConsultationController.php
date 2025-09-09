<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use Illuminate\Http\Request;

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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'expert_id' => 'required|exists:users,id',
            'booking_slot' => 'required|date',
        ]);

        $consultation = Consultation::create([
            'client_id' => $request->user()->id,
            'expert_id' => $validated['expert_id'],
            'booking_slot' => $validated['booking_slot'],
            'status' => 'Pending',
        ]);

        return response()->json([
            'message' => 'Consultation slot booked successfully',
            'consultation' => $consultation->load(['client', 'expert']),
        ], 201);
    }
}