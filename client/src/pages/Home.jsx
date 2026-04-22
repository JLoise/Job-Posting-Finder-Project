import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchJobs, saveJob, unsaveJob, fetchSavedJobs } from '../api';
import styles from './Home.module.css';

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');   
  const [sort, setSort] = useState('recent');
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [savingJobId, setSavingJobId] = useState(null);

  const token = localStorage.getItem('loyseconnect_token');

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (q.trim()) params.q = q.trim();
      if (location.trim()) params.location = location.trim();
      if (type) params.type = type;
      if (sort === 'salary') params.sort = 'salary';
      const data = await fetchJobs(params);
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [sort, type]);

  useEffect(() => {
    if (token) {
      fetchSavedJobs()
        .then(data => {
          const savedIds = new Set((data || []).map(job => job._id));
          setSavedJobs(savedIds);
        })
        .catch(() => setSavedJobs(new Set()));
    }
  }, [token]);

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  const handleSaveJob = async (e, jobId) => {
    e.preventDefault();
    if (!token) {
      alert('Please log in to save jobs');
      return;
    }

    setSavingJobId(jobId);
    try {
      if (savedJobs.has(jobId)) {
        await unsaveJob(jobId);
        setSavedJobs(prev => {
          const updated = new Set(prev);
          updated.delete(jobId);
          return updated;
        });
      } else {
        await saveJob(jobId);
        setSavedJobs(prev => new Set(prev).add(jobId));
      }
    } catch (err) {
      alert(err.message || 'Failed to update saved jobs');
    } finally {
      setSavingJobId(null);
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

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Find Your Next Job</h1>
        <p className={styles.subtitle}>
          Connect with opportunities that match your skills. Search by role or location—partial matches work too (e.g. “dev” for Developer).
        </p>
        <p className={styles.meta}>
          {jobs.length} job{jobs.length !== 1 ? 's' : ''} available
        </p>
      </div>

      <form onSubmit={handleSearch} className={styles.searchForm}>
        <input
          type="text"
          placeholder="Search for Job Title, Keywords, or Company..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className={styles.searchInput}
        />
        <div className={styles.filters}>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={styles.select}
          >
            <option value="">All Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
            <option value="Freelance">Freelance</option>
          </select>
          <input
            type="text"
            placeholder="Location (e.g. NYC, Austin)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={styles.locationInput}
          />
          <button type="button" onClick={() => setSort(sort === 'recent' ? 'salary' : 'recent')} className={styles.sortBtn}>
            {sort === 'recent' ? 'Most Recent' : 'By Salary'}
          </button>
          <button type="submit" className={styles.searchBtn}>Search</button>
        </div>
      </form>

      <p className={styles.resultCount}>Showing {jobs.length} job{jobs.length !== 1 ? 's' : ''}</p>

      {loading ? (
        <div className={styles.loading}>Loading jobs…</div>
      ) : jobs.length === 0 ? (
        <div className={styles.empty}>No jobs match your search. Try different keywords or location.</div>
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
                  onClick={(e) => handleSaveJob(e, job._id)}
                  disabled={savingJobId === job._id}
                  className={`${styles.saveBtn} ${savedJobs.has(job._id) ? styles.saved : ''}`}
                  title={savedJobs.has(job._id) ? 'Unsave job' : 'Save job'}
                >
                  {savingJobId === job._id ? '...' : savedJobs.has(job._id) ? '♥' : '♡'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
