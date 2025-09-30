<?php

namespace Database\Seeders;

use App\Models\Answer;
use App\Models\Question;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class QuestionAndAnswerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $student = User::where('email', 'student@vu.edu.pk')->first();
        $expert = User::where('email', 'abdullah.qamar@aqdesk.site')->first();
        $tagWeb = Tag::where('tag_name', 'Web Development')->first();
        $tagLaravel = Tag::where('tag_name', 'Laravel')->first();

        if ($student) {
            $title = 'How to resolve API state synchronization error in unified routing?';
            $question = Question::firstOrCreate(
                ['slug' => Str::slug($title)],
                [
                    'user_id' => $student->id,
                    'title' => $title,
                    'body' => 'When issuing PUT requests across multi-role layouts, the response header sometimes drops the JWT bearer token causing fallback errors.',
                    'views' => 142
                ]
            );

            // Attach tags
            if ($tagWeb && $tagLaravel) {
                $question->tags()->syncWithoutDetaching([$tagWeb->id, $tagLaravel->id]);
            }

            // Seed an expert answer
            if ($expert) {
                Answer::firstOrCreate(
                    [
                        'question_id' => $question->id,
                        'user_id' => $expert->id,
                    ],
                    [
                        'body' => 'Ensure your Axios HTTP client interceptors correctly attach the Authorization Bearer token on every state refresh cycle.',
                        'is_accepted' => true,
                    ]
                );
            }
        }
    }
}
