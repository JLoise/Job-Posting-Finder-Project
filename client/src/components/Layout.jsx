import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Layout.module.css';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>◇</span>
          LoyseConnect
        </Link>
        <nav className={styles.nav}>
          {user ? (
            <>
              <Link to="/profile" className={styles.navLink}>Profile</Link>
              <Link to="/my-jobs" className={styles.navLink}>My Jobs</Link>
              <Link to="/saved-jobs" className={styles.navLink}>Saved Jobs</Link>
              <Link to="/post" className={styles.btnPost}>Post a Job</Link>
              <span className={styles.userName}>{user.name}</span>
              <button type="button" onClick={handleLogout} className={styles.btnSignIn}>Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.btnSignIn}>Sign In</Link>
              <Link to="/post" className={styles.btnPost}>Post a Job</Link>
            </>
          )}
        </nav>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
