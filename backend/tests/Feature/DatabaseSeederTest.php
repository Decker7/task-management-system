<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class DatabaseSeederTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function it_seeds_the_demo_user_and_task_board(): void
    {
        $this->seed();

        $this->assertDatabaseHas('users', [
            'email' => 'admin@example.com',
            'name' => 'Admin User',
        ]);

        $this->assertSame(10, Task::count());
        $this->assertSame(3, Task::where('status', Task::STATUS_COMPLETED)->count());
        $this->assertSame(7, Task::where('status', Task::STATUS_PENDING)->count());
    }

    #[Test]
    public function demo_user_can_login_after_seeding(): void
    {
        $this->seed();

        $response = $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'password',
        ]);

        $response->assertOk()
            ->assertJsonPath('user.email', 'admin@example.com')
            ->assertJsonStructure(['token']);
    }

    #[Test]
    public function seeding_is_idempotent_for_local_refreshes(): void
    {
        $this->seed();
        $this->seed();

        $this->assertSame(1, User::where('email', 'admin@example.com')->count());
        $this->assertSame(10, Task::count());
    }
}
