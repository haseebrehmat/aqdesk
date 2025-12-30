<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEventRequest extends FormRequest
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
            'webinar_url' => ['required', 'url'],
            'scheduled_at' => ['required', 'date', 'after:now'],
            'ends_at' => ['nullable', 'date', 'after:scheduled_at'],
            'max_attendees' => ['nullable', 'integer', 'min:1', 'max:100000'],
        ];
    }
}
