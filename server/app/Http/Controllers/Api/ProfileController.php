<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        return response()->json($request->user()->load(['role', 'profile']));
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'bio' => 'nullable|string',
            'professional_position' => 'nullable|string|max:255',
            'skills_tags' => 'nullable|string',
            'avatar_url' => 'nullable|string',
        ]);

        if (isset($validated['name'])) {
            $user->update(['name' => $validated['name']]);
        }

        $user->profile()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'bio' => $validated['bio'] ?? $user->profile?->bio,
                'professional_position' => $validated['professional_position'] ?? $user->profile?->professional_position,
                'skills_tags' => $validated['skills_tags'] ?? $user->profile?->skills_tags,
                'avatar_url' => $validated['avatar_url'] ?? $user->profile?->avatar_url,
            ]
        );

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user->load(['role', 'profile']),
        ]);
    }
}
