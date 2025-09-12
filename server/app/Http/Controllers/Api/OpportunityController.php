<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Opportunity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class OpportunityController extends Controller
{
    /**
     * Display a listing of opportunities.
     */
    public function index()
    {
        $opportunities = Opportunity::with('employer:id,name')->latest()->get();
        return response()->json([
            'success' => true,
            'data' => $opportunities
        ]);
    }

    /**
     * Store a newly created opportunity.
     */
    public function store(Request $request)
    {
        $user = Auth::user()->load('role');

        // Determine role name safely (checking relation or string attribute)
        $roleName = $user->role->role_name ?? $user->role ?? '';

        // Only allow Employers or Administrators to post opportunities
        if (!in_array(strtolower($roleName), ['employer', 'administrator', 'admin'])) {
            return response()->json([
                'message' => 'Unauthorized. Only employers and admins can post opportunities.'
            ], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'company_name' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'job_type' => 'required|string|max:50',
            'description' => 'nullable|string',
            'status' => 'sometimes|string|max:30',
            'posted_by' => 'sometimes|exists:users,id'
        ]);

        if (in_array(strtolower($roleName), ['administrator', 'admin']) && $request->filled('posted_by')) {
            $validated['posted_by'] = $request->posted_by;
        } else {
            $validated['posted_by'] = $user->id;
        }

        $opportunity = Opportunity::create($validated);

        return response()->json([
            'message' => 'Opportunity created successfully.',
            'data' => $opportunity->load('employer:id,name')
        ], 201);
    }

    /**
     * Display the specified opportunity.
     */
    public function show(Opportunity $opportunity)
    {
        return response()->json([
            'success' => true,
            'data' => $opportunity->load('employer:id,name')
        ]);
    }

    /**
     * Update the specified opportunity.
     */
    public function update(Request $request, Opportunity $opportunity)
    {
        $user = Auth::user()->load('role');
        $roleName = $user->role->role_name ?? $user->role ?? '';

        if (!in_array(strtolower($roleName), ['administrator', 'admin']) && $opportunity->posted_by !== $user->id) {
            return response()->json(['message' => 'Unauthorized to edit this posting.'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'company_name' => 'sometimes|required|string|max:255',
            'location' => 'nullable|string|max:255',
            'job_type' => 'sometimes|required|string|max:50',
            'description' => 'nullable|string',
            'status' => 'sometimes|string|max:30',
        ]);

        $opportunity->update($validated);

        return response()->json([
            'message' => 'Opportunity updated successfully.',
            'data' => $opportunity->load('employer:id,name')
        ]);
    }

    /**
     * Remove the specified opportunity.
     */
    public function destroy(Opportunity $opportunity)
    {
        $user = Auth::user()->load('role');
        $roleName = $user->role->role_name ?? $user->role ?? '';

        if (!in_array(strtolower($roleName), ['administrator', 'admin']) && $opportunity->posted_by !== $user->id) {
            return response()->json(['message' => 'Unauthorized to delete this posting.'], 403);
        }

        $opportunity->delete();

        return response()->json(['message' => 'Opportunity deleted successfully.']);
    }
}