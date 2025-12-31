<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Opportunity extends Model
{
    protected $appends = [
        'accepts_applications',
    ];

    protected $fillable = [
        'posted_by',
        'title',
        'company_name',
        'location',
        'job_type',
        'description',
        'application_deadline',
        'status',
    ];

    protected $casts = [
        'application_deadline' => 'datetime',
    ];

    public function employer()
    {
        return $this->belongsTo(User::class, 'posted_by');
    }

    public function applications()
    {
        return $this->hasMany(Application::class);
    }

    public function getAcceptsApplicationsAttribute(): bool
    {
        return $this->status === 'Published'
            && ($this->application_deadline === null || $this->application_deadline->isFuture());
    }
}
