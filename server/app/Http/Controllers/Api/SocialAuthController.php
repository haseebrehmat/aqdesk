<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    private const PROVIDERS = ['google', 'github'];

    public function providers()
    {
        return response()->json([
            'providers' => collect(self::PROVIDERS)->mapWithKeys(
                fn (string $provider) => [$provider => $this->providerIsConfigured($provider)]
            ),
        ]);
    }

    public function redirectToProvider($provider)
    {
        $this->ensureProviderIsSupported($provider);
        abort_unless($this->providerIsConfigured($provider), 503, ucfirst($provider).' sign-in is not configured.');

        return Socialite::driver($provider)->stateless()->redirect();
    }

    public function handleProviderCallback($provider)
    {
        $this->ensureProviderIsSupported($provider);
        abort_unless($this->providerIsConfigured($provider), 503, ucfirst($provider).' sign-in is not configured.');

        try {
            $socialUser = Socialite::driver($provider)->stateless()->user();

            abort_if(blank($socialUser->getEmail()), 422, 'The social account must provide an email address.');

            // Check if user already exists
            $user = User::where('email', $socialUser->getEmail())->first();

            if (! $user) {
                // Assign default 'Standard User' role
                $defaultRole = Role::where('role_name', 'Standard User')->first();

                $user = User::create([
                    'role_id' => $defaultRole?->id ?? Role::query()->firstOrFail()->id,
                    'name' => $socialUser->getName() ?? $socialUser->getNickname() ?? $socialUser->getEmail(),
                    'email' => $socialUser->getEmail(),
                    'password' => Hash::make(Str::random(24)),
                    'is_active' => true,
                ]);

                Profile::create([
                    'user_id' => $user->id,
                    'bio' => 'Imported via '.ucfirst($provider),
                    'skills_tags' => '',
                ]);
            }

            if (! $user->is_active) {
                return redirect()->to(rtrim(config('app.frontend_url'), '/').'/login?error=Account+is+inactive');
            }

            $frontendUrl = rtrim(config('app.frontend_url'), '/');
            $exchangeCode = Str::random(64);
            Cache::put('social-auth:'.hash('sha256', $exchangeCode), $user->id, now()->addMinutes(2));

            return redirect()->to("{$frontendUrl}/auth/success?code={$exchangeCode}");

        } catch (\Throwable $exception) {
            report($exception);
            $frontendUrl = rtrim(config('app.frontend_url'), '/');

            return redirect()->to("{$frontendUrl}/login?error=Social+login+failed");
        }
    }

    public function exchange(Request $request)
    {
        $validated = $request->validate(['code' => 'required|string|size:64']);
        $userId = Cache::pull('social-auth:'.hash('sha256', $validated['code']));
        if (! $userId) {
            return response()->json(['message' => 'This social login code is invalid or expired.'], 422);
        }

        $user = User::with(['role', 'profile'])->findOrFail($userId);
        if (! $user->is_active) {
            return response()->json(['message' => 'This account is inactive.'], 403);
        }

        return response()->json([
            'access_token' => $user->createToken('auth_token')->plainTextToken,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

    private function ensureProviderIsSupported(string $provider): void
    {
        abort_unless(in_array($provider, self::PROVIDERS, true), 404);
    }

    private function providerIsConfigured(string $provider): bool
    {
        return collect(['client_id', 'client_secret', 'redirect'])
            ->every(fn (string $key) => filled(config("services.{$provider}.{$key}")));
    }
}
