<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Event extends Model
{
    protected $appends = [
        'is_full',
        'remaining_capacity',
    ];

    protected $fillable = [
        'creator_id',
        'title',
        'description',
        'webinar_url',
        'scheduled_at',
        'ends_at',
        'max_attendees',
        'status',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'ends_at' => 'datetime',
        'max_attendees' => 'integer',
    ];

    public function host(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function attendees(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'event_registrations')
            ->withTimestamps();
    }

    public function getIsFullAttribute(): bool
    {
        if ($this->max_attendees === null) {
            return false;
        }

        return $this->registeredAttendeeCount() >= $this->max_attendees;
    }

    public function getRemainingCapacityAttribute(): ?int
    {
        if ($this->max_attendees === null) {
            return null;
        }

        return max(0, $this->max_attendees - $this->registeredAttendeeCount());
    }

    private function registeredAttendeeCount(): int
    {
        if (array_key_exists('attendees_count', $this->attributes)) {
            return (int) $this->attributes['attendees_count'];
        }

        if ($this->relationLoaded('attendees')) {
            return $this->attendees->count();
        }

        return $this->attendees()->count();
    }
}
