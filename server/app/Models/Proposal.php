<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Proposal extends Model
{
    protected $fillable = [
        'consultation_id',
        'terms',
        'budget',
    ];

    public function consultation()
    {
        return $this->belongsTo(Consultation::class);
    }
}
