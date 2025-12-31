<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExpertAvailability extends Model
{
    protected $fillable = ['expert_id', 'starts_at', 'ends_at'];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
        ];
    }

    public function expert()
    {
        return $this->belongsTo(User::class, 'expert_id');
    }
}
