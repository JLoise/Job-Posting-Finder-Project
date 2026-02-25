import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile } from '../api';
import styles from './Profile.module.css';

const emptyExp = () => ({ title: '', company: '', location: '', startDate: '', endDate: '', current: false, description: '' });
const emptyEdu = () => ({ school: '', degree: '', field: '', startDate: '', endDate: '', description: '' });

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // 'headline' | 'about' | 'experience' | 'education' | 'skills' | 'photo'
  const [editHeadline, setEditHeadline] = useState('');
  const [editAbout, setEditAbout] = useState('');
  const [editExp, setEditExp] = useState(null);
  const [editExpIndex, setEditExpIndex] = useState(-1);
  const [editEdu, setEditEdu] = useState(null);
  const [editEduIndex, setEditEduIndex] = useState(-1);
  const [editPhoto, setEditPhoto] = useState('');
  const [editSkills, setEditSkills] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    getProfile()
      .then(setProfile)
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const saveProfile = async (payload) => {
    setSaving(true);
    setError('');
    try {
      const updated = await updateProfile(payload);
      setProfile(updated);
      setEditing(null);
    } catch (err) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveHeadline = () => {
    saveProfile({ headline: editHeadline });
  };
  const handleSaveAbout = () => {
    saveProfile({ about: editAbout });
  };
  const handleSavePhoto = () => {
    saveProfile({ profilePicture: editPhoto });
  };
  const handleSaveExperience = () => {
    const exp = profile.experience || [];
    const index = editExpIndex;
    const next = index === -1 ? [...exp, editExp] : exp.map((e, i) => (i === index ? editExp : e));
    saveProfile({ experience: next });
    setEditExp(null);
    setEditExpIndex(-1);
  };
  const handleDeleteExperience = (index) => {
    const next = (profile.experience || []).filter((_, i) => i !== index);
    saveProfile({ experience: next });
    setEditExp(null);
  };
  const handleSaveEducation = () => {
    const edu = profile.education || [];
    const index = editEduIndex;
    const next = index === -1 ? [...edu, editEdu] : edu.map((e, i) => (i === index ? editEdu : e));
    saveProfile({ education: next });
    setEditEdu(null);
    setEditEduIndex(-1);
  };
  const handleDeleteEducation = (index) => {
    const next = (profile.education || []).filter((_, i) => i !== index);
    saveProfile({ education: next });
    setEditEdu(null);
  };
  const handleSaveSkills = () => {
    const skills = editSkills.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
    saveProfile({ skills });
  };

  if (!user) return null;
  if (loading) return <div className={styles.loading}>Loading profile…</div>;
  if (error && !profile) return <div className={styles.error}>{error}</div>;

  const exp = profile?.experience || [];
  const edu = profile?.education || [];
  const skills = profile?.skills || [];

  return (
    <div className={styles.page}>
      {/* Cover / banner */}
      <div className={styles.banner} />

      <div className={styles.card}>
        {/* Profile picture */}
        <div className={styles.photoRow}>
          <div className={styles.photoWrap}>
            {editing === 'photo' ? (
              <div className={styles.photoEdit}>
                <input
                  type="url"
                  placeholder="Image URL"
                  value={editPhoto}
                  onChange={(e) => setEditPhoto(e.target.value)}
                  className={styles.input}
                />
                <div className={styles.photoActions}>
                  <button type="button" onClick={() => { setEditPhoto(profile?.profilePicture || ''); setEditing(null); }}>Cancel</button>
                  <button type="button" onClick={handleSavePhoto} disabled={saving}>Save</button>
                </div>
              </div>
            ) : (
              <>
                <img
                  src={profile?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'User')}&size=168`}
                  alt={profile?.name}
                  className={styles.avatar}
                  onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'User')}&size=168`; }}
                />
                <button type="button" className={styles.editPhotoBtn} onClick={() => { setEditPhoto(profile?.profilePicture || ''); setEditing('photo'); }} aria-label="Change photo">
                  Edit photo
                </button>
              </>
            )}
          </div>
        </div>

        <h1 className={styles.name}>{profile?.name}</h1>

        {/* Headline */}
        <div className={styles.section}>
          {editing === 'headline' ? (
            <div className={styles.editBlock}>
              <input
                type="text"
                value={editHeadline}
                onChange={(e) => setEditHeadline(e.target.value)}
                placeholder="e.g. Software Developer at Company"
                className={styles.input}
              />
              <div className={styles.actions}>
                <button type="button" onClick={() => setEditing(null)}>Cancel</button>
                <button type="button" onClick={handleSaveHeadline} disabled={saving}>Save</button>
              </div>
            </div>
          ) : (
            <>
              <p className={styles.headline}>{profile?.headline || 'Add a headline'}</p>
              <button type="button" className={styles.editLink} onClick={() => { setEditHeadline(profile?.headline || ''); setEditing('headline'); }}>Edit</button>
            </>
          )}
        </div>

        {/* About */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>About</h2>
          {editing === 'about' ? (
            <div className={styles.editBlock}>
              <textarea
                value={editAbout}
                onChange={(e) => setEditAbout(e.target.value)}
                placeholder="Tell us about yourself"
                className={styles.textarea}
                rows={4}
              />
              <div className={styles.actions}>
                <button type="button" onClick={() => setEditing(null)}>Cancel</button>
                <button type="button" onClick={handleSaveAbout} disabled={saving}>Save</button>
              </div>
            </div>
          ) : (
            <>
              <p className={styles.about}>{profile?.about || 'Add an about section.'}</p>
              <button type="button" className={styles.editLink} onClick={() => { setEditAbout(profile?.about || ''); setEditing('about'); }}>Edit</button>
            </>
          )}
        </div>

        {/* Experience */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Experience</h2>
          {editing === 'experience' && editExp !== null ? (
            <div className={styles.editBlock}>
              <input type="text" placeholder="Title" value={editExp.title} onChange={(e) => setEditExp({ ...editExp, title: e.target.value })} className={styles.input} />
              <input type="text" placeholder="Company" value={editExp.company} onChange={(e) => setEditExp({ ...editExp, company: e.target.value })} className={styles.input} />
              <input type="text" placeholder="Location" value={editExp.location} onChange={(e) => setEditExp({ ...editExp, location: e.target.value })} className={styles.input} />
              <div className={styles.row}>
                <input type="text" placeholder="Start date" value={editExp.startDate} onChange={(e) => setEditExp({ ...editExp, startDate: e.target.value })} className={styles.input} />
                <input type="text" placeholder="End date" value={editExp.endDate} onChange={(e) => setEditExp({ ...editExp, endDate: e.target.value })} className={styles.input} />
              </div>
              <label className={styles.checkLabel}><input type="checkbox" checked={editExp.current} onChange={(e) => setEditExp({ ...editExp, current: e.target.checked })} /> I currently work here</label>
              <textarea placeholder="Description" value={editExp.description} onChange={(e) => setEditExp({ ...editExp, description: e.target.value })} className={styles.textarea} rows={3} />
              <div className={styles.actions}>
                <button type="button" onClick={() => { setEditExp(null); setEditExpIndex(-1); setEditing(null); }}>Cancel</button>
                <button type="button" onClick={handleSaveExperience} disabled={saving}>Save</button>
              </div>
            </div>
          ) : (
            <>
              {exp.length === 0 && <p className={styles.placeholder}>Add your work experience.</p>}
              {exp.map((e, i) => (
                <div key={e._id || i} className={styles.item}>
                  <div className={styles.itemHead}>
                    <span className={styles.itemTitle}>{e.title}</span>
                    {e.company && <span className={styles.itemSub}>{e.company}{e.location ? ` · ${e.location}` : ''}</span>}
                    <span className={styles.itemDate}>{e.startDate}{e.endDate ? ` – ${e.endDate}` : ''}{e.current ? ' · Present' : ''}</span>
                  </div>
                  {e.description && <p className={styles.itemDesc}>{e.description}</p>}
                  <div className={styles.itemActions}>
                    <button type="button" className={styles.editLink} onClick={() => { setEditExp({ ...e }); setEditExpIndex(i); setEditing('experience'); }}>Edit</button>
                    <button type="button" className={styles.editLink} onClick={() => handleDeleteExperience(i)}>Delete</button>
                  </div>
                </div>
              ))}
              <button type="button" className={styles.addBtn} onClick={() => { setEditExp(emptyExp()); setEditExpIndex(-1); setEditing('experience'); }}>+ Add experience</button>
            </>
          )}
        </div>

        {/* Education */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Education</h2>
          {editing === 'education' && editEdu !== null ? (
            <div className={styles.editBlock}>
              <input type="text" placeholder="School" value={editEdu.school} onChange={(e) => setEditEdu({ ...editEdu, school: e.target.value })} className={styles.input} />
              <input type="text" placeholder="Degree" value={editEdu.degree} onChange={(e) => setEditEdu({ ...editEdu, degree: e.target.value })} className={styles.input} />
              <input type="text" placeholder="Field of study" value={editEdu.field} onChange={(e) => setEditEdu({ ...editEdu, field: e.target.value })} className={styles.input} />
              <div className={styles.row}>
                <input type="text" placeholder="Start date" value={editEdu.startDate} onChange={(e) => setEditEdu({ ...editEdu, startDate: e.target.value })} className={styles.input} />
                <input type="text" placeholder="End date" value={editEdu.endDate} onChange={(e) => setEditEdu({ ...editEdu, endDate: e.target.value })} className={styles.input} />
              </div>
              <textarea placeholder="Description" value={editEdu.description} onChange={(e) => setEditEdu({ ...editEdu, description: e.target.value })} className={styles.textarea} rows={2} />
              <div className={styles.actions}>
                <button type="button" onClick={() => { setEditEdu(null); setEditEduIndex(-1); setEditing(null); }}>Cancel</button>
                <button type="button" onClick={handleSaveEducation} disabled={saving}>Save</button>
              </div>
            </div>
          ) : (
            <>
              {edu.length === 0 && <p className={styles.placeholder}>Add your education.</p>}
              {edu.map((e, i) => (
                <div key={e._id || i} className={styles.item}>
                  <div className={styles.itemHead}>
                    <span className={styles.itemTitle}>{e.school}</span>
                    <span className={styles.itemSub}>{e.degree}{e.field ? `, ${e.field}` : ''}</span>
                    <span className={styles.itemDate}>{e.startDate}{e.endDate ? ` – ${e.endDate}` : ''}</span>
                  </div>
                  {e.description && <p className={styles.itemDesc}>{e.description}</p>}
                  <div className={styles.itemActions}>
                    <button type="button" className={styles.editLink} onClick={() => { setEditEdu({ ...e }); setEditEduIndex(i); setEditing('education'); }}>Edit</button>
                    <button type="button" className={styles.editLink} onClick={() => handleDeleteEducation(i)}>Delete</button>
                  </div>
                </div>
              ))}
              <button type="button" className={styles.addBtn} onClick={() => { setEditEdu(emptyEdu()); setEditEduIndex(-1); setEditing('education'); }}>+ Add education</button>
            </>
          )}
        </div>

        {/* Skills */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Skills</h2>
          {editing === 'skills' ? (
            <div className={styles.editBlock}>
              <input
                type="text"
                value={editSkills}
                onChange={(e) => setEditSkills(e.target.value)}
                placeholder="Separate with commas (e.g. JavaScript, React, Node.js)"
                className={styles.input}
              />
              <div className={styles.actions}>
                <button type="button" onClick={() => setEditing(null)}>Cancel</button>
                <button type="button" onClick={handleSaveSkills} disabled={saving}>Save</button>
              </div>
            </div>
          ) : (
            <>
              {skills.length === 0 && <p className={styles.placeholder}>Add skills.</p>}
              <div className={styles.skillsWrap}>
                {skills.map((s, i) => (
                  <span key={i} className={styles.skillTag}>{s}</span>
                ))}
              </div>
              <button type="button" className={styles.editLink} onClick={() => { setEditSkills(skills.join(', ')); setEditing('skills'); }}>Edit</button>
            </>
          )}
        </div>

        {error && <div className={styles.errorMsg}>{error}</div>}
      </div>
    </div>
  );
}
