<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\CommunityUpdate;
use App\Models\Newsletter;
use App\Models\NewsletterCampaign;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;

class NewsletterController extends Controller
{
    private const COHORTS = ['All', 'General', 'AI', 'Web Development', 'EdTech', 'Internet Governance'];

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
            'cohort' => ['nullable', Rule::in(self::COHORTS)],
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

    public function campaigns()
    {
        return response()->json(NewsletterCampaign::with('creator')->latest()->get());
    }

    public function storeDraft(Request $request)
    {
        $validated = $this->campaignData($request);
        $campaign = NewsletterCampaign::create([
            ...$validated,
            'created_by' => $request->user()->id,
            'status' => 'Draft',
        ]);

        return response()->json(['message' => 'Campaign draft saved.', 'campaign' => $campaign], 201);
    }

    public function updateDraft(Request $request, NewsletterCampaign $campaign)
    {
        abort_if($campaign->status !== 'Draft', 422, 'Only draft campaigns can be edited.');
        $campaign->update($this->campaignData($request));

        return response()->json(['message' => 'Campaign draft updated.', 'campaign' => $campaign]);
    }

    public function sendDraft(NewsletterCampaign $campaign)
    {
        abort_if($campaign->status !== 'Draft', 422, 'This campaign has already been sent.');
        $subscribers = Newsletter::where('is_active', true)
            ->when($campaign->cohort !== 'All', fn ($query) => $query->where('cohort', $campaign->cohort))
            ->get(['email']);
        foreach ($subscribers as $subscriber) {
            Mail::to($subscriber->email)->queue(new CommunityUpdate($campaign->subject, $campaign->body));
        }
        $campaign->update([
            'status' => 'Sent',
            'sent_at' => now(),
            'queued_recipients' => $subscribers->count(),
        ]);

        return response()->json([
            'message' => 'Campaign queued successfully.',
            'campaign' => $campaign->fresh(),
            'queued_recipients' => $subscribers->count(),
        ]);
    }

    private function campaignData(Request $request): array
    {
        return $request->validate([
            'subject' => 'required|string|max:150',
            'body' => 'required|string|min:10|max:10000',
            'cohort' => ['required', Rule::in(self::COHORTS)],
        ]);
    }
}
