<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['role_id', 'name', 'email', 'password', 'is_active'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function profile()
    {
        return $this->hasOne(Profile::class);
    }

    public function questions()
    {
        return $this->hasMany(Question::class);
    }

    public function answers()
    {
        return $this->hasMany(Answer::class);
    }

    public function projects()
    {
        return $this->hasMany(Project::class, 'owner_id');
    }

    public function joinedProjects()
    {
        return $this->belongsToMany(Project::class, 'project_members')->withPivot('role_in_project');
    }

    public function postedOpportunities()
    {
        return $this->hasMany(Opportunity::class, 'posted_by');
    }

    public function jobApplications()
    {
        return $this->hasMany(Application::class, 'user_id');
    }

    public function hostedEvents()
    {
        return $this->hasMany(Event::class, 'creator_id');
    }

    public function podcasts()
    {
        return $this->hasMany(Podcast::class, 'expert_id');
    }

    public function availabilitySlots()
    {
        return $this->hasMany(ExpertAvailability::class, 'expert_id');
    }
}
