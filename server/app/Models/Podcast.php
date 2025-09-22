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
        'cover_image_url',
        'duration_in_minutes',
    ];

    protected $casts = [
        'duration_in_minutes' => 'integer',
    ];

    public function expert(): BelongsTo
    {
        return $this->belongsTo(User::class, 'expert_id');
    }
}
