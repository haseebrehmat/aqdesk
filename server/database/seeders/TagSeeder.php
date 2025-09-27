<?php

namespace Database\Seeders;

use App\Models\Tag;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TagSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tags = [
            ['tag_name' => 'Web Development'],
            ['tag_name' => 'Artificial Intelligence'],
            ['tag_name' => 'Educational Tech'],
            ['tag_name' => 'Laravel'],
            ['tag_name' => 'React.js'],
            ['tag_name' => 'Database Optimization'],
            ['tag_name' => 'UI/UX Accessibility'],
        ];

        foreach ($tags as $tag) {
            Tag::firstOrCreate(['tag_name' => $tag['tag_name']]);
        }
    }
}
