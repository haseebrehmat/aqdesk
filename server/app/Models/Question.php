<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    protected $fillable = ['user_id', 'title', 'body', 'slug', 'views'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function answers()
    {
        return $this->hasMany(Answer::class);
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'question_tags');
    }

    public function votes()
    {
        return $this->morphMany(Vote::class, 'votable');
    }

    public function getNetVotesAttribute()
    {
        return $this->votes()->sum('vote_type');
    }
}
