<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Podcast extends Model
{
    protected $fillable = [
        'expert_id',
        'title',
        'description',
        'media_url',
        'audio_path',
        'duration_in_seconds',
        'cover_image_url',
        'duration_in_minutes',
    ];

    protected $appends = ['audio_url'];

    protected $hidden = ['audio_path'];

    protected $casts = [
        'duration_in_seconds' => 'integer',
        'duration_in_minutes' => 'integer',
    ];

    public function expert(): BelongsTo
    {
        return $this->belongsTo(User::class, 'expert_id');
    }

    /** Playable URL: uploaded files stream through the API, otherwise the external URL. */
    public function getAudioUrlAttribute(): ?string
    {
        return $this->audio_path ? "/api/podcasts/{$this->id}/audio" : $this->media_url;
    }
}
