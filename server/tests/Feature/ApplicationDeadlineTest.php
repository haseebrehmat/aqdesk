<?php

namespace Tests\Feature;

use App\Models\Opportunity;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ApplicationDeadlineTest extends TestCase
{
    use RefreshDatabase;

    private function user(string $roleName, string $email): User
    {
        $role = Role::firstOrCreate(['role_name' => $roleName]);

        return User::create([
            'name' => $roleName,
            'email' => $email,
            'password' => 'strong-password',
            'role_id' => $role->id,
            'is_active' => true,
        ]);
    }

    private function opportunity(User $expert, array $overrides = []): Opportunity
    {
        return Opportunity::create(array_merge([
            'posted_by' => $expert->id,
            'title' => 'Laravel Developer',
            'company_name' => 'AQDesk',
            'job_type' => 'Full-Time',
            'status' => 'Published',
        ], $overrides));
    }

    public function test_expired_and_closed_opportunities_reject_applications(): void
    {
        Storage::fake('public');
        $expert = $this->user('Expert', 'expert@example.com');
        $applicant = $this->user('Standard User', 'applicant@example.com');
        $expired = $this->opportunity($expert, [
            'application_deadline' => now()->subMinute(),
        ]);
        $closed = $this->opportunity($expert, [
            'title' => 'Closed Role',
            'status' => 'Closed',
        ]);

        foreach ([$expired, $closed] as $opportunity) {
            $this->actingAs($applicant, 'sanctum')->postJson('/api/applications', [
                'opportunity_id' => $opportunity->id,
                'resume' => UploadedFile::fake()->create('resume.pdf', 100, 'application/pdf'),
            ])->assertUnprocessable()
                ->assertJsonPath('message', 'This opportunity is not accepting applications.');
        }

        $this->assertDatabaseCount('applications', 0);
        Storage::disk('public')->assertDirectoryEmpty('resumes');
    }

    public function test_published_opportunity_before_deadline_accepts_a_pdf_resume(): void
    {
        Storage::fake('public');
        $expert = $this->user('Expert', 'expert@example.com');
        $applicant = $this->user('Standard User', 'applicant@example.com');
        $opportunity = $this->opportunity($expert, [
            'application_deadline' => now()->addDay(),
        ]);

        $this->actingAs($applicant, 'sanctum')->postJson('/api/applications', [
            'opportunity_id' => $opportunity->id,
            'resume' => UploadedFile::fake()->create('resume.pdf', 100, 'application/pdf'),
        ])->assertCreated()
            ->assertJsonPath('data.status', 'Submitted');

        $application = $opportunity->applications()->firstOrFail();
        Storage::disk('public')->assertExists($application->resume_path);
    }
}
