<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEventRequest;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EventController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $events = Event::with(['host', 'attendees'])
            ->withCount('attendees')
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->orderBy('scheduled_at', 'asc')
            ->paginate(10);

        return response()->json($events);
    }

    public function store(StoreEventRequest $request): JsonResponse
    {
        $user = $request->user();

        // Create the event
        $event = $user->hostedEvents()->create($request->validated());

        // Auto-register the creator as an attendee
        $event->attendees()->attach($user->id);

        return response()->json([
            'message' => 'Event created successfully.',
            'data' => $event->load(['host', 'attendees'])->loadCount('attendees'),
        ], 201);
    }

    public function show(Event $event): JsonResponse
    {
        return response()->json($event->load(['host', 'attendees'])->loadCount('attendees'));
    }

    public function register(Request $request, Event $event): JsonResponse
    {
        return DB::transaction(function () use ($request, $event) {
            $user = $request->user();
            $lockedEvent = Event::query()->lockForUpdate()->findOrFail($event->id);

            if ($lockedEvent->attendees()->where('user_id', $user->id)->exists()) {
                return response()->json(['message' => 'You are already registered for this event.'], 422);
            }

            if ($lockedEvent->max_attendees !== null
                && $lockedEvent->attendees()->count() >= $lockedEvent->max_attendees) {
                return response()->json(['message' => 'This event is fully booked.'], 422);
            }

            $lockedEvent->attendees()->attach($user->id);

            return response()->json([
                'message' => 'Successfully registered for the event.',
                'data' => $lockedEvent->load(['host', 'attendees'])->loadCount('attendees'),
            ]);
        });
    }

    public function unregister(Request $request, Event $event): JsonResponse
    {
        $event->attendees()->detach($request->user()->id);

        return response()->json(['message' => 'Successfully unregistered from the event.']);
    }
}
