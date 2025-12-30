<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EventCapacityTest extends TestCase
{
    use RefreshDatabase;

    private function user(string $roleName, string $email): User
    {
        $role = Role::firstOrCreate(['role_name' => $roleName]);

        return User::create([
            'name' => $roleName,
            'email' => $email,
            'password' => 'strong-password',
            'role_id' => $role->id,
            'is_active' => true,
        ]);
    }

    public function test_registration_stops_when_event_capacity_is_reached(): void
    {
        $expert = $this->user('Expert', 'expert@example.com');
        $firstAttendee = $this->user('Standard User', 'first@example.com');
        $secondAttendee = $this->user('Standard User', 'second@example.com');
        $event = Event::create([
            'creator_id' => $expert->id,
            'title' => 'Capacity controlled webinar',
            'webinar_url' => 'https://example.com/webinar',
            'scheduled_at' => now()->addDay(),
            'max_attendees' => 1,
        ]);

        $this->actingAs($firstAttendee, 'sanctum')
            ->postJson('/api/events/'.$event->id.'/register')
            ->assertOk()
            ->assertJsonPath('data.is_full', true)
            ->assertJsonPath('data.remaining_capacity', 0);

        $this->actingAs($secondAttendee, 'sanctum')
            ->postJson('/api/events/'.$event->id.'/register')
            ->assertUnprocessable()
            ->assertJsonPath('message', 'This event is fully booked.');

        $this->assertDatabaseCount('event_registrations', 1);
    }

    public function test_unregistering_releases_a_capacity_slot(): void
    {
        $expert = $this->user('Expert', 'expert@example.com');
        $attendee = $this->user('Standard User', 'member@example.com');
        $event = Event::create([
            'creator_id' => $expert->id,
            'title' => 'Reusable webinar seat',
            'webinar_url' => 'https://example.com/webinar',
            'scheduled_at' => now()->addDay(),
            'max_attendees' => 1,
        ]);
        $event->attendees()->attach($attendee->id);

        $this->actingAs($attendee, 'sanctum')
            ->deleteJson('/api/events/'.$event->id.'/register')
            ->assertOk();

        $this->assertDatabaseCount('event_registrations', 0);
        $this->getJson('/api/events/'.$event->id)
            ->assertOk()
            ->assertJsonPath('is_full', false)
            ->assertJsonPath('remaining_capacity', 1);
    }
}
