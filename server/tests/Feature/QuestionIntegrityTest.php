<?php

namespace Tests\Feature;

use App\Models\Answer;
use App\Models\Question;
use App\Models\Role;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QuestionIntegrityTest extends TestCase
{
    use RefreshDatabase;

    private function member(): User
    {
        $role = Role::firstOrCreate(['role_name' => 'Standard User']);

        return User::create([
            'name' => 'Member ' . User::count(),
            'email' => 'member' . User::count() . '@example.com',
            'password' => 'strong-password',
            'role_id' => $role->id,
            'is_active' => true,
        ]);
    }

    public function test_authors_can_vote_on_their_own_question_and_answer(): void
    {
        $author = $this->member();
        $question = Question::create([
            'user_id' => $author->id,
            'title' => 'A sufficiently long question title',
            'body' => 'A sufficiently detailed question body for testing.',
            'slug' => 'self-vote-question',
        ]);
        $answer = Answer::create([
            'question_id' => $question->id,
            'user_id' => $author->id,
            'body' => 'A test answer.',
        ]);

        $this->actingAs($author, 'sanctum')
            ->postJson('/api/questions/self-vote-question/vote', ['type' => 1])
            ->assertOk()
            ->assertJsonPath('net_votes', 1)
            ->assertJsonPath('user_vote', 1);
        $this->actingAs($author, 'sanctum')
            ->postJson('/api/answers/' . $answer->id . '/vote', ['type' => -1])
            ->assertOk()
            ->assertJsonPath('net_votes', -1)
            ->assertJsonPath('user_vote', -1);
        $this->assertDatabaseCount('votes', 2);

        $this->getJson('/api/questions')
            ->assertOk()
            ->assertJsonPath('data.0.net_votes', 1);
    }

    public function test_question_creation_rejects_more_than_five_tags(): void
    {
        $author = $this->member();
        $tagIds = collect(range(1, 6))->map(
            fn (int $number) => Tag::create(['tag_name' => 'Tag ' . $number])->id
        )->all();

        $this->actingAs($author, 'sanctum')->postJson('/api/questions', [
            'title' => 'A question with too many selected tags',
            'body' => 'This question body is long enough to pass validation.',
            'tags' => $tagIds,
        ])->assertUnprocessable()->assertJsonValidationErrors('tags');

        $this->assertDatabaseCount('questions', 0);
    }

    public function test_public_question_responses_include_vote_and_answer_counts(): void
    {
        $author = $this->member();
        $responder = $this->member();
        $voter = $this->member();
        $question = Question::create([
            'user_id' => $author->id,
            'title' => 'A public question with voting information',
            'body' => 'The public feed and detail page should expose canonical counts.',
            'slug' => 'public-vote-counts',
        ]);
        $answer = Answer::create([
            'question_id' => $question->id,
            'user_id' => $responder->id,
            'body' => 'A publicly visible answer.',
        ]);

        $question->votes()->create(['user_id' => $voter->id, 'vote_type' => 1]);
        $answer->votes()->create(['user_id' => $voter->id, 'vote_type' => -1]);

        $this->getJson('/api/questions')
            ->assertOk()
            ->assertJsonPath('data.0.net_votes', 1)
            ->assertJsonPath('data.0.answers_count', 1);

        $this->actingAs($voter, 'sanctum')
            ->getJson('/api/questions/public-vote-counts')
            ->assertOk()
            ->assertJsonPath('answers.0.body', 'A publicly visible answer.')
            ->assertJsonPath('answers.0.net_votes', -1)
            ->assertJsonPath('answers.0.user_vote', -1);
    }
}
