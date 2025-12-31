<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Answer;
use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VoteController extends Controller
{
    public function voteQuestion(Request $request, $slug)
    {
        $request->validate(['type' => 'required|in:1,-1']);
        $question = Question::where('slug', $slug)->firstOrFail();

        return $this->handleVote($request->user()->id, $question, (int) $request->type);
    }

    public function voteAnswer(Request $request, $id)
    {
        $request->validate(['type' => 'required|in:1,-1']);
        $answer = Answer::findOrFail($id);

        return $this->handleVote($request->user()->id, $answer, (int) $request->type);
    }

    private function handleVote($userId, $model, int $type)
    {
        DB::transaction(function () use ($model, $userId, $type) {
            $existingVote = $model->votes()->where('user_id', $userId)->lockForUpdate()->first();

            if ($existingVote) {
                if ((int) $existingVote->vote_type === $type) {
                    $existingVote->delete();
                } else {
                    $existingVote->update(['vote_type' => $type]);
                }
            } else {
                $model->votes()->create([
                    'user_id' => $userId,
                    'vote_type' => $type,
                ]);
            }
        });

        return response()->json([
            'net_votes' => (int) $model->votes()->sum('vote_type'),
            'user_vote' => (int) ($model->votes()->where('user_id', $userId)->value('vote_type') ?? 0),
        ]);
    }
}
