<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Consultation extends Model
{
    protected $fillable = ['client_id', 'expert_id', 'booking_slot', 'status'];

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function expert()
    {
        return $this->belongsTo(User::class, 'expert_id');
    }

    public function proposal()
    {
        return $this->hasOne(Proposal::class);
    }
}
