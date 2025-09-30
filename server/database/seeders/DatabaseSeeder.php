<?php

namespace Database\Seeders;

use App\Models\Profile;
use App\Models\Role;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            TagSeeder::class,
            UserAndProfileSeeder::class,
            QuestionAndAnswerSeeder::class,
            ProjectAndWorkspaceSeeder::class,
            OpportunityAndEventSeeder::class,
        ]);
    }
}