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

    public function test_authors_cannot_vote_on_their_own_question_or_answer(): void
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
            ->assertUnprocessable();
        $this->actingAs($author, 'sanctum')
            ->postJson('/api/answers/' . $answer->id . '/vote', ['type' => 1])
            ->assertUnprocessable();
        $this->assertDatabaseCount('votes', 0);
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
}
