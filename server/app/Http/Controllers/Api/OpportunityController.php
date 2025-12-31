<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Opportunity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OpportunityController extends Controller
{
    /**
     * Display a listing of opportunities.
     */
    public function index(Request $request)
    {
        $user = $request->user('sanctum')?->load('role');
        $roleName = strtolower((string) ($user?->role?->role_name));

        $opportunities = Opportunity::with('employer:id,name')
            ->when($roleName !== 'admin', function ($query) use ($user) {
                $query->where(function ($visibility) use ($user) {
                    $visibility->where('status', 'Published');
                    if ($user) {
                        $visibility->orWhere('posted_by', $user->id);
                    }
                });
            })
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $opportunities,
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

        if (! in_array(strtolower($roleName), ['expert', 'admin'], true)) {
            return response()->json([
                'message' => 'Unauthorized. Only employers and admins can post opportunities.',
            ], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'company_name' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'job_type' => 'required|string|max:50',
            'description' => 'nullable|string',
            'application_deadline' => 'nullable|date|after:now',
            'posted_by' => 'sometimes|exists:users,id',
        ]);

        if (strtolower($roleName) === 'admin' && $request->filled('posted_by')) {
            $validated['posted_by'] = $request->posted_by;
        } else {
            $validated['posted_by'] = $user->id;
        }
        $validated['status'] = strtolower($roleName) === 'admin' ? 'Published' : 'Pending Review';

        $opportunity = Opportunity::create($validated);

        return response()->json([
            'message' => 'Opportunity created successfully.',
            'data' => $opportunity->load('employer:id,name'),
        ], 201);
    }

    /**
     * Display the specified opportunity.
     */
    public function show(Request $request, Opportunity $opportunity)
    {
        $user = $request->user('sanctum')?->load('role');
        $isAdmin = strtolower((string) $user?->role?->role_name) === 'admin';
        if ($opportunity->status !== 'Published' && ! $isAdmin && $opportunity->posted_by !== $user?->id) {
            abort(404);
        }

        return response()->json([
            'success' => true,
            'data' => $opportunity->load('employer:id,name'),
        ]);
    }

    /**
     * Update the specified opportunity.
     */
    public function update(Request $request, Opportunity $opportunity)
    {
        $user = Auth::user()->load('role');
        $roleName = $user->role->role_name ?? $user->role ?? '';

        if (strtolower($roleName) !== 'admin' && $opportunity->posted_by !== $user->id) {
            return response()->json(['message' => 'Unauthorized to edit this posting.'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'company_name' => 'sometimes|required|string|max:255',
            'location' => 'nullable|string|max:255',
            'job_type' => 'sometimes|required|string|max:50',
            'description' => 'nullable|string',
            'application_deadline' => 'nullable|date|after:now',
        ]);

        $opportunity->update($validated);

        return response()->json([
            'message' => 'Opportunity updated successfully.',
            'data' => $opportunity->load('employer:id,name'),
        ]);
    }

    /**
     * Remove the specified opportunity.
     */
    public function destroy(Opportunity $opportunity)
    {
        $user = Auth::user()->load('role');
        $roleName = $user->role->role_name ?? $user->role ?? '';

        if (strtolower($roleName) !== 'admin' && $opportunity->posted_by !== $user->id) {
            return response()->json(['message' => 'Unauthorized to delete this posting.'], 403);
        }

        $opportunity->delete();

        return response()->json(['message' => 'Opportunity deleted successfully.']);
    }

    public function moderate(Request $request, Opportunity $opportunity)
    {
        $validated = $request->validate([
            'status' => 'required|in:Pending Review,Published,Rejected,Closed',
        ]);

        $opportunity->update($validated);

        return response()->json([
            'message' => 'Opportunity moderation status updated.',
            'data' => $opportunity->load('employer:id,name'),
        ]);
    }
}
