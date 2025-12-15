<?php

use App\Mail\CommunityUpdate;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Mail;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('mail:check {--send-to= : Send a synchronous SMTP verification message}', function () {
    if (config('mail.default') !== 'smtp') {
        $this->error('MAIL_MAILER must be set to smtp before production email can be verified.');

        return self::FAILURE;
    }

    $smtp = config('mail.mailers.smtp');
    $missing = collect([
        'MAIL_FROM_ADDRESS' => config('mail.from.address'),
        'MAIL_FROM_NAME' => config('mail.from.name'),
    ]);

    if (blank($smtp['url'] ?? null)) {
        $missing = $missing->merge([
            'MAIL_HOST' => $smtp['host'] ?? null,
            'MAIL_PORT' => $smtp['port'] ?? null,
        ]);

        $usernameMissing = blank($smtp['username'] ?? null);
        $passwordMissing = blank($smtp['password'] ?? null);
        if ($usernameMissing !== $passwordMissing) {
            $missing = $missing->merge([
                'MAIL_USERNAME' => $smtp['username'] ?? null,
                'MAIL_PASSWORD' => $smtp['password'] ?? null,
            ]);
        }
    }

    $missing = $missing->filter(fn ($value) => blank($value))->keys();
    if ($missing->isNotEmpty()) {
        $this->error('Missing SMTP settings: '.$missing->implode(', '));

        return self::FAILURE;
    }

    $recipient = $this->option('send-to');
    if ($recipient === null) {
        $this->info('SMTP configuration is complete. Use --send-to=user@example.com to verify delivery.');

        return self::SUCCESS;
    }

    if (filter_var($recipient, FILTER_VALIDATE_EMAIL) === false) {
        $this->error('The --send-to value must be a valid email address.');

        return self::FAILURE;
    }

    try {
        $message = (new CommunityUpdate(
            'AQDesk SMTP verification',
            'AQDesk successfully connected to the configured SMTP provider.',
        ))->to($recipient);
        Mail::sendNow($message);
    } catch (Throwable $exception) {
        report($exception);
        $this->error('SMTP delivery failed. Review the provider credentials and Laravel log.');

        return self::FAILURE;
    }

    $this->info("SMTP verification message sent to {$recipient}.");

    return self::SUCCESS;
})->purpose('Validate SMTP configuration and delivery');
