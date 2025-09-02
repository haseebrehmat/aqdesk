<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    protected $fillable = ['tag_name'];

    public function questions()
    {
        return $this->belongsToMany(Question::class, 'question_tag');
    }
}
