<?php

namespace Database\Seeders;

use App\Models\File;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProjectAndWorkspaceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $student = User::where('email', 'student@vu.edu.pk')->first();
        $expert = User::where('email', 'abdullah.qamar@aqdesk.site')->first();

        if ($student) {
            $project = Project::firstOrCreate(
                ['title' => 'Emerging Tech Research Group'],
                [
                    'owner_id' => $student->id,
                    'description' => 'Central laboratory repository for Software Requirements Specification drafts and prototype testing.',
                    'visibility' => 'Public'
                ]
            );

            // Attach Owner to Project Members
            ProjectMember::firstOrCreate([
                'project_id' => $project->id,
                'user_id' => $student->id,
            ], [
                'role_in_project' => 'Owner'
            ]);

            // Attach Expert as Collaborator if available
            if ($expert) {
                ProjectMember::firstOrCreate([
                    'project_id' => $project->id,
                    'user_id' => $expert->id,
                ], [
                    'role_in_project' => 'Collaborator'
                ]);
            }

            // Seed sample file asset
            File::firstOrCreate(
                ['file_name' => 'srs_documentation.pdf', 'project_id' => $project->id],
                [
                    'uploaded_by' => $student->id,
                    'file_path' => 'storage/workspaces/srs_documentation.pdf'
                ]
            );
        }
    }
}
