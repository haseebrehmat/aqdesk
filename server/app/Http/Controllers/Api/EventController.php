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

    private function authorizeManage(Request $request, Event $event): void
    {
        $user = $request->user()->loadMissing('role');
        $isAdmin = strtolower((string) $user->role?->role_name) === 'admin';
        abort_unless($isAdmin || (int) $event->creator_id === (int) $user->id, 403, 'Only the host or an admin can change this event.');
    }

    public function update(Request $request, Event $event): JsonResponse
    {
        $this->authorizeManage($request, $event);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'webinar_url' => ['required', 'url'],
            'scheduled_at' => ['required', 'date'],
            'ends_at' => ['nullable', 'date', 'after:scheduled_at'],
            'max_attendees' => ['nullable', 'integer', 'min:1', 'max:100000'],
        ]);

        // Capacity can't drop below the people already registered.
        if (! empty($validated['max_attendees']) && $event->attendees()->count() > $validated['max_attendees']) {
            return response()->json([
                'message' => 'Maximum attendees cannot be lower than the current registrations.',
                'errors' => ['max_attendees' => ['Cannot be lower than the '.$event->attendees()->count().' people already registered.']],
            ], 422);
        }

        $event->update($validated);

        return response()->json([
            'message' => 'Event updated successfully.',
            'data' => $event->load(['host', 'attendees'])->loadCount('attendees'),
        ]);
    }

    public function destroy(Request $request, Event $event): JsonResponse
    {
        $this->authorizeManage($request, $event);

        $event->attendees()->detach();
        $event->delete();

        return response()->json(['message' => 'Event deleted successfully.']);
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

    public function calendar(Request $request, Event $event)
    {
        abort_unless($event->attendees()->where('user_id', $request->user()->id)->exists(), 403);

        $escape = static fn (?string $value): string => str_replace(
            ['\\', ';', ',', "\r\n", "\n"],
            ['\\\\', '\\;', '\\,', '\\n', '\\n'],
            $value ?? ''
        );
        $startsAt = $event->scheduled_at->copy()->utc()->format('Ymd\THis\Z');
        $endsAt = ($event->ends_at ?? $event->scheduled_at->copy()->addHour())->copy()->utc()->format('Ymd\THis\Z');
        $calendar = implode("\r\n", [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//AQDesk//Events//EN',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'BEGIN:VEVENT',
            'UID:event-'.$event->id.'@aqdesk.local',
            'DTSTAMP:'.now()->utc()->format('Ymd\THis\Z'),
            'DTSTART:'.$startsAt,
            'DTEND:'.$endsAt,
            'SUMMARY:'.$escape($event->title),
            'DESCRIPTION:'.$escape($event->description),
            'LOCATION:'.$escape($event->webinar_url),
            'URL:'.$escape($event->webinar_url),
            'END:VEVENT',
            'END:VCALENDAR',
            '',
        ]);

        return response($calendar, 200, [
            'Content-Type' => 'text/calendar; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="aqdesk-event-'.$event->id.'.ics"',
        ]);
    }
}
