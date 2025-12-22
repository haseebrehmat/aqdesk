<?php

namespace Tests\Feature;

use App\Models\Profile;
use App\Models\Role;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SrsUseCaseWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_login_and_profile_management_workflow(): void
    {
        Role::create(['role_name' => 'Standard User']);

        $registration = $this->postJson('/api/register', [
            'name' => 'New Student',
            'email' => 'new.student@example.com',
            'password' => 'StrongPassword123!',
        ])->assertCreated()
            ->assertJsonPath('user.role.role_name', 'Standard User')
            ->assertJsonStructure(['access_token', 'user' => ['profile']]);

        $user = User::where('email', 'new.student@example.com')->firstOrFail();
        $this->assertTrue(Hash::check('StrongPassword123!', $user->password));

        $this->postJson('/api/login', [
            'email' => 'new.student@example.com',
            'password' => 'StrongPassword123!',
        ])->assertOk()->assertJsonStructure(['access_token']);

        $this->withToken($registration->json('access_token'))
            ->putJson('/api/profile', [
                'name' => 'Updated Student',
                'bio' => 'Student developer working on accessible learning systems.',
                'professional_position' => 'Junior Software Developer',
                'skills_tags' => 'Laravel, React, Accessibility',
            ])->assertOk()
            ->assertJsonPath('user.name', 'Updated Student')
            ->assertJsonPath('user.profile.professional_position', 'Junior Software Developer')
            ->assertJsonPath('user.profile.skills_tags', 'Laravel, React, Accessibility');

        $this->assertDatabaseHas('profiles', [
            'user_id' => $user->id,
            'professional_position' => 'Junior Software Developer',
        ]);
    }

    public function test_question_answer_tag_browse_and_vote_workflow(): void
    {
        $author = $this->user('Standard User', 'author@example.com');
        $responder = $this->user('Expert', 'responder@example.com');
        $voter = $this->user('Standard User', 'voter@example.com');
        $tag = Tag::create(['tag_name' => 'Web Development']);

        $questionResponse = $this->actingAs($author, 'sanctum')->postJson('/api/questions', [
            'title' => 'How should Laravel API state be synchronized?',
            'body' => 'The frontend needs a reliable approach for synchronizing API state after updates.',
            'tags' => [$tag->id],
        ])->assertCreated()->assertJsonPath('question.tags.0.tag_name', 'Web Development');

        $slug = $questionResponse->json('question.slug');
        $this->getJson('/api/questions')->assertOk()->assertJsonPath('data.0.slug', $slug);

        $answerResponse = $this->actingAs($responder, 'sanctum')
            ->postJson("/api/questions/{$slug}/answers", [
                'body' => 'Invalidate the affected query and refetch its canonical API representation.',
            ])->assertCreated();

        $answerId = $answerResponse->json('answer.id');
        $this->actingAs($voter, 'sanctum')
            ->postJson("/api/answers/{$answerId}/vote", ['type' => 1])
            ->assertOk()
            ->assertJsonPath('net_votes', 1);

        $this->actingAs($author, 'sanctum')
            ->patchJson("/api/answers/{$answerId}/accept")
            ->assertOk()
            ->assertJsonPath('is_accepted', true);
    }

    public function test_project_invitation_file_and_feedback_workflow(): void
    {
        Storage::fake('public');
        $owner = $this->user('Standard User', 'owner@example.com');
        $collaborator = $this->user('Standard User', 'collaborator@example.com');

        $projectResponse = $this->actingAs($owner, 'sanctum')->postJson('/api/projects', [
            'title' => 'Accessible Learning Workspace',
            'description' => 'A private project workspace for the AQDesk team.',
            'visibility' => 'Private',
        ])->assertCreated();
        $projectId = $projectResponse->json('id');

        $invitationResponse = $this->actingAs($owner, 'sanctum')
            ->postJson("/api/projects/{$projectId}/invitations")
            ->assertOk();
        $token = basename($invitationResponse->json('invite_url'));

        $this->actingAs($collaborator, 'sanctum')
            ->postJson("/api/projects/join/{$token}")
            ->assertOk()
            ->assertJsonPath('project_id', $projectId);

        $uploadResponse = $this->actingAs($collaborator, 'sanctum')
            ->post("/api/projects/{$projectId}/files", [
                'file' => UploadedFile::fake()->create('requirements.pdf', 100, 'application/pdf'),
            ], ['Accept' => 'application/json'])
            ->assertCreated();
        Storage::disk('public')->assertExists($uploadResponse->json('file_path'));

        $this->actingAs($collaborator, 'sanctum')
            ->postJson("/api/projects/{$projectId}/feedback", [
                'comments' => 'The requirements mapping is ready for review.',
            ])->assertCreated();

        $this->assertDatabaseHas('project_members', [
            'project_id' => $projectId,
            'user_id' => $collaborator->id,
        ]);
        $this->assertDatabaseHas('feedback', [
            'project_id' => $projectId,
            'user_id' => $collaborator->id,
        ]);
    }

    public function test_expert_can_publish_an_event_and_podcast_and_member_can_register(): void
    {
        $expert = $this->user('Expert', 'publisher@example.com');
        $member = $this->user('Standard User', 'attendee@example.com');

        $eventResponse = $this->actingAs($expert, 'sanctum')->postJson('/api/events', [
            'title' => 'Accessible API Design Webinar',
            'description' => 'A practical webinar about inclusive API-driven interfaces.',
            'webinar_url' => 'https://meet.example.com/aqdesk-event',
            'scheduled_at' => now()->addWeek()->toIso8601String(),
            'ends_at' => now()->addWeek()->addHour()->toIso8601String(),
            'max_attendees' => 25,
        ])->assertCreated();

        $eventId = $eventResponse->json('data.id');
        $this->actingAs($member, 'sanctum')
            ->postJson("/api/events/{$eventId}/register")
            ->assertOk();

        $podcastResponse = $this->actingAs($expert, 'sanctum')->postJson('/api/podcasts', [
            'title' => 'AQDesk Engineering Conversations',
            'description' => 'An interview about accessible community platforms.',
            'media_url' => 'https://media.example.com/aqdesk-episode.mp3',
            'duration_in_minutes' => 35,
        ])->assertCreated();

        $this->getJson('/api/podcasts')
            ->assertOk()
            ->assertJsonPath('data.0.id', $podcastResponse->json('data.id'));
    }

    public function test_administrator_can_create_update_list_and_delete_users(): void
    {
        $admin = $this->user('Admin', 'admin@example.com');
        $expertRole = Role::firstOrCreate(['role_name' => 'Expert']);

        $createResponse = $this->actingAs($admin, 'sanctum')->postJson('/api/admin/users', [
            'name' => 'Managed User',
            'email' => 'managed@example.com',
            'password' => 'ManagedPassword123!',
            'role_id' => $expertRole->id,
            'is_active' => true,
        ])->assertCreated();
        $managedId = $createResponse->json('user.id');

        $this->actingAs($admin, 'sanctum')
            ->putJson("/api/admin/users/{$managedId}", ['is_active' => false])
            ->assertOk()
            ->assertJsonPath('user.is_active', false);

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/users')
            ->assertOk()
            ->assertJsonFragment(['email' => 'managed@example.com']);

        $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/admin/users/{$managedId}")
            ->assertOk();

        $this->assertDatabaseMissing('users', ['id' => $managedId]);
    }

    private function user(string $roleName, string $email): User
    {
        $role = Role::firstOrCreate(['role_name' => $roleName]);
        $user = User::create([
            'name' => $roleName.' User',
            'email' => $email,
            'password' => Hash::make('StrongPassword123!'),
            'role_id' => $role->id,
            'is_active' => true,
        ]);
        Profile::create([
            'user_id' => $user->id,
            'bio' => '',
            'skills_tags' => '',
        ]);

        return $user->load('role');
    }
}
