<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Opportunity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ApplicationController extends Controller
{
    /**
     * List applications (for user or employer's opportunities).
     */
    public function index(Request $request)
    {
        $user = Auth::user()->load('role');
        $roleName = $user->role->role_name ?? $user->role ?? '';

        $query = Application::with(['opportunity', 'applicant:id,name,email']);

        // If an explicit opportunity_id filter is passed
        if ($request->has('opportunity_id')) {
            $opportunity = Opportunity::findOrFail($request->opportunity_id);
            if (!in_array(strtolower($roleName), ['administrator', 'admin']) && $opportunity->posted_by !== $user->id) {
                return response()->json(['message' => 'Unauthorized.'], 403);
            }
            $query->where('opportunity_id', $opportunity->id);
        }
        // If user is an Employer or Admin, show all applications for opportunities they posted
        elseif (in_array(strtolower($roleName), ['employer', 'administrator', 'admin'])) {
            $query->whereHas('opportunity', function ($q) use ($user, $roleName) {
                if (!in_array(strtolower($roleName), ['administrator', 'admin'])) {
                    $q->where('posted_by', $user->id);
                }
            });
        }
        // Otherwise, show only the applications submitted by this candidate
        else {
            // Ensure this matches your actual foreign key column name ('user_id' or 'applicant_id')
            $query->where('user_id', $user->id);
        }

        return response()->json($query->latest()->paginate(10));
    }

    /**
     * Store a new application (apply to an opportunity).
     */
    public function store(Request $request)
    {
        $request->validate([
            'opportunity_id' => 'required|exists:opportunities,id',
            'resume' => 'required|file|mimes:pdf,doc,docx|max:2048',
        ]);

        $opportunityId = $request->opportunity_id;
        $userId = Auth::id();

        // Check if already applied
        $existing = Application::where('opportunity_id', $opportunityId)
            ->where('user_id', $userId)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'You have already applied to this opportunity.'], 422);
        }

        // Handle resume file upload
        $resumePath = $request->file('resume')->store('resumes', 'public');

        $application = Application::create([
            'opportunity_id' => $opportunityId,
            'user_id' => $userId,
            'resume_path' => $resumePath,
            'status' => 'Submitted',
        ]);

        return response()->json([
            'message' => 'Application submitted successfully.',
            'data' => $application->load('opportunity')
        ], 201);
    }

    /**
     * Update application status (Employer action).
     */
    public function updateStatus(Request $request, Application $application)
    {
        $application->load('opportunity');

        if ($application->opportunity->posted_by !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $request->validate([
            'status' => 'required|string|in:Submitted,Reviewed,Shortlisted,Rejected,Accepted',
        ]);

        $application->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Application status updated successfully.',
            'data' => $application
        ]);
    }
}
