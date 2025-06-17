<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Profile;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    public function redirectToProvider($provider)
    {
        return Socialite::driver($provider)->stateless()->redirect();
    }

    public function handleProviderCallback($provider)
    {
        try {
            $socialUser = Socialite::driver($provider)->stateless()->user();
            
            // Check if user already exists
            $user = User::where('email', $socialUser->getEmail())->first();

            if (!$user) {
                // Assign default 'Standard User' role
                $defaultRole = Role::where('role_name', 'Standard User')->first();

                $user = User::create([
                    'role_id' => $defaultRole ? $defaultRole->id : 4,
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

            $token = $user->createToken('auth_token')->plainTextToken;

            // Redirect back to frontend dashboard/handler with token
            return redirect()->to("http://localhost:5173/auth/success?token={$token}&user=" . urlencode(json_encode($user->load(['role', 'profile']))));

        } catch (\Exception $e) {
            return redirect()->to("http://localhost:5173/login?error=Social+login+failed");
        }
    }
}