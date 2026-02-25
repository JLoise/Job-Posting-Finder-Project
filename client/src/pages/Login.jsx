import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { login, loginWithGoogle } from '../api';
import styles from './Auth.module.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login: setAuth } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    const idToken = credentialResponse?.credential;
    if (!idToken) return;
    setError('');
    setLoading(true);
    try {
      const { token, user } = await loginWithGoogle(idToken);
      setAuth(token, user);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await login(email.trim(), password);
      setAuth(token, user);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h1 className={styles.title}>Sign In</h1>
        <p className={styles.subtitle}>Sign in to your LoyseConnect account</p>

        {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
          <>
            <div className={styles.googleWrap}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => { setError('Google sign-in was cancelled or failed'); setLoading(false); }}
                useOneTap={false}
                theme="outline"
                size="large"
                text="continue_with"
                shape="rectangular"
              />
            </div>
            <div className={styles.divider}>or</div>
          </>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          <label className={styles.label}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
            autoComplete="email"
          />
          <label className={styles.label}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.input}
            autoComplete="current-password"
          />
          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p className={styles.footer}>
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
