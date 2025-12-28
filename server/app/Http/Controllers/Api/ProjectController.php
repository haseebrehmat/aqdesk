<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\File;
use App\Models\Feedback;
use App\Models\ProjectInvitation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        $projects = Project::with(['owner', 'members', 'files'])
            ->where(function ($query) use ($userId) {
                // 1. Include all Public projects
                $query->where('visibility', 'Public')
                    // 2. Include Private projects where user is the Owner
                    ->orWhere('owner_id', $userId)
                    // 3. Include Private projects where user is an attached Member
                    ->orWhereHas('members', function ($q) use ($userId) {
                        $q->where('users.id', $userId);
                    });
            })
            ->latest()
            ->get();

        return response()->json($projects);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'visibility' => 'in:Public,Private',
        ]);

        $project = Project::create([
            'owner_id' => $request->user()->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'visibility' => $validated['visibility'] ?? 'Public',
        ]);

        $project->members()->attach($request->user()->id, ['role_in_project' => 'Owner', 'joined_at' => now()]);

        Log::info('[ProjectController@store] Project created', [
            'project_id' => $project->id,
            'owner_id' => $request->user()->id,
        ]);

        return response()->json($project->load('owner'), 201);
    }

    public function show(Request $request, $id)
    {
        Log::info('[ProjectController@show] Request received', [
            'project_id' => $id,
            'authenticated_user_id' => $request->user() ? $request->user()->id : 'UNAUTHENTICATED',
        ]);

        $project = Project::with(['owner', 'members', 'files.uploader', 'feedback.user'])
            ->findOrFail($id);

        $this->authorize('view', $project);

        Log::info('[ProjectController@show] Authorization passed successfully', ['project_id' => $id]);

        return response()->json($project);
    }

    public function update(Request $request, $id)
    {
        Log::info('[ProjectController@update] Request received', ['project_id' => $id, 'user_id' => $request->user()->id]);

        $project = Project::findOrFail($id);
        $this->authorize('manage', $project);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'visibility' => 'in:Public,Private',
        ]);

        $project->update($validated);

        return response()->json([
            'message' => 'Project updated successfully.',
            'project' => $project->load(['owner', 'members']),
        ]);
    }

    public function destroy(Request $request, $id)
    {
        Log::info('[ProjectController@destroy] Delete request', ['project_id' => $id, 'user_id' => $request->user()->id]);

        $project = Project::findOrFail($id);

        if ((int)$project->owner_id !== (int)$request->user()->id) {
            Log::warning('[ProjectController@destroy] User is not owner', [
                'owner_id' => $project->owner_id,
                'user_id' => $request->user()->id
            ]);
            return response()->json(['message' => 'Only the project owner can delete this project.'], 403);
        }

        foreach ($project->files as $file) {
            Storage::disk('public')->delete($file->file_path);
        }

        $project->delete();

        return response()->json(['message' => 'Project deleted successfully.']);
    }

    public function uploadFile(Request $request, $id)
    {
        Log::info('[ProjectController@uploadFile]', ['project_id' => $id, 'user_id' => $request->user()->id]);

        $project = Project::findOrFail($id);
        $this->authorize('uploadFile', $project);

        $request->validate([
            'file' => 'required|file|max:10240',
        ]);

        $uploadedFile = $request->file('file');
        $path = $uploadedFile->store("projects/{$project->id}/files", 'public');

        $file = $project->files()->create([
            'uploaded_by' => $request->user()->id,
            'file_name' => $uploadedFile->getClientOriginalName(),
            'file_path' => $path,
        ]);

        return response()->json($file->load('uploader'), 201);
    }

    public function deleteFile(Request $request, $fileId)
    {
        Log::info('[ProjectController@deleteFile]', ['file_id' => $fileId, 'user_id' => $request->user()->id]);

        $file = File::with('project')->findOrFail($fileId);
        $this->authorize('deleteFile', [$file->project, $file]);

        Storage::disk('public')->delete($file->file_path);
        $file->delete();

        return response()->json(['message' => 'File deleted successfully.']);
    }

    public function deleteFeedback(Request $request, $feedbackId)
    {
        Log::info('[ProjectController@deleteFeedback]', ['feedback_id' => $feedbackId, 'user_id' => $request->user()->id]);

        $feedback = Feedback::with('project')->findOrFail($feedbackId);
        $this->authorize('deleteFeedback', [$feedback->project, $feedback]);

        $feedback->delete();

        return response()->json(['message' => 'Feedback deleted successfully.']);
    }

    public function addFeedback(Request $request, $id)
    {
        Log::info('[ProjectController@addFeedback]', ['project_id' => $id, 'user_id' => $request->user()->id]);

        $project = Project::findOrFail($id);
        $this->authorize('addFeedback', $project);

        $validated = $request->validate([
            'comments' => 'required|string',
        ]);

        $feedback = $project->feedback()->create([
            'user_id' => $request->user()->id,
            'comments' => $validated['comments'],
        ]);

        return response()->json($feedback->load('user'), 201);
    }

    public function generateInvite(Request $request, $id)
    {
        Log::info('[ProjectController@generateInvite]', ['project_id' => $id, 'user_id' => $request->user()->id]);

        $project = Project::findOrFail($id);
        $this->authorize('manage', $project);

        $invitation = ProjectInvitation::create([
            'project_id' => $project->id,
            'token' => Str::random(32),
            'role' => $request->input('role', 'Collaborator'),
            'expires_at' => now()->addDays(7),
        ]);

        $inviteUrl = config('app.frontend_url', 'http://localhost:5173') . "/projects/join/" . $invitation->token;

        return response()->json([
            'invite_url' => $inviteUrl,
            'expires_at' => $invitation->expires_at,
        ]);
    }

    public function joinProject(Request $request, $token)
    {
        Log::info('[ProjectController@joinProject] Joining via token', ['token' => $token, 'user_id' => $request->user()->id]);

        $invitation = ProjectInvitation::where('token', $token)->firstOrFail();

        if ($invitation->expires_at && $invitation->expires_at->isPast()) {
            return response()->json(['message' => 'This invite link has expired.'], 410);
        }

        $project = Project::findOrFail($invitation->project_id);
        $userId = $request->user()->id;

        if (!$project->members()->where('user_id', $userId)->exists()) {
            $project->members()->attach($userId, ['role_in_project' => $invitation->role, 'joined_at' => now()]);
            Log::info('[ProjectController@joinProject] Attached member to project', ['project_id' => $project->id, 'user_id' => $userId]);
        }

        return response()->json([
            'message' => 'Successfully joined the project workspace!',
            'project_id' => $project->id,
        ]);
    }

    public function removeMember(Request $request, $id, $userId)
    {
        Log::info('[ProjectController@removeMember]', ['project_id' => $id, 'target_user' => $userId, 'actor_id' => $request->user()->id]);

        $project = Project::findOrFail($id);
        $this->authorize('manage', $project);

        if ((int)$userId === (int)$project->owner_id) {
            return response()->json(['message' => 'Cannot remove the project owner.'], 422);
        }

        $project->members()->detach($userId);

        return response()->json(['message' => 'Member removed successfully.']);
    }

    public function updateMemberRole(Request $request, $id, $userId)
    {
        $project = Project::findOrFail($id);
        $this->authorize('manage', $project);

        $validated = $request->validate([
            'role' => 'required|in:Maintainer,Collaborator,Reviewer',
        ]);

        if ((int) $userId === (int) $project->owner_id) {
            return response()->json(['message' => 'The project owner role cannot be changed.'], 422);
        }

        abort_unless($project->members()->where('user_id', $userId)->exists(), 404, 'Member not found.');

        $project->members()->updateExistingPivot($userId, ['role_in_project' => $validated['role']]);

        return response()->json(['message' => 'Member role updated.']);
    }
}
