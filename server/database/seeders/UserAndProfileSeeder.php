<?php

namespace Database\Seeders;

use App\Models\Profile;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserAndProfileSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminRole = Role::where('role_name', 'Admin')->first();
        $expertRole = Role::where('role_name', 'Expert')->first();
        $userRole = Role::where('role_name', 'Standard User')->first();

        // 1. Admin User
        $admin = User::firstOrCreate(
            ['email' => 'admin@aqdesk.site'],
            [
                'role_id' => $adminRole ? $adminRole->id : 4,
                'name' => 'System Administrator',
                'password' => Hash::make('AdminPassword123!'),
            ]
        );
        Profile::firstOrCreate(['user_id' => $admin->id], [
            'bio' => 'Platform administrator overseeing system operations and moderation.',
            'skills_tags' => 'DevOps, Laravel, Security, MySQL'
        ]);

        // 2. Expert Consultant User
        $expert = User::firstOrCreate(
            ['email' => 'abdullah.qamar@aqdesk.site'],
            [
                'role_id' => $expertRole ? $expertRole->id : 3,
                'name' => 'Mr. Abdullah Qamar',
                'password' => Hash::make('ExpertPassword123!'),
            ]
        );
        Profile::firstOrCreate(['user_id' => $expert->id], [
            'bio' => 'Senior Engineering Consultant specializing in database normalization and system architecture.',
            'skills_tags' => 'System Design, Database Optimization, Enterprise Architecture'
        ]);

        // 3. Standard Student User
        $student = User::firstOrCreate(
            ['email' => 'student@vu.edu.pk'],
            [
                'role_id' => $userRole ? $userRole->id : 2,
                'name' => 'Hamza Ali',
                'password' => Hash::make('StudentPassword123!'),
            ]
        );
        Profile::firstOrCreate(['user_id' => $student->id], [
            'bio' => 'Full-stack software developer and student completing university capstone requirements.',
            'skills_tags' => 'Laravel, React, Tailwind CSS, Inertia.js'
        ]);
    }
}
