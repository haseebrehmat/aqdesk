<?php

namespace Tests\Feature;

use App\Mail\CommunityUpdate;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class MailConfigurationTest extends TestCase
{
    public function test_mail_check_rejects_non_smtp_mailers(): void
    {
        config(['mail.default' => 'log']);

        $this->artisan('mail:check')
            ->expectsOutputToContain('MAIL_MAILER must be set to smtp')
            ->assertFailed();
    }

    public function test_mail_check_reports_missing_smtp_credentials(): void
    {
        $this->configureSmtp(password: null);

        $this->artisan('mail:check')
            ->expectsOutputToContain('Missing SMTP settings: MAIL_PASSWORD')
            ->assertFailed();
    }

    public function test_mail_check_accepts_complete_smtp_configuration(): void
    {
        $this->configureSmtp();

        $this->artisan('mail:check')
            ->expectsOutputToContain('SMTP configuration is complete')
            ->assertSuccessful();
    }

    public function test_mail_check_accepts_an_smtp_server_without_authentication(): void
    {
        $this->configureSmtp(password: null, username: null);

        $this->artisan('mail:check')
            ->expectsOutputToContain('SMTP configuration is complete')
            ->assertSuccessful();
    }

    public function test_mail_check_sends_a_synchronous_verification_message(): void
    {
        Mail::fake();
        $this->configureSmtp();

        $this->artisan('mail:check', ['--send-to' => 'owner@example.com'])
            ->expectsOutputToContain('SMTP verification message sent')
            ->assertSuccessful();

        Mail::assertSent(
            CommunityUpdate::class,
            fn (CommunityUpdate $mail) => $mail->hasTo('owner@example.com')
                && $mail->campaignSubject === 'AQDesk SMTP verification',
        );
    }

    private function configureSmtp(?string $password = 'smtp-password', ?string $username = 'smtp-user'): void
    {
        config([
            'mail.default' => 'smtp',
            'mail.from.address' => 'no-reply@example.com',
            'mail.from.name' => 'AQDesk',
            'mail.mailers.smtp.url' => null,
            'mail.mailers.smtp.host' => 'smtp.example.com',
            'mail.mailers.smtp.port' => 587,
            'mail.mailers.smtp.username' => $username,
            'mail.mailers.smtp.password' => $password,
        ]);
    }
}
