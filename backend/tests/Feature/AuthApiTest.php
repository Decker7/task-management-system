<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);
    }

    #[Test]
    public function it_can_login_with_valid_credentials(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'user' => ['id', 'name', 'email'],
                'token',
            ]);
    }

    #[Test]
    public function it_rejects_invalid_credentials(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    #[Test]
    public function it_validates_login_fields(): void
    {
        $response = $this->postJson('/api/login', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'password']);
    }

    #[Test]
    public function it_can_logout(): void
    {
        $loginResponse = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        $token = $loginResponse->json('token');

        $response = $this->withToken($token)->postJson('/api/logout');
        $response->assertStatus(200)
            ->assertJson(['message' => 'Logged out successfully.']);

        // Verify the token has been revoked from the database
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    #[Test]
    public function it_can_get_authenticated_user(): void
    {
        $loginResponse = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        $token = $loginResponse->json('token');

        $response = $this->withToken($token)->getJson('/api/me');

        $response->assertStatus(200)
            ->assertJson([
                'user' => [
                    'email' => 'test@example.com',
                ],
            ]);
    }
}
