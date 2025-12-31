<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tag;

class TagController extends Controller
{
    public function index()
    {
        return response()->json(
            Tag::withCount([
                'questions' => fn ($query) => $query->where('is_hidden', false),
            ])->orderByDesc('questions_count')->orderBy('tag_name')->get()
        );
    }
}
