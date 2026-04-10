'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
import styles from './TaskForm.module.css';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description: string }) => Promise<void>;
  isSubmitting: boolean;
  serverErrors?: Record<string, string[]>;
}

export default function TaskForm({ isOpen, onClose, onSubmit, isSubmitting, serverErrors }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const titleRef = useRef<HTMLInputElement>(null);

  // Focus title input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => titleRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Merge server errors
  useEffect(() => {
    if (serverErrors) {
      setErrors((prev) => ({ ...prev, ...serverErrors }));
    }
  }, [serverErrors]);

  // Reset form when closing
  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setDescription('');
      setErrors({});
    }
  }, [isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string[]> = {};
    if (!title.trim()) {
      newErrors.title = ['Task title is required.'];
    } else if (title.length > 255) {
      newErrors.title = ['Title must be less than 255 characters.'];
    }
    if (description.length > 1000) {
      newErrors.description = ['Description must be less than 1000 characters.'];
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    await onSubmit({ title: title.trim(), description: description.trim() });
  };

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`${styles.modal} animate-scale-in`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Create New Task</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="task-title">Title</label>
            <input
              id="task-title"
              ref={titleRef}
              type="text"
              className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrors((prev) => ({ ...prev, title: undefined })); }}
              disabled={isSubmitting}
              maxLength={255}
            />
            {errors.title?.map((err, i) => (
              <span key={i} className={styles.error}>{err}</span>
            ))}
            <span className={styles.charCount}>{title.length}/255</span>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="task-description">
              Description <span className={styles.optional}>(optional)</span>
            </label>
            <textarea
              id="task-description"
              className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
              placeholder="Add more details about this task..."
              value={description}
              onChange={(e) => { setDescription(e.target.value); setErrors((prev) => ({ ...prev, description: undefined })); }}
              disabled={isSubmitting}
              rows={3}
              maxLength={1000}
            />
            {errors.description?.map((err, i) => (
              <span key={i} className={styles.error}>{err}</span>
            ))}
            <span className={styles.charCount}>{description.length}/1000</span>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isSubmitting}
              id="task-submit"
            >
              {isSubmitting ? (
                <>
                  <span className="spinner" />
                  Creating...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Create Task
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
