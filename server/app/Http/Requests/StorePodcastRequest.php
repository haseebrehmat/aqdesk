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
            'media_url' => ['required', 'url'],
            'cover_image_url' => ['nullable', 'url'],
            'duration_in_minutes' => ['nullable', 'integer', 'min:1'],
        ];
    }
}