<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function summary(Request $request)
    {
        $user = $request->user();
        $monthStarts = collect(range(5, 0))->map(
            fn (int $offset) => now()->startOfMonth()->subMonths($offset)
        );
        $from = $monthStarts->first();

        $questionCounts = $user->questions()
            ->where('created_at', '>=', $from)
            ->get(['created_at'])
            ->countBy(fn ($question) => $question->created_at->format('Y-m'));
        $answerCounts = $user->answers()
            ->where('created_at', '>=', $from)
            ->get(['created_at'])
            ->countBy(fn ($answer) => $answer->created_at->format('Y-m'));

        return response()->json([
            'stats' => [
                'workspaces' => Project::query()
                    ->where('owner_id', $user->id)
                    ->orWhereHas('members', fn ($query) => $query->where('users.id', $user->id))
                    ->count(),
                'questions' => $user->questions()->count(),
                'answers' => $user->answers()->count(),
                'applications' => $user->jobApplications()->count(),
            ],
            'activity' => $monthStarts->map(function ($month) use ($questionCounts, $answerCounts) {
                $key = $month->format('Y-m');

                return [
                    'label' => $month->format('M'),
                    'questions' => (int) ($questionCounts[$key] ?? 0),
                    'answers' => (int) ($answerCounts[$key] ?? 0),
                ];
            })->values(),
        ]);
    }
}
