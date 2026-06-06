'use client';

import { useState, useEffect, useCallback } from 'react';
import { Task, getTasks, createTask, updateTask, deleteTask, PaginatedResponse, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { showToast } from '@/components/Toast';
import TaskCard from '@/components/TaskCard';
import TaskForm from '@/components/TaskForm';
import styles from './TaskList.module.css';

export default function TaskList() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);

  const fetchTasks = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const params: { page: number; per_page: number; status?: string } = { page, per_page: 15 };
      if (statusFilter) params.status = statusFilter;

      const response: PaginatedResponse<Task> = await getTasks(params);
      setTasks(response.data);
      setPagination({
        currentPage: response.current_page,
        lastPage: response.last_page,
        total: response.total,
      });
    } catch (err) {
      const apiError = err as ApiError;
      showToast(apiError.message || 'Failed to load tasks.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreateTask = async (data: { title: string; description: string }) => {
    setIsSubmitting(true);
    setServerErrors({});
    try {
      await createTask(data);
      showToast('Task created successfully!', 'success');
      setIsFormOpen(false);
      fetchTasks();
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.errors) {
        setServerErrors(apiError.errors);
      }
      showToast(apiError.message || 'Failed to create task.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusToggle = async (task: Task) => {
    setUpdatingTaskId(task.id);
    const newStatus = task.status === 'pending' ? 'completed' : 'pending';
    try {
      await updateTask(task.id, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
      );
      showToast(
        newStatus === 'completed' ? 'Task marked as completed!' : 'Task marked as pending.',
        'success'
      );
    } catch (err) {
      const apiError = err as ApiError;
      showToast(apiError.message || 'Failed to update task.', 'error');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleDeleteTask = async (task: Task) => {
    setDeletingTaskId(task.id);
    try {
      await deleteTask(task.id);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
      setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
      showToast('Task deleted.', 'success');
    } catch (err) {
      const apiError = err as ApiError;
      showToast(apiError.message || 'Failed to delete task.', 'error');
    } finally {
      setDeletingTaskId(null);
    }
  };

  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logoMark}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="10" fill="#FFFFFF" />
              <path d="M10 16L14 20L22 12" stroke="#121212" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h1 className={styles.headerTitle}>Task Manager</h1>
            <p className={styles.headerSubtitle}>Welcome, {user?.name}</p>
          </div>
        </div>
        <button className={styles.logoutBtn} onClick={logout} id="logout-btn">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 14H3C2.44772 14 2 13.5523 2 13V3C2 2.44772 2.44772 2 3 2H6M11 11L14 8M14 8L11 5M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Sign Out
        </button>
      </header>

      {/* Stats Bar */}
      <div className={styles.statsBar}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{pagination.total}</span>
          <span className={styles.statLabel}>Total Tasks</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.stat}>
          <span className={`${styles.statValue} ${styles.statPending}`}>{pendingCount}</span>
          <span className={styles.statLabel}>Pending</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.stat}>
          <span className={`${styles.statValue} ${styles.statCompleted}`}>{completedCount}</span>
          <span className={styles.statLabel}>Completed</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          {['', 'pending', 'completed'].map((filter) => (
            <button
              key={filter}
              className={`${styles.filterBtn} ${statusFilter === filter ? styles.filterActive : ''}`}
              onClick={() => setStatusFilter(filter)}
            >
              {filter === '' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
        <button
          className={styles.addBtn}
          onClick={() => setIsFormOpen(true)}
          id="add-task-btn"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          New Task
        </button>
      </div>

      {/* Task List */}
      <div className={styles.list}>
        {isLoading ? (
          // Skeleton loading
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className={styles.skeletonTop}>
                <div className={`skeleton ${styles.skeletonCheckbox}`} />
                <div className={styles.skeletonContent}>
                  <div className={`skeleton ${styles.skeletonTitle}`} />
                  <div className={`skeleton ${styles.skeletonDesc}`} />
                </div>
              </div>
              <div className={styles.skeletonFooter}>
                <div className={`skeleton ${styles.skeletonBadge}`} />
              </div>
            </div>
          ))
        ) : tasks.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect x="6" y="10" width="36" height="32" rx="4" stroke="currentColor" strokeWidth="2"/>
                <path d="M6 18H42" stroke="currentColor" strokeWidth="2"/>
                <path d="M18 6V12M30 6V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M20 28L22 30L28 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className={styles.emptyTitle}>
              {statusFilter ? `No ${statusFilter} tasks` : 'No tasks yet'}
            </h3>
            <p className={styles.emptyText}>
              {statusFilter
                ? `There are no ${statusFilter} tasks at the moment.`
                : 'Create your first task to get started!'}
            </p>
            {!statusFilter && (
              <button
                className={styles.emptyBtn}
                onClick={() => setIsFormOpen(true)}
              >
                Create Task
              </button>
            )}
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusToggle={handleStatusToggle}
              onDelete={handleDeleteTask}
              isUpdating={updatingTaskId === task.id}
              isDeleting={deletingTaskId === task.id}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {!isLoading && pagination.lastPage > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            disabled={pagination.currentPage <= 1}
            onClick={() => fetchTasks(pagination.currentPage - 1)}
          >
            ← Previous
          </button>
          <span className={styles.pageInfo}>
            Page {pagination.currentPage} of {pagination.lastPage}
          </span>
          <button
            className={styles.pageBtn}
            disabled={pagination.currentPage >= pagination.lastPage}
            onClick={() => fetchTasks(pagination.currentPage + 1)}
          >
            Next →
          </button>
        </div>
      )}

      {/* Task Form Modal */}
      {isFormOpen && (
        <TaskForm
          isOpen={isFormOpen}
          onClose={() => { setIsFormOpen(false); setServerErrors({}); }}
          onSubmit={handleCreateTask}
          isSubmitting={isSubmitting}
          serverErrors={serverErrors}
        />
      )}
    </div>
  );
}
