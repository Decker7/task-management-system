'use client';

import { useState } from 'react';
import { Task } from '@/lib/api';
import styles from './TaskCard.module.css';

interface TaskCardProps {
  task: Task;
  onStatusToggle: (task: Task) => void;
  onDelete: (task: Task) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

export default function TaskCard({ task, onStatusToggle, onDelete, isUpdating, isDeleting }: TaskCardProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const isCompleted = task.status === 'completed';
  const createdDate = new Date(task.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleDelete = () => {
    if (isConfirmingDelete) {
      onDelete(task);
      setIsConfirmingDelete(false);
    } else {
      setIsConfirmingDelete(true);
      // Auto-cancel after 3 seconds
      setTimeout(() => setIsConfirmingDelete(false), 3000);
    }
  };

  return (
    <div className={`${styles.card} ${isCompleted ? styles.completed : ''} animate-fade-in`}>
      <div className={styles.content}>
        <div className={styles.top}>
          <button
            className={`${styles.checkbox} ${isCompleted ? styles.checked : ''}`}
            onClick={() => onStatusToggle(task)}
            disabled={isUpdating}
            aria-label={isCompleted ? 'Mark as pending' : 'Mark as completed'}
            id={`task-toggle-${task.id}`}
          >
            {isUpdating ? (
              <span className="spinner" />
            ) : isCompleted ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : null}
          </button>

          <div className={styles.info}>
            <h3 className={`${styles.title} ${isCompleted ? styles.titleCompleted : ''}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className={styles.description}>{task.description}</p>
            )}
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.meta}>
            <span className={`${styles.status} ${isCompleted ? styles.statusCompleted : styles.statusPending}`}>
              {isCompleted ? 'Completed' : 'Pending'}
            </span>
            <span className={styles.date}>{createdDate}</span>
          </div>

          <button
            className={`${styles.deleteBtn} ${isConfirmingDelete ? styles.deleteBtnConfirm : ''}`}
            onClick={handleDelete}
            disabled={isDeleting}
            id={`task-delete-${task.id}`}
            aria-label={isConfirmingDelete ? 'Confirm delete' : 'Delete task'}
          >
            {isDeleting ? (
              <span className="spinner" />
            ) : isConfirmingDelete ? (
              'Confirm?'
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M5 3V2C5 1.44772 5.44772 1 6 1H10C10.5523 1 11 1.44772 11 2V3M2 4H14M4 4V13C4 13.5523 4.44772 14 5 14H11C11.5523 14 12 13.5523 12 13V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
