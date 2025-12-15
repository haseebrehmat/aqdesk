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
}
