'use client';

import { useState, useEffect, ReactNode } from 'react';
import styles from './Toast.module.css';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  exiting?: boolean;
}

let addToastGlobal: ((message: string, type: ToastType) => void) | null = null;

export function showToast(message: string, type: ToastType = 'info') {
  if (addToastGlobal) {
    addToastGlobal(message, type);
  }
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    addToastGlobal = (message: string, type: ToastType) => {
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      setToasts((prev) => [...prev, { id, message, type }]);

      // Auto-dismiss after 4 seconds
      setTimeout(() => {
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
        );
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 300);
      }, 4000);
    };

    return () => {
      addToastGlobal = null;
    };
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
    }
  };

  return (
    <>
      {children}
      <div className={styles.container}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`${styles.toast} ${styles[toast.type]} ${toast.exiting ? styles.exiting : ''}`}
          >
            <span className={styles.icon}>{getIcon(toast.type)}</span>
            <span className={styles.message}>{toast.message}</span>
            <button
              className={styles.close}
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
