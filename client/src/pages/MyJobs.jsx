import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchMyJobs } from '../api';
import styles from './Home.module.css';

export default function MyJobs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (!user) return null;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>My Job Listings</h1>
      <p className={styles.subtitle}>Jobs you've posted on LoyseConnect</p>

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
              <div className={styles.cardTop}>
                <h2 className={styles.cardTitle}>{job.title}</h2>
                <span className={styles.badge}>{job.type}</span>
              </div>
              <p className={styles.company}>{job.company}</p>
              <p className={styles.location}>{job.location}</p>
              {formatSalary(job) && <p className={styles.salary}>{formatSalary(job)}</p>}
              <p className={styles.desc}>{job.description?.slice(0, 100)}…</p>
              <Link to={`/jobs/${job._id}`} className={styles.viewBtn}>View Details</Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
