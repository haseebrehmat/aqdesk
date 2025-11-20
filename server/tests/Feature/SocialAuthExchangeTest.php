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
        Cache::put('social-auth:'.hash('sha256', $code), $user->id, now()->addMinutes(2));

        $this->postJson('/api/auth/exchange', ['code' => $code])
            ->assertOk()->assertJsonPath('user.email', 'social@example.com')
            ->assertJsonStructure(['access_token']);

        $this->postJson('/api/auth/exchange', ['code' => $code])->assertUnprocessable();
    }

    public function test_unknown_social_providers_are_rejected(): void
    {
        $this->get('/api/auth/untrusted/redirect')->assertNotFound();
    }

    public function test_social_provider_status_only_reports_complete_configuration(): void
    {
        config([
            'services.google.client_id' => 'google-client',
            'services.google.client_secret' => 'google-secret',
            'services.google.redirect' => 'http://localhost/api/auth/google/callback',
            'services.github.client_id' => null,
            'services.github.client_secret' => null,
            'services.github.redirect' => null,
        ]);

        $this->getJson('/api/auth/providers')->assertOk()->assertExactJson([
            'providers' => ['google' => true, 'github' => false],
        ]);
    }

    public function test_unconfigured_social_providers_fail_closed(): void
    {
        config([
            'services.google.client_id' => null,
            'services.google.client_secret' => null,
            'services.google.redirect' => null,
        ]);

        $this->get('/api/auth/google/redirect')->assertServiceUnavailable();
        $this->get('/api/auth/google/callback')->assertServiceUnavailable();
    }

    public function test_configured_social_providers_create_authorization_redirects(): void
    {
        config([
            'services.google.client_id' => 'google-client',
            'services.google.client_secret' => 'google-secret',
            'services.google.redirect' => 'http://localhost/api/auth/google/callback',
            'services.github.client_id' => 'github-client',
            'services.github.client_secret' => 'github-secret',
            'services.github.redirect' => 'http://localhost/api/auth/github/callback',
        ]);

        $this->get('/api/auth/google/redirect')
            ->assertRedirectContains('accounts.google.com/o/oauth2/auth');
        $this->get('/api/auth/github/redirect')
            ->assertRedirectContains('github.com/login/oauth/authorize');
    }
}
