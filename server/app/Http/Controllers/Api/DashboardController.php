<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Answer;
use App\Models\Application;
use App\Models\Project;
use App\Models\Question;
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

        $isAdmin = strtolower((string) $user->load('role')->role?->role_name) === 'admin';

        // Admins see platform-wide numbers; everyone else sees their own.
        $questions = $isAdmin ? Question::query() : $user->questions();
        $answers = $isAdmin ? Answer::query() : $user->answers();
        $applications = $isAdmin ? Application::query() : $user->jobApplications();
        $workspaces = $isAdmin
            ? Project::query()
            : Project::query()
                ->where('owner_id', $user->id)
                ->orWhereHas('members', fn ($query) => $query->where('users.id', $user->id));

        $questionCounts = (clone $questions)
            ->where('created_at', '>=', $from)
            ->get(['created_at'])
            ->countBy(fn ($question) => $question->created_at->format('Y-m'));
        $answerCounts = (clone $answers)
            ->where('created_at', '>=', $from)
            ->get(['created_at'])
            ->countBy(fn ($answer) => $answer->created_at->format('Y-m'));

        return response()->json([
            'scope' => $isAdmin ? 'all' : 'self',
            'stats' => [
                'workspaces' => $workspaces->count(),
                'questions' => (clone $questions)->count(),
                'answers' => (clone $answers)->count(),
                'applications' => $applications->count(),
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
