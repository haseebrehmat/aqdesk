<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Opportunity extends Model
{
    protected $fillable = [
        'posted_by',
        'title',
        'company_name',
        'location',
        'job_type',
        'description',
        'status',
    ];

    public function employer()
    {
        return $this->belongsTo(User::class, 'posted_by');
    }

    public function applications()
    {
        return $this->hasMany(Application::class);
    }
}
