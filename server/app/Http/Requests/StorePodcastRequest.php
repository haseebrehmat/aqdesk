<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePodcastRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'audio' => ['required_without:media_url', 'file', 'mimes:mp3,mpga', 'max:102400'],
            'media_url' => ['nullable', 'url'],
            'duration_in_seconds' => ['nullable', 'integer', 'min:1', 'max:86400'],
            'cover_image_url' => ['nullable', 'url'],
            'duration_in_minutes' => ['nullable', 'integer', 'min:1'],
        ];
    }
}