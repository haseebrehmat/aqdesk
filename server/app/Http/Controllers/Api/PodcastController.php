<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePodcastRequest;
use App\Models\Podcast;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
        $podcast = $request->user()->podcasts()->create($request->validated());

        return response()->json([
            'message' => 'Podcast published successfully.',
            'data' => $podcast->load('expert'),
        ], 201);
    }

    public function show(Podcast $podcast): JsonResponse
    {
        return response()->json($podcast->load('expert'));
    }

    public function destroy(Request $request, Podcast $podcast): JsonResponse
    {
        // Optional authorization check
        if ($podcast->expert_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $podcast->delete();

        return response()->json(['message' => 'Podcast deleted successfully.']);
    }
}