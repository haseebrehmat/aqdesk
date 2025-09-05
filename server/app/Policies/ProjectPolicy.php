<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;
use App\Models\File;
use App\Models\Feedback;
use App\Models\ProjectMember;
use Illuminate\Support\Facades\Log;

class ProjectPolicy
{
    private function getMemberRole(User $user, Project $project): ?string
    {
        Log::info('[Policy Check] evaluating getMemberRole', [
            'user_id' => $user->id,
            'project_id' => $project->id,
            'owner_id' => $project->owner_id,
            'visibility' => $project->visibility,
            'members_relation_loaded' => $project->relationLoaded('members'),
        ]);

        // 1. Owner Check
        if ((int) $project->owner_id === (int) $user->id) {
            Log::info('[Policy Check] Match: User is Owner via owner_id column');
            return 'Owner';
        }

        // 2. Pivot relation check (if relation is loaded on model)
        if ($project->relationLoaded('members')) {
            $member = $project->members->first(fn ($m) => (int) $m->id === (int) $user->id);
            Log::info('[Policy Check] Eager-loaded member check', [
                'member_found' => !is_null($member),
                'has_pivot' => isset($member->pivot),
                'role_in_pivot' => $member->pivot->role_in_project ?? null,
            ]);

            if ($member && isset($member->pivot) && isset($member->pivot->role_in_project)) {
                return $member->pivot->role_in_project;
            }
        }

        // 3. Direct DB lookup fallback
        $member = ProjectMember::where('project_id', $project->id)
            ->where('user_id', $user->id)
            ->first();

        Log::info('[Policy Check] Database lookup fallback result', [
            'member_record_exists' => !is_null($member),
            'role_found' => $member ? $member->role_in_project : null,
        ]);

        return $member ? $member->role_in_project : null;
    }

    public function view(User $user, Project $project): bool
    {
        $role = $this->getMemberRole($user, $project);
        
        $allowed = ((int) $project->owner_id === (int) $user->id) 
            || ($project->visibility === 'Public') 
            || ($role !== null);

        Log::info('[Policy Check] view policy outcome', [
            'user_id' => $user->id,
            'project_id' => $project->id,
            'resolved_role' => $role,
            'allowed' => $allowed,
        ]);

        return $allowed;
    }

    public function manage(User $user, Project $project): bool
    {
        $role = $this->getMemberRole($user, $project);
        $allowed = in_array($role, ['Owner', 'Maintainer'], true);

        Log::info('[Policy Check] manage policy outcome', [
            'user_id' => $user->id,
            'project_id' => $project->id,
            'resolved_role' => $role,
            'allowed' => $allowed,
        ]);

        return $allowed;
    }

    public function uploadFile(User $user, Project $project): bool
    {
        $role = $this->getMemberRole($user, $project);
        $allowed = in_array($role, ['Owner', 'Maintainer', 'Collaborator'], true);

        Log::info('[Policy Check] uploadFile policy outcome', [
            'user_id' => $user->id,
            'project_id' => $project->id,
            'resolved_role' => $role,
            'allowed' => $allowed,
        ]);

        return $allowed;
    }

    public function deleteFile(User $user, Project $project, File $file): bool
    {
        if ((int) $user->id === (int) $file->uploaded_by) {
            Log::info('[Policy Check] deleteFile allowed (User is original uploader)');
            return true;
        }

        $role = $this->getMemberRole($user, $project);
        $allowed = in_array($role, ['Owner', 'Maintainer'], true);

        Log::info('[Policy Check] deleteFile policy outcome', [
            'user_id' => $user->id,
            'file_id' => $file->id,
            'resolved_role' => $role,
            'allowed' => $allowed,
        ]);

        return $allowed;
    }

    public function addFeedback(User $user, Project $project): bool
    {
        $role = $this->getMemberRole($user, $project);
        $allowed = $role !== null;

        Log::info('[Policy Check] addFeedback policy outcome', [
            'user_id' => $user->id,
            'project_id' => $project->id,
            'resolved_role' => $role,
            'allowed' => $allowed,
        ]);

        return $allowed;
    }

    public function deleteFeedback(User $user, Project $project, Feedback $feedback): bool
    {
        if ((int) $user->id === (int) $feedback->user_id) {
            Log::info('[Policy Check] deleteFeedback allowed (User is feedback author)');
            return true;
        }

        $role = $this->getMemberRole($user, $project);
        $allowed = in_array($role, ['Owner', 'Maintainer'], true);

        Log::info('[Policy Check] deleteFeedback policy outcome', [
            'user_id' => $user->id,
            'feedback_id' => $feedback->id,
            'resolved_role' => $role,
            'allowed' => $allowed,
        ]);

        return $allowed;
    }
}