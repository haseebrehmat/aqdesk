<?php

namespace Tests\Feature;

use App\Models\Opportunity;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OpportunityModerationTest extends TestCase
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

    public function test_expert_posts_require_review(): void
    {
        $expert = $this->user('Expert', 'expert@example.com');

        $this->actingAs($expert, 'sanctum')->postJson('/api/opportunities', [
            'title' => 'Laravel Internship',
            'company_name' => 'AQDesk',
            'job_type' => 'Internship',
            'description' => 'A supervised development placement.',
        ])->assertCreated()->assertJsonPath('data.status', 'Pending Review');

    }

    public function test_pending_opportunities_are_hidden_from_guests(): void
    {
        $expert = $this->user('Expert', 'expert@example.com');
        Opportunity::create([
            'posted_by' => $expert->id,
            'title' => 'Pending Role',
            'company_name' => 'AQDesk',
            'job_type' => 'Internship',
            'status' => 'Pending Review',
        ]);

        $this->getJson('/api/opportunities')->assertJsonCount(0, 'data');
    }

    public function test_admin_can_publish_a_pending_opportunity(): void
    {
        $expert = $this->user('Expert', 'expert@example.com');
        $admin = $this->user('Admin', 'admin@example.com');
        $opportunity = Opportunity::create([
            'posted_by' => $expert->id,
            'title' => 'Reviewed Role',
            'company_name' => 'AQDesk',
            'job_type' => 'Full-Time',
            'status' => 'Pending Review',
        ]);

        $this->actingAs($admin, 'sanctum')
            ->patchJson('/api/admin/opportunities/' . $opportunity->id . '/status', ['status' => 'Published'])
            ->assertOk()->assertJsonPath('data.status', 'Published');

        $this->getJson('/api/opportunities')->assertJsonCount(1, 'data');
    }
}
