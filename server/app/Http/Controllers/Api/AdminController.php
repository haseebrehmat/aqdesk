<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    /**
     * Display a listing of all users for admin management.
     */
    public function index()
    {
        $users = User::with(['role', 'profile'])->latest()->get();
        return response()->json([
            'success' => true,
            'users' => $users
        ]);
    }

    /**
     * List assignable roles for the admin user forms.
     */
    public function roles()
    {
        return response()->json([
            'success' => true,
            'roles' => Role::query()->orderBy('id')->get(['id', 'role_name']),
        ]);
    }

    /**
     * Store a newly created user from the admin panel.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role_id' => 'required|exists:roles,id',
            'is_active' => 'boolean',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role_id' => $validated['role_id'],
            'is_active' => $request->has('is_active') ? $validated['is_active'] : true,
        ]);

        $user->load('role');

        return response()->json([
            'success' => true,
            'message' => 'User created successfully.',
            'user' => $user->load(['role', 'profile'])
        ], 201);
    }

    /**
     * Update a user's role or status (Admin Panel action).
     */
    public function updateUser(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'role_id' => 'sometimes|exists:roles,id',
            'is_active' => 'sometimes|boolean',
        ]);

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully.',
            'user' => $user->load(['role', 'profile'])
        ]);
    }

    /**
     * Delete or deactivate a user account.
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        
        // Prevent self-deletion
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'Cannot delete your own admin account.'], 403);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully.'
        ]);
    }
}