<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\CommunityUpdate;
use App\Models\Newsletter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;

class NewsletterController extends Controller
{
    public function subscribe(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|max:255',
            'cohort' => ['nullable', Rule::in(['General', 'AI', 'Web Development', 'EdTech', 'Internet Governance'])],
        ]);
        $subscriber = Newsletter::updateOrCreate(
            ['email' => strtolower($validated['email'])],
            ['is_active' => true, 'cohort' => $validated['cohort'] ?? 'General'],
        );

        return response()->json([
            'message' => 'You are subscribed to AQDesk community updates.',
            'subscriber' => $subscriber,
        ], $subscriber->wasRecentlyCreated ? 201 : 200);
    }

    public function index()
    {
        return response()->json(Newsletter::latest()->paginate(25));
    }

    public function broadcast(Request $request)
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:150',
            'body' => 'required|string|min:10|max:10000',
            'cohort' => ['nullable', Rule::in(['All', 'General', 'AI', 'Web Development', 'EdTech', 'Internet Governance'])],
        ]);

        $cohort = $validated['cohort'] ?? 'All';
        $subscribers = Newsletter::where('is_active', true)
            ->when($cohort !== 'All', fn ($query) => $query->where('cohort', $cohort))
            ->get(['email']);
        foreach ($subscribers as $subscriber) {
            Mail::to($subscriber->email)->queue(
                new CommunityUpdate($validated['subject'], $validated['body'])
            );
        }

        return response()->json([
            'message' => 'Community update queued successfully.',
            'queued_recipients' => $subscribers->count(),
            'cohort' => $cohort,
        ]);
    }
}
