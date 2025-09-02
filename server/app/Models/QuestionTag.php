<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuestionTag extends Model
{
    protected $table = 'question_tags';
    public $timestamps = false;
    public $incrementing = false; 

    protected $fillable = [
        'question_id',
        'tag_id',
    ];

    public function question()
    {
        return $this->belongsTo(Question::class);
    }

    public function tag()
    {
        return $this->belongsTo(Tag::class);
    }
}