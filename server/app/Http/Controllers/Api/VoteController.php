<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\Answer;
use App\Models\Vote;
use Illuminate\Http\Request;

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
        $existingVote = $model->votes()->where('user_id', $userId)->first();

        if ($existingVote) {
            if ($existingVote->vote_type === $type) {
                $existingVote->delete(); // Remove vote if clicked again
            } else {
                $existingVote->update(['vote_type' => $type]); // Switch vote direction
            }
        } else {
            $model->votes()->create([
                'user_id' => $userId,
                'vote_type' => $type,
            ]);
        }

        return response()->json([
            'net_votes' => $model->votes()->sum('vote_type'),
            'user_vote' => $model->votes()->where('user_id', $userId)->value('vote_type') ?? 0,
        ]);
    }
}