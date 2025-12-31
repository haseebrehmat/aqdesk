<?php

namespace Tests\Feature;

use App\Models\Consultation;
use App\Models\ExpertAvailability;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ConsultationWorkflowTest extends TestCase
{
    use RefreshDatabase;

    private function user(string $role, string $email): User
    {
        $roleModel = Role::firstOrCreate(['role_name' => $role]);

        return User::create([
            'name' => $role,
            'email' => $email,
            'password' => 'strong-password',
            'role_id' => $roleModel->id,
            'is_active' => true,
        ]);
    }

    public function test_an_expert_slot_cannot_be_double_booked(): void
    {
        $expert = $this->user('Expert', 'expert@example.com');
        $first = $this->user('Standard User', 'first@example.com');
        $second = $this->user('Standard User', 'second@example.com');
        $slot = now()->addDay()->seconds(0)->toDateTimeString();
        ExpertAvailability::create([
            'expert_id' => $expert->id,
            'starts_at' => $slot,
            'ends_at' => now()->addDay()->addHour()->seconds(0),
        ]);

        $this->actingAs($first, 'sanctum')->postJson('/api/consultations', [
            'expert_id' => $expert->id,
            'booking_slot' => $slot,
        ])->assertCreated();

        $this->actingAs($second, 'sanctum')->postJson('/api/consultations', [
            'expert_id' => $expert->id,
            'booking_slot' => $slot,
        ])->assertUnprocessable()->assertJsonValidationErrors('booking_slot');
    }

    public function test_experts_manage_availability_and_clients_must_select_an_open_slot(): void
    {
        $expert = $this->user('Expert', 'calendar-expert@example.com');
        $client = $this->user('Standard User', 'calendar-client@example.com');
        $startsAt = now()->addDays(2)->seconds(0);

        $slotId = $this->actingAs($expert, 'sanctum')->postJson('/api/consultations/availability', [
            'starts_at' => $startsAt->toDateTimeString(),
            'ends_at' => $startsAt->copy()->addHour()->toDateTimeString(),
        ])->assertCreated()->json('availability.id');

        $this->actingAs($client, 'sanctum')->getJson('/api/consultations/availability?expert_id='.$expert->id)
            ->assertOk()->assertJsonPath('0.id', $slotId);

        $this->actingAs($client, 'sanctum')->postJson('/api/consultations', [
            'expert_id' => $expert->id,
            'booking_slot' => $startsAt->copy()->addHour()->toDateTimeString(),
        ])->assertUnprocessable()->assertJsonValidationErrors('booking_slot');

        $this->actingAs($client, 'sanctum')->postJson('/api/consultations', [
            'expert_id' => $expert->id,
            'booking_slot' => $startsAt->toDateTimeString(),
        ])->assertCreated();
    }

    public function test_assigned_expert_can_update_status_and_save_a_proposal(): void
    {
        $expert = $this->user('Expert', 'expert@example.com');
        $client = $this->user('Standard User', 'client@example.com');
        $consultation = Consultation::create([
            'client_id' => $client->id,
            'expert_id' => $expert->id,
            'booking_slot' => now()->addDay(),
            'status' => 'Pending',
        ]);

        $this->actingAs($expert, 'sanctum')
            ->patchJson('/api/consultations/'.$consultation->id.'/status', ['status' => 'Approved'])
            ->assertOk()->assertJsonPath('status', 'Approved');

        $this->actingAs($expert, 'sanctum')
            ->putJson('/api/consultations/'.$consultation->id.'/proposal', [
                'terms' => 'Architecture review and implementation guidance.',
                'budget' => 250,
            ])->assertOk()->assertJsonPath('proposal.budget', 250);
    }
}
