import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PostJob from './pages/PostJob';
import JobDetail from './pages/JobDetail';
import MyJobs from './pages/MyJobs';
import Profile from './pages/Profile';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="post" element={<PostJob />} />
        <Route path="post/:id" element={<PostJob />} />
        <Route path="jobs/:id" element={<JobDetail />} />
        <Route path="my-jobs" element={<MyJobs />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
