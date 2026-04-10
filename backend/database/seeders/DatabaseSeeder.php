<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Task;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create default admin user
        User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => bcrypt('password'),
            ]
        );

        // Create sample tasks for demonstration
        $tasks = [
            [
                'title' => 'Set up project repository',
                'description' => 'Initialize Git repository and configure CI/CD pipeline for automated testing and deployment.',
                'status' => 'completed',
            ],
            [
                'title' => 'Design database schema',
                'description' => 'Create the ERD and define all table structures, relationships, and indexes for optimal query performance.',
                'status' => 'completed',
            ],
            [
                'title' => 'Implement user authentication',
                'description' => 'Build login/logout endpoints with token-based authentication using Laravel Sanctum.',
                'status' => 'completed',
            ],
            [
                'title' => 'Build REST API endpoints',
                'description' => 'Create CRUD API for task management with proper validation, error handling, and pagination.',
                'status' => 'pending',
            ],
            [
                'title' => 'Create frontend dashboard',
                'description' => 'Design and implement the main task list view with filtering, status updates, and responsive layout.',
                'status' => 'pending',
            ],
            [
                'title' => 'Add error handling',
                'description' => 'Implement comprehensive error handling with loading states, toast notifications, and form validation.',
                'status' => 'pending',
            ],
            [
                'title' => 'Performance optimization',
                'description' => 'Add database indexes, implement pagination, and optimize queries for large datasets.',
                'status' => 'pending',
            ],
            [
                'title' => 'Write unit tests',
                'description' => 'Create comprehensive test suite covering all API endpoints and edge cases.',
                'status' => 'pending',
            ],
            [
                'title' => 'Deploy to staging',
                'description' => 'Set up staging environment and deploy the application for QA testing.',
                'status' => 'pending',
            ],
            [
                'title' => 'Code review and documentation',
                'description' => 'Review all code changes, add inline documentation, and update the README with setup instructions.',
                'status' => 'pending',
            ],
        ];

        foreach ($tasks as $task) {
            Task::firstOrCreate(
                ['title' => $task['title'], 'status' => $task['status']],
                $task
            );
        }
    }
}
