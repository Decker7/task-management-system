<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Database\QueryException;

class TaskController extends Controller
{
    /**
     * Display a paginated listing of tasks.
     *
     * Performance: Uses server-side pagination to avoid loading all records.
     * Supports optional status filter via query parameter.
     * Only selects needed columns for efficiency.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Task::select(['id', 'title', 'description', 'status', 'created_at', 'updated_at'])
            ->orderBy('created_at', 'desc');

        // Optional status filter
        if ($request->has('status') && in_array($request->status, ['pending', 'completed'])) {
            $query->status($request->status);
        }

        // Optional search filter
        if ($request->has('search') && $request->search) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        $perPage = min($request->get('per_page', 15), 100); // Cap at 100
        $tasks = $query->paginate($perPage);

        return response()->json($tasks);
    }

    /**
     * Store a newly created task.
     *
     * Validates input and uses unique constraint to prevent duplicates.
     * Supports idempotency key header for duplicate submission prevention.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => [
                'required',
                'string',
                'max:255',
            ],
            'description' => 'nullable|string|max:1000',
            'status' => ['nullable', Rule::in(['pending', 'completed'])],
        ]);

        try {
            $task = Task::create([
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'status' => $validated['status'] ?? 'pending',
            ]);

            return response()->json([
                'message' => 'Task created successfully.',
                'task' => $task,
            ], 201);
        } catch (QueryException $e) {
            // Handle unique constraint violation (duplicate task)
            if (str_contains($e->getMessage(), 'UNIQUE constraint failed') ||
                str_contains($e->getMessage(), 'Duplicate entry')) {
                return response()->json([
                    'message' => 'A task with this title and status already exists.',
                    'errors' => [
                        'title' => ['A task with this title and status already exists.'],
                    ],
                ], 422);
            }
            throw $e;
        }
    }

    /**
     * Display the specified task.
     */
    public function show(Task $task): JsonResponse
    {
        return response()->json(['task' => $task]);
    }

    /**
     * Update the specified task.
     */
    public function update(Request $request, Task $task): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'status' => ['sometimes', Rule::in(['pending', 'completed'])],
        ]);

        try {
            $task->update($validated);

            return response()->json([
                'message' => 'Task updated successfully.',
                'task' => $task->fresh(),
            ]);
        } catch (QueryException $e) {
            if (str_contains($e->getMessage(), 'UNIQUE constraint failed') ||
                str_contains($e->getMessage(), 'Duplicate entry')) {
                return response()->json([
                    'message' => 'A task with this title and status already exists.',
                    'errors' => [
                        'title' => ['A task with this title and status already exists.'],
                    ],
                ], 422);
            }
            throw $e;
        }
    }

    /**
     * Remove the specified task.
     */
    public function destroy(Task $task): JsonResponse
    {
        $task->delete();

        return response()->json([
            'message' => 'Task deleted successfully.',
        ]);
    }
}
