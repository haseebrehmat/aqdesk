<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Answer;
use App\Models\Question;
use App\Models\Tag;
use App\Models\Vote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class QuestionController extends Controller
{
    // Index with Pagination
    public function index()
    {
        $questions = Question::with(['user', 'tags'])
            ->where('is_hidden', false)
            ->withCount(['answers', 'votes as net_votes' => function ($q) {
                $q->select(DB::raw('COALESCE(SUM(vote_type), 0)'));
            }])
            ->latest()
            ->paginate(10);

        return response()->json($questions);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|min:10|max:255',
            'body' => 'required|string|min:20',
            'tags' => 'nullable|array|max:5',
            'tags.*' => 'integer|distinct|exists:tags,id',
            'custom_tags' => 'nullable|string',
        ]);

        $tagIds = $this->resolveTagIds($validated['tags'] ?? [], $validated['custom_tags'] ?? null);
        if (count($tagIds) > 5) {
            throw ValidationException::withMessages([
                'tags' => ['A question may have at most five tags.'],
            ]);
        }

        $question = DB::transaction(function () use ($request, $validated, $tagIds) {
            $question = Question::create([
                'user_id' => $request->user()->id,
                'title' => $validated['title'],
                'body' => $validated['body'],
                'slug' => Str::slug($validated['title']).'-'.Str::lower(Str::random(8)),
            ]);

            $question->tags()->sync($tagIds);

            return $question;
        });

        return response()->json([
            'message' => 'Question created successfully',
            'question' => $question->load(['user', 'tags']),
        ], 201);
    }

    // Show with View Count Increment
    public function show(Request $request, $slug)
    {
        $question = Question::where('slug', $slug)->where('is_hidden', false)->firstOrFail();
        $question->increment('views');

        $question->load([
            'user',
            'tags',
            'answers' => fn ($q) => $q->where('is_hidden', false)->with('user')->withCount(['votes as net_votes' => fn ($v) => $v->select(DB::raw('COALESCE(SUM(vote_type), 0)'))]),
        ]);

        $userId = $request->user('sanctum')?->id;
        $answerUserVotes = $userId
            ? Vote::query()
                ->where('user_id', $userId)
                ->where('votable_type', Answer::class)
                ->whereIn('votable_id', $question->answers->pluck('id'))
                ->pluck('vote_type', 'votable_id')
            : collect();

        $question->answers->each(function (Answer $answer) use ($answerUserVotes): void {
            $answer->setAttribute('user_vote', (int) ($answerUserVotes[$answer->id] ?? 0));
        });

        $questionData = $question->toArray();
        $questionData['net_votes'] = (int) $question->votes()->sum('vote_type');
        $questionData['user_vote'] = $userId ? (int) ($question->votes()->where('user_id', $userId)->value('vote_type') ?? 0) : 0;

        return response()->json($questionData);
    }

    // Lookup by slug instead of ID
    public function update(Request $request, $slug)
    {
        $question = Question::where('slug', $slug)->firstOrFail();

        if ($question->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized action.'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|min:10|max:255',
            'body' => 'required|string|min:20',
            'tags' => 'nullable|array|max:5',
            'tags.*' => 'integer|distinct|exists:tags,id',
            'custom_tags' => 'nullable|string',
        ]);

        $question->update([
            'title' => $validated['title'],
            'body' => $validated['body'],
            'slug' => Str::slug($validated['title']).'-'.time(),
        ]);

        $tagIds = $this->resolveTagIds($validated['tags'] ?? [], $validated['custom_tags'] ?? null);
        if (count($tagIds) > 5) {
            throw ValidationException::withMessages([
                'tags' => ['A question may have at most five tags.'],
            ]);
        }
        $question->tags()->sync($tagIds);

        return response()->json([
            'message' => 'Question updated successfully',
            'question' => $question->load(['user', 'tags']),
        ]);
    }

    // Lookup by slug instead of ID
    public function destroy(Request $request, $slug)
    {
        $question = Question::where('slug', $slug)->firstOrFail();

        if ($question->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized action.'], 403);
        }

        $question->delete();

        return response()->json(['message' => 'Question deleted successfully']);
    }

    private function resolveTagIds(array $existingIds, ?string $customTags): array
    {
        $tagIds = $existingIds;

        if ($customTags) {
            $rawTags = array_map('trim', explode(',', $customTags));
            foreach ($rawTags as $tagName) {
                if (! empty($tagName)) {
                    $tag = Tag::firstOrCreate(['tag_name' => $tagName]);
                    $tagIds[] = $tag->id;
                }
            }
        }

        return array_unique($tagIds);
    }
}
