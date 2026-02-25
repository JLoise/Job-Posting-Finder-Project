import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createJob, updateJob, fetchJob } from '../api';
import styles from './PostJob.module.css';

export default function PostJob() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('Full-time');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    if (isEdit && id) {
      fetchJob(id)
        .then((job) => {
          setTitle(job.title || '');
          setCompany(job.company || '');
          setLocation(job.location || '');
          setType(job.type || 'Full-time');
          setSalaryMin(job.salaryMin != null ? String(job.salaryMin) : '');
          setSalaryMax(job.salaryMax != null ? String(job.salaryMax) : '');
          setDescription(job.description || '');
        })
        .catch(() => setError('Job not found'))
        .finally(() => setFetching(false));
    }
  }, [user, isEdit, id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        company: company.trim(),
        location: location.trim(),
        type,
        description: description.trim(),
      };
      if (salaryMin !== '') payload.salaryMin = Number(salaryMin);
      if (salaryMax !== '') payload.salaryMax = Number(salaryMax);
      if (isEdit) {
        await updateJob(id, payload);
        navigate(`/jobs/${id}`);
      } else {
        const job = await createJob(payload);
        navigate(`/jobs/${job._id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to save job');
    } finally {
      setLoading(false);
    }
  };

  if (isEdit && fetching) return <div className={styles.loading}>Loading…</div>;

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h1 className={styles.title}>{isEdit ? 'Edit Job' : 'Post a Job'}</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}
            <label className={styles.label}>Job Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className={styles.input}
              placeholder="e.g. Senior Developer"
            />
            <label className={styles.label}>Company *</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
              className={styles.input}
            />
            <label className={styles.label}>Location *</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className={styles.input}
              placeholder="e.g. New York, NY or Remote"
            />
            <label className={styles.label}>Job Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className={styles.select}>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
              <option value="Freelance">Freelance</option>
            </select>
            <div className={styles.row}>
              <div>
                <label className={styles.label}>Salary Min</label>
                <input
                  type="number"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  className={styles.input}
                  placeholder="50000"
                />
              </div>
              <div>
                <label className={styles.label}>Salary Max</label>
                <input
                  type="number"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  className={styles.input}
                  placeholder="80000"
                />
              </div>
            </div>
            <label className={styles.label}>Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={6}
              className={styles.textarea}
            />
            <button type="submit" disabled={loading} className={styles.button}>
              {loading ? 'Saving…' : isEdit ? 'Update Job' : 'Post Job'}
            </button>
          </form>
      </div>
    </div>
  );
}
