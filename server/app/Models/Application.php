<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    protected $fillable = [
        'opportunity_id',
        'user_id',
        'applicant_name',
        'applicant_email',
        'resume_path',
        'status',
    ];

    public function opportunity()
    {
        return $this->belongsTo(Opportunity::class);
    }

    public function applicant()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
