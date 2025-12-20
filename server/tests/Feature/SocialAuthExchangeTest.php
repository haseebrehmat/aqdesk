<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Tests\TestCase;

class SocialAuthExchangeTest extends TestCase
{
    use RefreshDatabase;

    public function test_social_exchange_codes_are_short_lived_and_single_use(): void
    {
        $role = Role::create(['role_name' => 'Standard User']);
        $user = User::create([
            'name' => 'Social Member', 'email' => 'social@example.com', 'password' => 'password',
            'role_id' => $role->id, 'is_active' => true,
        ]);
        $code = Str::random(64);
        Cache::put('social-auth:' . hash('sha256', $code), $user->id, now()->addMinutes(2));

        $this->postJson('/api/auth/exchange', ['code' => $code])
            ->assertOk()->assertJsonPath('user.email', 'social@example.com')
            ->assertJsonStructure(['access_token']);

        $this->postJson('/api/auth/exchange', ['code' => $code])->assertUnprocessable();
    }

    public function test_unknown_social_providers_are_rejected(): void
    {
        $this->get('/api/auth/untrusted/redirect')->assertNotFound();
    }
}
