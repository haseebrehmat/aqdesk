<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePodcastRequest;
use App\Models\Podcast;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PodcastController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $podcasts = Podcast::with('expert')
            ->when($request->expert_id, fn($q, $id) => $q->where('expert_id', $id))
            ->latest()
            ->paginate(10);

        return response()->json($podcasts);
    }

    public function store(StorePodcastRequest $request): JsonResponse
    {
        $data = $request->safe()->except('audio');

        if ($request->hasFile('audio')) {
            $data['audio_path'] = $request->file('audio')->store('podcasts/audio', 'public');
        }
        if (! empty($data['duration_in_seconds'])) {
            $data['duration_in_minutes'] = (int) ceil($data['duration_in_seconds'] / 60);
        }

        $podcast = $request->user()->podcasts()->create($data);

        return response()->json([
            'message' => 'Podcast published successfully.',
            'data' => $podcast->load('expert'),
        ], 201);
    }

    public function show(Podcast $podcast): JsonResponse
    {
        return response()->json($podcast->load('expert'));
    }

    /** Stream the uploaded MP3 (supports Range requests so seeking works). */
    public function audio(Podcast $podcast)
    {
        abort_unless($podcast->audio_path && Storage::disk('public')->exists($podcast->audio_path), 404);

        return response()->file(Storage::disk('public')->path($podcast->audio_path), [
            'Content-Type' => 'audio/mpeg',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    public function destroy(Request $request, Podcast $podcast): JsonResponse
    {
        // Optional authorization check
        if ($podcast->expert_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($podcast->audio_path) {
            Storage::disk('public')->delete($podcast->audio_path);
        }
        $podcast->delete();

        return response()->json(['message' => 'Podcast deleted successfully.']);
    }
}