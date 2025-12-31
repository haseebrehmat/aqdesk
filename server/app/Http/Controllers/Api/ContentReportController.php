<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Answer;
use App\Models\ContentReport;
use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ContentReportController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'reportable_type' => ['required', Rule::in(['question', 'answer'])],
            'reportable_id' => 'required|integer|min:1',
            'reason' => 'required|string|min:10|max:1000',
        ]);
        $this->target($validated['reportable_type'], $validated['reportable_id']);

        $report = ContentReport::firstOrCreate([
            'reporter_id' => $request->user()->id,
            'reportable_type' => $validated['reportable_type'],
            'reportable_id' => $validated['reportable_id'],
            'status' => 'Pending',
        ], ['reason' => $validated['reason']]);

        return response()->json([
            'message' => $report->wasRecentlyCreated ? 'Content reported for review.' : 'You already reported this content.',
            'report' => $report,
        ], $report->wasRecentlyCreated ? 201 : 200);
    }

    public function index()
    {
        return response()->json(ContentReport::with(['reporter', 'reviewer'])->latest()->paginate(25));
    }

    public function moderate(Request $request, ContentReport $report)
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['Resolved', 'Dismissed'])],
            'action' => ['required', Rule::in(['none', 'hide', 'restore', 'delete'])],
        ]);
        $target = $this->target($report->reportable_type, $report->reportable_id);

        match ($validated['action']) {
            'hide' => $target->update(['is_hidden' => true]),
            'restore' => $target->update(['is_hidden' => false]),
            'delete' => $target->delete(),
            default => null,
        };
        $report->update([
            'status' => $validated['status'],
            'reviewed_by' => $request->user()->id,
            'resolved_at' => now(),
        ]);

        return response()->json(['message' => 'Report reviewed.', 'report' => $report->load('reviewer')]);
    }

    private function target(string $type, int $id): Question|Answer
    {
        return match ($type) {
            'question' => Question::findOrFail($id),
            'answer' => Answer::findOrFail($id),
        };
    }
}
