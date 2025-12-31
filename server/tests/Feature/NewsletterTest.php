<?php

namespace Tests\Feature;

use App\Mail\CommunityUpdate;
use App\Models\Newsletter;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class NewsletterTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_visitors_can_subscribe_and_reactivate_an_email(): void
    {
        Newsletter::create(['email' => 'reader@example.com', 'is_active' => false]);

        $this->postJson('/api/newsletter/subscribe', ['email' => 'Reader@Example.com'])
            ->assertOk()->assertJsonPath('subscriber.is_active', true);

        $this->assertDatabaseHas('newsletters', ['email' => 'reader@example.com', 'is_active' => true]);
        $this->assertDatabaseCount('newsletters', 1);
    }

    public function test_admin_can_queue_a_campaign_for_active_subscribers(): void
    {
        Mail::fake();
        Newsletter::create(['email' => 'active@example.com', 'is_active' => true]);
        Newsletter::create(['email' => 'inactive@example.com', 'is_active' => false]);
        $role = Role::create(['role_name' => 'Admin']);
        $admin = User::create([
            'name' => 'Admin', 'email' => 'admin@example.com', 'password' => 'password',
            'role_id' => $role->id, 'is_active' => true,
        ]);

        $this->actingAs($admin, 'sanctum')->postJson('/api/admin/newsletter/campaigns', [
            'subject' => 'Weekly update',
            'body' => 'This is the weekly AQDesk community update.',
        ])->assertOk()->assertJsonPath('queued_recipients', 1);

        Mail::assertQueued(CommunityUpdate::class, 1);
        Mail::assertQueued(CommunityUpdate::class, fn ($mail) => $mail->hasTo('active@example.com'));
    }

    public function test_admin_can_target_a_newsletter_cohort(): void
    {
        Mail::fake();
        Newsletter::create(['email' => 'ai@example.com', 'is_active' => true, 'cohort' => 'AI']);
        Newsletter::create(['email' => 'web@example.com', 'is_active' => true, 'cohort' => 'Web Development']);
        $role = Role::create(['role_name' => 'Admin']);
        $admin = User::create([
            'name' => 'Admin', 'email' => 'cohort-admin@example.com', 'password' => 'password',
            'role_id' => $role->id, 'is_active' => true,
        ]);

        $this->actingAs($admin, 'sanctum')->postJson('/api/admin/newsletter/campaigns', [
            'subject' => 'AI community update',
            'body' => 'This update is only for the AI subscriber cohort.',
            'cohort' => 'AI',
        ])->assertOk()->assertJsonPath('queued_recipients', 1)->assertJsonPath('cohort', 'AI');

        Mail::assertQueued(CommunityUpdate::class, 1);
        Mail::assertQueued(CommunityUpdate::class, fn ($mail) => $mail->hasTo('ai@example.com'));
    }

    public function test_admin_can_save_edit_and_send_a_campaign_draft(): void
    {
        Mail::fake();
        Newsletter::create(['email' => 'draft-reader@example.com', 'is_active' => true, 'cohort' => 'EdTech']);
        $role = Role::create(['role_name' => 'Admin']);
        $admin = User::create([
            'name' => 'Admin', 'email' => 'draft-admin@example.com', 'password' => 'password',
            'role_id' => $role->id, 'is_active' => true,
        ]);

        $campaignId = $this->actingAs($admin, 'sanctum')->postJson('/api/admin/newsletter/campaigns/drafts', [
            'subject' => 'Initial subject',
            'body' => 'Initial campaign body for the saved draft.',
            'cohort' => 'EdTech',
        ])->assertCreated()->assertJsonPath('campaign.status', 'Draft')->json('campaign.id');

        $this->actingAs($admin, 'sanctum')->putJson('/api/admin/newsletter/campaigns/'.$campaignId, [
            'subject' => 'Updated subject',
            'body' => 'Updated campaign body ready for delivery.',
            'cohort' => 'EdTech',
        ])->assertOk()->assertJsonPath('campaign.subject', 'Updated subject');

        $this->actingAs($admin, 'sanctum')->postJson('/api/admin/newsletter/campaigns/'.$campaignId.'/send')
            ->assertOk()->assertJsonPath('campaign.status', 'Sent')->assertJsonPath('queued_recipients', 1);
        $this->assertDatabaseHas('newsletter_campaigns', ['id' => $campaignId, 'status' => 'Sent']);
        Mail::assertQueued(CommunityUpdate::class, fn ($mail) => $mail->hasTo('draft-reader@example.com'));
    }
}
