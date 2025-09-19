<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class EventRegistration extends Pivot
{
    protected $table = 'event_registrations';

    protected $fillable = [
        'event_id',
        'user_id',
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}