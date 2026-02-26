import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchMyJobs, deleteJob } from '../api';
import styles from './MyJobs.module.css';

export default function MyJobs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    fetchMyJobs()
      .then(setJobs)
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, [user, navigate]);

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

  const handleDelete = async (jobId, jobTitle) => {
    if (!confirm(`Delete \"${jobTitle}\"?`)) return;
    setDeleting(jobId);
    try {
      await deleteJob(jobId);
      setJobs(jobs.filter(job => job._id !== jobId));
    } catch (err) {
      alert(err.message || 'Failed to delete job');
    } finally {
      setDeleting(null);
    }
  };

  if (!user) return null;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>My Job Listings</h1>

      {loading ? (
        <div className={styles.loading}>Loading…</div>
      ) : jobs.length === 0 ? (
        <div className={styles.empty}>
          You haven't posted any jobs yet. <Link to="/post">Post your first job</Link>.
        </div>
      ) : (
        <div className={styles.grid}>
          {jobs.map((job) => (
            <article key={job._id} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.categoryBadge}>{job.type}</span>
                <div className={styles.cardActions}>
                  <Link to={`/post/${job._id}`} className={styles.editBtn}>
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(job._id, job.title)}
                    disabled={deleting === job._id}
                    className={styles.deleteBtn}
                  >
                    {deleting === job._id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>

              <h2 className={styles.jobTitle}>{job.title}</h2>

              <div className={styles.jobMeta}>
                <div className={styles.metaItem}>
                  <span className={styles.icon}>🏢</span>
                  <span>{job.company}</span>
                </div>

                <div className={styles.metaItem}>
                  <span className={styles.icon}>📍</span>
                  <span>{job.location}</span>
                </div>

                <div className={styles.metaItem}>
                  <span className={styles.icon}>💼</span>
                  <span>{job.type}</span>
                </div>

                {formatSalary(job) && (
                  <div className={styles.metaItem}>
                    <span className={styles.icon}>💰</span>
                    <span className={styles.salary}>{formatSalary(job)}</span>
                  </div>
                )}

                <div className={styles.metaItem}>
                  <span className={styles.icon}>🕒</span>
                  <span>Posted {timeAgo(job.createdAt)}</span>
                </div>
              </div>

              <div className={styles.jobActions}>
                <Link to={`/jobs/${job._id}`} className={styles.viewBtn}>
                  View Details
                </Link>
                <button type="button" className={styles.shareBtn}>
                  Share Job
                </button>
              </div>

              {job.description && (
                <div className={styles.jobDescription}>
                  <h3>Job Description</h3>
                  <p>{job.description.slice(0, 200)}{job.description.length > 200 ? '…' : ''}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
