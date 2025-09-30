<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\Opportunity;
use App\Models\Podcast;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class OpportunityAndEventSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $expert = User::where('email', 'abdullah.qamar@aqdesk.site')->first();

        if ($expert) {
            // 1. Job Opportunity
            Opportunity::firstOrCreate(
                ['title' => 'Senior Full-Stack Laravel & React Architect'],
                [
                    'posted_by' => $expert->id,
                    'company_name' => 'TechCorp Global Enterprise',
                    'location' => 'Remote / Lahore',
                    'job_type' => 'Full-Time',
                    'description' => 'Looking for an experienced full-stack engineer to maintain enterprise database architectures and inventory systems.',
                    'status' => 'Published'
                ]
            );

            // 2. Live Event / Webinar
            Event::firstOrCreate(
                ['title' => 'Advanced Database Normalization & Indexing Masterclass'],
                [
                    'creator_id' => $expert->id,
                    'description' => 'Join this live technical workshop covering InnoDB storage engines and complex multi-table SQL joins.',
                    'webinar_url' => 'https://meet.google.com/abc-defg-hij',
                    'scheduled_at' => Carbon::now()->addDays(3),
                    'ends_at' => Carbon::now()->addDays(3)->addHours(2),
                    'status' => 'Scheduled'
                ]
            );

            // 3. Audio Podcast
            Podcast::firstOrCreate(
                ['title' => 'System Design Deep-Dive: Scaling Laravel APIs'],
                [
                    'expert_id' => $expert->id,
                    'description' => 'An audio broadcast discussing backend performance tuning, request queuing, and caching strategies.',
                    'media_url' => 'https://assets.aqdesk.site/podcasts/scaling-laravel-apis.mp3',
                    'duration_in_minutes' => 45
                ]
            );
        }
    }
}
