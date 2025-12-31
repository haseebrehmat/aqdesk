<?php

namespace Database\Seeders;

use App\Models\Answer;
use App\Models\Event;
use App\Models\Opportunity;
use App\Models\Podcast;
use App\Models\Profile;
use App\Models\Project;
use App\Models\Question;
use App\Models\Role;
use App\Models\Tag;
use App\Models\User;
use App\Models\Vote;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoContentSeeder extends Seeder
{
    public function run(): void
    {
        $memberRole = Role::firstOrCreate(['role_name' => 'Standard User']);
        $expertRole = Role::firstOrCreate(['role_name' => 'Expert']);
        $names = [
            'Aisha Khan', 'Bilal Ahmed', 'Fatima Noor', 'Usman Tariq',
            'Sara Malik', 'Zain Raza', 'Hira Saleem', 'Omar Farooq',
            'Mariam Iqbal', 'Ali Hassan', 'Noor Javed', 'Daniyal Shah',
        ];
        $users = collect($names)->map(function (string $name, int $index) use ($memberRole, $expertRole) {
            $isExpert = in_array($index, [2, 5, 8, 11], true);
            $user = User::updateOrCreate(
                ['email' => sprintf('demo%02d@aqdesk.test', $index + 1)],
                [
                    'role_id' => $isExpert ? $expertRole->id : $memberRole->id,
                    'name' => $name,
                    'password' => Hash::make('DemoPassword123!'),
                    'is_active' => true,
                ]
            );
            Profile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'bio' => $isExpert ? 'Software engineering mentor and industry practitioner.' : 'Student developer exploring modern web engineering.',
                    'professional_position' => $isExpert ? 'Senior Software Engineer' : 'Software Engineering Student',
                    'skills_tags' => $isExpert ? 'Architecture, Cloud, Mentoring' : 'Laravel, React, Databases',
                ]
            );

            return $user;
        });

        $tagNames = [
            'Laravel', 'React.js', 'PHP', 'JavaScript', 'TypeScript', 'MySQL',
            'Docker', 'Accessibility', 'API Design', 'Testing', 'DevOps',
            'Artificial Intelligence', 'Cloud Computing', 'Cybersecurity',
            'Mobile Development', 'Career Advice',
        ];
        $tags = collect($tagNames)->mapWithKeys(function (string $name) {
            $tag = Tag::firstOrCreate(['tag_name' => $name]);

            return [$name => $tag];
        })->values();

        $topics = [
            'Laravel queue retries', 'React state synchronization', 'API pagination strategy',
            'Docker development workflow', 'Accessible form validation', 'MySQL query indexing',
            'TypeScript domain models', 'Automated integration testing', 'Secure OAuth callbacks',
            'Cloud deployment architecture', 'Background job monitoring', 'Mobile API authentication',
        ];
        $questions = collect();
        for ($index = 1; $index <= 48; $index++) {
            $topic = $topics[($index - 1) % count($topics)];
            $author = $users[($index - 1) % $users->count()];
            $question = Question::updateOrCreate(
                ['slug' => sprintf('demo-discussion-%02d', $index)],
                [
                    'user_id' => $author->id,
                    'title' => sprintf('%s: recommended approach for project %02d?', $topic, $index),
                    'body' => sprintf('I am testing %s in a realistic team project. What implementation, validation, and monitoring practices would you recommend?', strtolower($topic)),
                    'views' => 30 + ($index * 17) % 600,
                    'is_hidden' => false,
                ]
            );
            $question->forceFill([
                'created_at' => now()->subDays(($index * 3) % 170)->subHours($index % 12),
            ])->saveQuietly();
            $question->tags()->sync([
                $tags[($index - 1) % $tags->count()]->id,
                $tags[($index + 4) % $tags->count()]->id,
                $tags[($index + 9) % $tags->count()]->id,
            ]);

            for ($answerIndex = 1; $answerIndex <= (($index % 3) + 1); $answerIndex++) {
                $answerAuthor = $users[($index + $answerIndex) % $users->count()];
                $body = sprintf(
                    'Demo response %02d-%d: start with a small reproducible case, add automated coverage, and document the operational trade-offs.',
                    $index,
                    $answerIndex
                );
                $answer = Answer::updateOrCreate(
                    ['question_id' => $question->id, 'body' => $body],
                    [
                        'user_id' => $answerAuthor->id,
                        'is_accepted' => $answerIndex === 1 && $index % 2 === 0,
                        'is_hidden' => false,
                    ]
                );
                $answer->forceFill(['created_at' => $question->created_at->copy()->addHours($answerIndex * 4)])->saveQuietly();
            }

            foreach ($users->take(3 + ($index % 5)) as $voterIndex => $voter) {
                Vote::updateOrCreate(
                    ['user_id' => $voter->id, 'votable_type' => Question::class, 'votable_id' => $question->id],
                    ['vote_type' => ($index + $voterIndex) % 7 === 0 ? -1 : 1]
                );
            }
            $questions->push($question);
        }

        $jobTitles = [
            'Junior Laravel Developer', 'React Frontend Engineer', 'QA Automation Intern',
            'Cloud Support Associate', 'PHP API Developer', 'UI Accessibility Specialist',
            'DevOps Graduate Trainee', 'Data Engineering Intern',
        ];
        for ($index = 1; $index <= 24; $index++) {
            Opportunity::updateOrCreate(
                ['title' => sprintf('Demo %s %02d', $jobTitles[($index - 1) % count($jobTitles)], $index)],
                [
                    'posted_by' => $users[(($index - 1) % 4) * 3 + 2]->id,
                    'company_name' => sprintf('Northstar Technology %02d', (($index - 1) % 8) + 1),
                    'location' => $index % 3 === 0 ? 'Remote' : ($index % 2 === 0 ? 'Lahore' : 'Islamabad'),
                    'job_type' => $index % 4 === 0 ? 'Internship' : ($index % 3 === 0 ? 'Contract' : 'Full-Time'),
                    'description' => 'Join a collaborative engineering team building reliable, accessible web products with mentoring and structured code review.',
                    'application_deadline' => now()->addDays(14 + $index),
                    'status' => 'Published',
                ]
            );
        }

        $eventTopics = ['API Testing', 'React Performance', 'Database Indexing', 'Accessible UI', 'Cloud Deployment', 'Career Planning'];
        for ($index = 1; $index <= 18; $index++) {
            $startsAt = now()->addDays($index)->setTime(18 + ($index % 3), 0);
            Event::updateOrCreate(
                ['title' => sprintf('Demo Workshop: %s %02d', $eventTopics[($index - 1) % count($eventTopics)], $index)],
                [
                    'creator_id' => $users[(($index - 1) % 4) * 3 + 2]->id,
                    'description' => 'A practical live workshop with examples, guided exercises, and an audience question-and-answer session.',
                    'webinar_url' => sprintf('https://meet.example.com/aqdesk-demo-%02d', $index),
                    'scheduled_at' => $startsAt,
                    'ends_at' => $startsAt->copy()->addMinutes(90),
                    'max_attendees' => 25 + ($index * 5),
                    'status' => 'Scheduled',
                ]
            );
        }

        $podcastTopics = ['System Design', 'Testing Strategy', 'Developer Careers', 'Open Source', 'Web Accessibility', 'Cloud Engineering'];
        for ($index = 1; $index <= 18; $index++) {
            Podcast::updateOrCreate(
                ['title' => sprintf('Demo Podcast: %s Episode %02d', $podcastTopics[($index - 1) % count($podcastTopics)], $index)],
                [
                    'expert_id' => $users[(($index - 1) % 4) * 3 + 2]->id,
                    'description' => 'A focused conversation with engineers about practical lessons, common mistakes, and sustainable software delivery.',
                    'media_url' => sprintf('https://media.example.com/aqdesk/demo-episode-%02d.mp3', $index),
                    'cover_image_url' => null,
                    'duration_in_minutes' => 20 + ($index % 6) * 5,
                ]
            );
        }

        for ($index = 1; $index <= 12; $index++) {
            $owner = $users[($index - 1) % $users->count()];
            $project = Project::updateOrCreate(
                ['title' => sprintf('Demo Team Workspace %02d', $index)],
                [
                    'owner_id' => $owner->id,
                    'description' => 'A populated workspace for testing project collaboration, membership, files, and feedback.',
                    'visibility' => $index % 3 === 0 ? 'Private' : 'Public',
                ]
            );
            $project->members()->syncWithoutDetaching([
                $owner->id => ['role_in_project' => 'Owner'],
                $users[$index % $users->count()]->id => ['role_in_project' => 'Collaborator'],
            ]);
        }
    }
}
