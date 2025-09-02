<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Answer;
use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnswerController extends Controller
{
    public function store(Request $request, $slug)
    {
        $question = Question::where('slug', $slug)->firstOrFail();

        $validated = $request->validate([
            'body' => 'required|string|min:5',
        ]);

        $answer = $question->answers()->create([
            'user_id' => $request->user()->id,
            'body' => $validated['body'],
        ]);

        return response()->json([
            'message' => 'Answer submitted successfully',
            'answer' => $answer->load('user'),
        ], 201);
    }

    public function markAccepted(Request $request, $id)
{
    $answer = Answer::with('question')->findOrFail($id);

    if ($answer->question->user_id !== $request->user()->id) {
        return response()->json(['message' => 'Unauthorized action.'], 403);
    }

    $willBeAccepted = !$answer->is_accepted;

    DB::transaction(function () use ($answer, $willBeAccepted) {
        // Unmark all answers for this question
        Answer::where('question_id', $answer->question_id)->update(['is_accepted' => false]);

        // Toggle state for target answer
        if ($willBeAccepted) {
            $answer->update(['is_accepted' => true]);
        }
    });

    $answer->refresh();

    return response()->json([
        'message' => $willBeAccepted ? 'Marked as accepted solution' : 'Solution unmarked',
        'is_accepted' => $answer->is_accepted,
        'answer' => $answer,
    ]);
}
}