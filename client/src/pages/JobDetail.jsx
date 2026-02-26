import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchJob, deleteJob } from '../api';
import styles from './JobDetail.module.css';

/**
 * JobDetail component.
 * 
 * Displays a job listing with its details.
 * If the user is the owner of the job, it also displays edit and delete buttons.
 * 
 * @param {string} id - The ID of the job to display.
 * @returns {JSX.Element} - The JobDetail component.
 */
export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchJob(id)
      .then(setJob)
      .catch(() => setJob(null))
      .finally(() => setLoading(false));
  }, [id]);

  const isOwner = user && job && (job.postedBy?._id === user.id || job.postedBy === user.id);

  const formatSalary = () => {
    if (!job) return null;
    if (job.salaryMin != null || job.salaryMax != null) {
      const min = job.salaryMin != null ? `$${Number(job.salaryMin).toLocaleString()}` : '';
      const max = job.salaryMax != null ? `$${Number(job.salaryMax).toLocaleString()}` : '';
      if (min && max) return `${min} - ${max}`;
      return min || max;
    }
    return null;
  };

  const handleDelete = async () => {
    if (!confirm('Delete this job listing?')) return;
    setDeleting(true);
    try {
      await deleteJob(id);
      navigate('/');
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleApply = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setApplying(true);
    try {
      // TODO: Implement actual apply functionality with API call
      // await applyToJob(id);
      alert('Application submitted successfully!');
    } catch (err) {
      alert(err.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      // TODO: Implement actual save functionality with API call
      // if (saved) {
      //   await unsaveJob(id);
      // } else {
      //   await saveJob(id);
      // }
      setSaved(!saved);
      alert(saved ? 'Job removed from saved jobs' : 'Job saved successfully!');
    } catch (err) {
      alert(err.message || 'Failed to save job');
    }
  };

  if (loading) return <div className={styles.loading}>Loading…</div>;
  if (!job) return <div className={styles.loading}>Job not found. <Link to="/">Back to jobs</Link></div>;

  return (
    <div className={styles.wrap}>
      <div className={styles.backButton}>
        <Link to="/" className={styles.backLink}>← Back to All Jobs</Link>
      </div>
      
      <div className={styles.card}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{job.title}</h1>
            <span className={styles.badge}>{job.type}</span>
          </div>
          {isOwner && (
            <div className={styles.actions}>
              <Link to={`/post/${id}`} className={styles.editBtn}>Edit</Link>
              <button type="button" onClick={handleDelete} disabled={deleting} className={styles.deleteBtn}>
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          )}
        </div>
        
        <p className={styles.company}>{job.company}</p>
        <p className={styles.meta}>{job.location}</p>
        {formatSalary() && <p className={styles.salary}>{formatSalary()}</p>}
        {job.postedBy && (
          <p className={styles.postedBy}>
            Posted by {job.postedBy.name || 'Unknown'}
          </p>
        )}
        
        {!isOwner && (
          <div className={styles.jobActions}>
            <button 
              type="button" 
              onClick={handleApply} 
              disabled={applying}
              className={styles.applyBtn}
            >
              {applying ? 'Applying…' : 'Apply Now'}
            </button>
            <button 
              type="button" 
              onClick={handleSave}
              className={`${styles.saveBtn} ${saved ? styles.saved : ''}`}
            >
              {saved ? '✓ Saved' : 'Save Job'}
            </button>
          </div>
        )}
        
        <div className={styles.description}>
          <h2>Description</h2>
          <p>{job.description}</p>
        </div>
      </div>
    </div>
  );
}
