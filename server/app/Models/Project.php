<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = ['owner_id', 'title', 'description', 'visibility'];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function members()
{
    return $this->belongsToMany(User::class, 'project_members', 'project_id', 'user_id')
        ->withPivot('role_in_project');
}

    public function files()
    {
        return $this->hasMany(File::class);
    }

    public function feedback()
    {
        return $this->hasMany(Feedback::class);
    }

    public function invitations()
    {
        return $this->hasMany(ProjectInvitation::class);
    }
}
