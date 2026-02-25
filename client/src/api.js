const BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('loyseconnect_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseJson(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

async function handleRes(res, defaultMessage = 'Request failed') {
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.message || defaultMessage);
  return data;
}

export async function login(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await handleRes(res, 'Login failed');
  return data;
}

export async function loginWithGoogle(idToken) {
  const res = await fetch(`${BASE}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  const data = await handleRes(res, 'Google sign-in failed');
  return data;
}

export async function register(name, email, password) {
  const res = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await handleRes(res, 'Registration failed');
  return data;
}

export async function fetchJobs(params = {}) {
  const search = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}/jobs${search ? `?${search}` : ''}`);
  const data = await handleRes(res, 'Failed to fetch jobs');
  return Array.isArray(data) ? data : [];
}

export async function fetchJob(id) {
  const res = await fetch(`${BASE}/jobs/${id}`);
  return handleRes(res, 'Failed to fetch job');
}

export async function createJob(body) {
  const res = await fetch(`${BASE}/jobs`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  return handleRes(res, 'Failed to create job');
}

export async function updateJob(id, body) {
  const res = await fetch(`${BASE}/jobs/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  return handleRes(res, 'Failed to update job');
}

export async function deleteJob(id) {
  const res = await fetch(`${BASE}/jobs/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (res.status === 204) return {};
  const data = await handleRes(res, 'Failed to delete job');
  return data;
}

export async function fetchMyJobs() {
  const res = await fetch(`${BASE}/jobs?mine=1`, { headers: getAuthHeaders() });
  const data = await handleRes(res, 'Failed to fetch your jobs');
  return Array.isArray(data) ? data : [];
}

export async function getProfile() {
  const res = await fetch(`${BASE}/users/me`, { headers: getAuthHeaders() });
  return handleRes(res, 'Failed to load profile');
}

export async function updateProfile(body) {
  const res = await fetch(`${BASE}/users/me`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  return handleRes(res, 'Failed to update profile');
}
