<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AccessControlTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_registration_cannot_choose_an_elevated_role(): void
    {
        $standard = Role::create(['role_name' => 'Standard User']);
        $admin = Role::create(['role_name' => 'Admin']);

        $response = $this->postJson('/api/register', [
            'name' => 'New Member',
            'email' => 'member@example.com',
            'password' => 'strong-password',
            'role_id' => $admin->id,
        ]);

        $response->assertCreated()->assertJsonPath('user.role_id', $standard->id);
    }

    public function test_inactive_users_cannot_log_in(): void
    {
        $role = Role::create(['role_name' => 'Standard User']);
        User::create([
            'name' => 'Inactive Member',
            'email' => 'inactive@example.com',
            'password' => Hash::make('strong-password'),
            'role_id' => $role->id,
            'is_active' => false,
        ]);

        $this->postJson('/api/login', [
            'email' => 'inactive@example.com',
            'password' => 'strong-password',
        ])->assertUnprocessable()->assertJsonValidationErrors('email');
    }

    public function test_standard_users_cannot_access_admin_routes(): void
    {
        $role = Role::create(['role_name' => 'Standard User']);
        $user = User::create([
            'name' => 'Standard Member',
            'email' => 'standard@example.com',
            'password' => Hash::make('strong-password'),
            'role_id' => $role->id,
            'is_active' => true,
        ]);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/admin/users')
            ->assertForbidden();
    }
}
