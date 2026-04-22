import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchSavedJobs, unsaveJob } from '../api';
import { useAuth } from '../context/AuthContext';
import styles from './SavedJobs.module.css';

export default function SavedJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingJobId, setRemovingJobId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchSavedJobs();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      load();
    }
  }, [user]);

  const handleRemove = async (e, jobId) => {
    e.preventDefault();
    setRemovingJobId(jobId);
    try {
      await unsaveJob(jobId);
      setJobs(jobs.filter(job => job._id !== jobId));
    } catch (err) {
      alert(err.message || 'Failed to remove job');
    } finally {
      setRemovingJobId(null);
    }
  };

  const formatSalary = (job) => {
    if (job.salaryMin != null || job.salaryMax != null) {
      const min = job.salaryMin != null ? `$${Number(job.salaryMin).toLocaleString()}` : '';
      const max = job.salaryMax != null ? `$${Number(job.salaryMax).toLocaleString()}` : '';
      if (min && max) return `${min} - ${max}`;
      return min || max;
    }
    return null;
  };

  const timeAgo = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return `${diff} days ago`;
    if (diff < 30) return `${Math.floor(diff / 7)} weeks ago`;
    return `${Math.floor(diff / 30)} months ago`;
  };

  if (!user) {
    return (
      <div className={styles.page}>
        <div className={styles.notAuthenticated}>
          <h2>Please log in to view saved jobs</h2>
          <Link to="/login" className={styles.loginBtn}>Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Saved Jobs</h1>
        <p className={styles.meta}>
          {jobs.length} job{jobs.length !== 1 ? 's' : ''} saved
        </p>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading saved jobs…</div>
      ) : jobs.length === 0 ? (
        <div className={styles.empty}>
          <p>No saved jobs yet. Visit the home page to save jobs!</p>
          <Link to="/" className={styles.browseBtn}>Browse Jobs</Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {jobs.map((job) => (
            <article key={job._id} className={styles.card}>
              <div className={styles.cardTop}>
                <h2 className={styles.cardTitle}>{job.title}</h2>
                <span className={styles.badge}>{job.type}</span>
              </div>
              <p className={styles.company}>{job.company}</p>
              <p className={styles.location}>{job.location}</p>
              {formatSalary(job) && <p className={styles.salary}>{formatSalary(job)}</p>}
              <p className={styles.time}>Posted {timeAgo(job.createdAt)}</p>
              <p className={styles.desc}>{job.description?.slice(0, 120)}{job.description?.length > 120 ? '…' : ''}</p>
              <div className={styles.buttonGroup}>
                <Link to={`/jobs/${job._id}`} className={styles.viewBtn}>View Details</Link>
                <button 
                  onClick={(e) => handleRemove(e, job._id)}
                  disabled={removingJobId === job._id}
                  className={styles.removeBtn}
                  title="Remove from saved jobs"
                >
                  {removingJobId === job._id ? '...' : 'Remove'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
