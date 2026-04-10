<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class TaskApiTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private string $token;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);

        $this->token = $this->user->createToken('test-token')->plainTextToken;
    }

    #[Test]
    public function it_requires_authentication_for_tasks(): void
    {
        $response = $this->getJson('/api/tasks');
        $response->assertStatus(401);
    }

    #[Test]
    public function it_can_list_tasks(): void
    {
        Task::create(['title' => 'Task 1', 'status' => 'pending']);
        Task::create(['title' => 'Task 2', 'status' => 'completed']);

        $response = $this->withToken($this->token)->getJson('/api/tasks');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'title', 'description', 'status', 'created_at', 'updated_at'],
                ],
                'current_page',
                'last_page',
                'per_page',
                'total',
            ]);
    }

    #[Test]
    public function it_can_filter_tasks_by_status(): void
    {
        Task::create(['title' => 'Pending Task', 'status' => 'pending']);
        Task::create(['title' => 'Completed Task', 'status' => 'completed']);

        $response = $this->withToken($this->token)->getJson('/api/tasks?status=pending');

        $response->assertStatus(200);
        $this->assertEquals(1, $response->json('total'));
        $this->assertEquals('Pending Task', $response->json('data.0.title'));
    }

    #[Test]
    public function it_can_create_a_task(): void
    {
        $response = $this->withToken($this->token)->postJson('/api/tasks', [
            'title' => 'New Task',
            'description' => 'A test task description',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Task created successfully.',
                'task' => [
                    'title' => 'New Task',
                    'description' => 'A test task description',
                    'status' => 'pending',
                ],
            ]);

        $this->assertDatabaseHas('tasks', ['title' => 'New Task']);
    }

    #[Test]
    public function it_validates_required_title(): void
    {
        $response = $this->withToken($this->token)->postJson('/api/tasks', [
            'description' => 'No title provided',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title']);
    }

    #[Test]
    public function it_prevents_duplicate_tasks(): void
    {
        Task::create(['title' => 'Existing Task', 'status' => 'pending']);

        $response = $this->withToken($this->token)->postJson('/api/tasks', [
            'title' => 'Existing Task',
        ]);

        $response->assertStatus(422);
    }

    #[Test]
    public function it_can_update_a_task(): void
    {
        $task = Task::create(['title' => 'Original Title', 'status' => 'pending']);

        $response = $this->withToken($this->token)->putJson("/api/tasks/{$task->id}", [
            'title' => 'Updated Title',
            'status' => 'completed',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Task updated successfully.',
                'task' => [
                    'title' => 'Updated Title',
                    'status' => 'completed',
                ],
            ]);
    }

    #[Test]
    public function it_can_delete_a_task(): void
    {
        $task = Task::create(['title' => 'To Delete', 'status' => 'pending']);

        $response = $this->withToken($this->token)->deleteJson("/api/tasks/{$task->id}");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Task deleted successfully.']);

        $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
    }

    #[Test]
    public function it_returns_404_for_nonexistent_task(): void
    {
        $response = $this->withToken($this->token)->getJson('/api/tasks/999');
        $response->assertStatus(404);
    }

    #[Test]
    public function it_paginates_results(): void
    {
        for ($i = 1; $i <= 20; $i++) {
            Task::create(['title' => "Task $i", 'status' => 'pending']);
        }

        $response = $this->withToken($this->token)->getJson('/api/tasks?per_page=5');

        $response->assertStatus(200);
        $this->assertEquals(5, count($response->json('data')));
        $this->assertEquals(20, $response->json('total'));
        $this->assertEquals(4, $response->json('last_page'));
    }
}
