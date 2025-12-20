<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Profile;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    public function redirectToProvider($provider)
    {
        abort_unless(in_array($provider, ['google', 'github'], true), 404);
        return Socialite::driver($provider)->stateless()->redirect();
    }

    public function handleProviderCallback($provider)
    {
        abort_unless(in_array($provider, ['google', 'github'], true), 404);
        try {
            $socialUser = Socialite::driver($provider)->stateless()->user();
            
            // Check if user already exists
            $user = User::where('email', $socialUser->getEmail())->first();

            if (!$user) {
                // Assign default 'Standard User' role
                $defaultRole = Role::where('role_name', 'Standard User')->first();

                $user = User::create([
                    'role_id' => $defaultRole?->id ?? Role::query()->firstOrFail()->id,
                    'name' => $socialUser->getName() ?? $socialUser->getNickname(),
                    'email' => $socialUser->getEmail(),
                    'password' => Hash::make(Str::random(24)),
                    'is_active' => true,
                ]);

                Profile::create([
                    'user_id' => $user->id,
                    'bio' => 'Imported via ' . ucfirst($provider),
                    'skills_tags' => ''
                ]);
            }

            if (!$user->is_active) {
                return redirect()->to(rtrim(config('app.frontend_url'), '/') . '/login?error=Account+is+inactive');
            }

            $frontendUrl = rtrim(config('app.frontend_url'), '/');
            $exchangeCode = Str::random(64);
            Cache::put('social-auth:' . hash('sha256', $exchangeCode), $user->id, now()->addMinutes(2));

            return redirect()->to("{$frontendUrl}/auth/success?code={$exchangeCode}");

        } catch (\Exception $e) {
            $frontendUrl = rtrim(config('app.frontend_url'), '/');

            return redirect()->to("{$frontendUrl}/login?error=Social+login+failed");
        }
    }

    public function exchange(Request $request)
    {
        $validated = $request->validate(['code' => 'required|string|size:64']);
        $userId = Cache::pull('social-auth:' . hash('sha256', $validated['code']));
        if (!$userId) {
            return response()->json(['message' => 'This social login code is invalid or expired.'], 422);
        }

        $user = User::with(['role', 'profile'])->findOrFail($userId);
        if (!$user->is_active) {
            return response()->json(['message' => 'This account is inactive.'], 403);
        }

        return response()->json([
            'access_token' => $user->createToken('auth_token')->plainTextToken,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }
}
