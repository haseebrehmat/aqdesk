<?php

namespace Tests\Feature;

use App\Models\Answer;
use App\Models\Project;
use App\Models\Question;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardSummaryTest extends TestCase
{
    use RefreshDatabase;

    public function test_member_receives_personal_statistics_and_six_month_activity(): void
    {
        $role = Role::create(['role_name' => 'Standard User']);
        $member = User::create([
            'role_id' => $role->id,
            'name' => 'Dashboard Member',
            'email' => 'dashboard@example.com',
            'password' => 'strong-password',
            'is_active' => true,
        ]);
        $other = User::create([
            'role_id' => $role->id,
            'name' => 'Workspace Owner',
            'email' => 'workspace@example.com',
            'password' => 'strong-password',
            'is_active' => true,
        ]);

        Project::create(['owner_id' => $member->id, 'title' => 'Owned Workspace']);
        $joined = Project::create(['owner_id' => $other->id, 'title' => 'Joined Workspace']);
        $joined->members()->attach($member->id, ['role_in_project' => 'Collaborator']);

        $question = Question::create([
            'user_id' => $member->id,
            'title' => 'How is dashboard activity summarized?',
            'body' => 'The dashboard should show accurate personal activity totals.',
            'slug' => 'dashboard-activity-summary',
        ]);
        Answer::create([
            'question_id' => $question->id,
            'user_id' => $member->id,
            'body' => 'Aggregate the authenticated user relationships.',
        ]);

        $this->actingAs($member, 'sanctum')
            ->getJson('/api/dashboard/summary')
            ->assertOk()
            ->assertJsonPath('stats.workspaces', 2)
            ->assertJsonPath('stats.questions', 1)
            ->assertJsonPath('stats.answers', 1)
            ->assertJsonPath('stats.applications', 0)
            ->assertJsonCount(6, 'activity')
            ->assertJsonPath('activity.5.questions', 1)
            ->assertJsonPath('activity.5.answers', 1);
    }
}
