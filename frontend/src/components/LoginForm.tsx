'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/lib/auth';
import { showToast } from '@/components/Toast';
import { ApiError } from '@/lib/api';
import styles from './LoginForm.module.css';

export default function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string[]> = {};

    if (!email.trim()) {
      newErrors.email = ['Email is required.'];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = ['Please enter a valid email address.'];
    }

    if (!password.trim()) {
      newErrors.password = ['Password is required.'];
    } else if (password.length < 3) {
      newErrors.password = ['Password must be at least 3 characters.'];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      await login(email, password);
      showToast('Welcome back! Login successful.', 'success');
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.errors) {
        setErrors(apiError.errors);
      }
      showToast(apiError.message || 'Login failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        {/* Decorative elements */}
        <div className={styles.glow} />

        <div className={styles.header}>
          <div className={styles.logo}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="12" fill="#FFFFFF" />
              <path d="M12 20L17 25L28 14" stroke="#121212" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Sign in to manage your tasks</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors((prev) => ({ ...prev, email: [] })); }}
              disabled={isLoading}
              autoComplete="email"
              autoFocus
            />
            {errors.email?.map((err, i) => (
              <span key={i} className={styles.error}>{err}</span>
            ))}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((prev) => ({ ...prev, password: [] })); }}
              disabled={isLoading}
              autoComplete="current-password"
            />
            {errors.password?.map((err, i) => (
              <span key={i} className={styles.error}>{err}</span>
            ))}
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isLoading}
            id="login-submit"
          >
            {isLoading ? (
              <>
                <span className="spinner" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className={styles.hint}>
          <span className={styles.hintLabel}>Demo credentials:</span>
          <code>admin@example.com</code> / <code>password</code>
        </div>
      </div>
    </div>
  );
}
