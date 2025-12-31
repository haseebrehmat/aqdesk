<?php

namespace Tests\Feature;

use App\Models\Answer;
use App\Models\Question;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommunityModerationTest extends TestCase
{
    use RefreshDatabase;

    private function user(string $role, string $email): User
    {
        return User::create([
            'name' => $role,
            'email' => $email,
            'password' => 'strong-password',
            'role_id' => Role::firstOrCreate(['role_name' => $role])->id,
            'is_active' => true,
        ]);
    }

    public function test_members_report_content_and_admins_hide_it_from_public_views(): void
    {
        $author = $this->user('Standard User', 'author@example.com');
        $reporter = $this->user('Standard User', 'reporter@example.com');
        $admin = $this->user('Admin', 'moderator@example.com');
        $question = Question::create([
            'user_id' => $author->id,
            'title' => 'A reportable community question',
            'body' => 'This content is long enough for the question body.',
            'slug' => 'reportable-community-question',
        ]);

        $reportId = $this->actingAs($reporter, 'sanctum')->postJson('/api/content-reports', [
            'reportable_type' => 'question',
            'reportable_id' => $question->id,
            'reason' => 'This question contains content that needs moderator review.',
        ])->assertCreated()->json('report.id');

        $this->actingAs($admin, 'sanctum')->getJson('/api/admin/content-reports')
            ->assertOk()->assertJsonPath('data.0.id', $reportId);
        $this->actingAs($admin, 'sanctum')->patchJson('/api/admin/content-reports/'.$reportId, [
            'status' => 'Resolved',
            'action' => 'hide',
        ])->assertOk();

        $this->getJson('/api/questions/'.$question->slug)->assertNotFound();
        $this->assertDatabaseHas('questions', ['id' => $question->id, 'is_hidden' => true]);
    }

    public function test_hidden_answers_are_excluded_and_reports_can_be_dismissed(): void
    {
        $author = $this->user('Standard User', 'answer-author@example.com');
        $reporter = $this->user('Standard User', 'answer-reporter@example.com');
        $admin = $this->user('Admin', 'answer-moderator@example.com');
        $question = Question::create([
            'user_id' => $author->id,
            'title' => 'Question with a reported answer',
            'body' => 'This content is long enough for the question body.',
            'slug' => 'question-with-reported-answer',
        ]);
        $answer = Answer::create([
            'question_id' => $question->id,
            'user_id' => $author->id,
            'body' => 'An answer that should be reviewed.',
        ]);

        $reportId = $this->actingAs($reporter, 'sanctum')->postJson('/api/content-reports', [
            'reportable_type' => 'answer',
            'reportable_id' => $answer->id,
            'reason' => 'This answer needs a moderator to review it carefully.',
        ])->assertCreated()->json('report.id');
        $this->actingAs($admin, 'sanctum')->patchJson('/api/admin/content-reports/'.$reportId, [
            'status' => 'Dismissed',
            'action' => 'none',
        ])->assertOk()->assertJsonPath('report.status', 'Dismissed');
    }
}
