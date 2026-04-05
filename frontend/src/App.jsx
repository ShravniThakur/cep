import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home             from './pages/Home';
import Login            from './pages/Login';
import Register         from './pages/Register';
import JobListings      from './pages/JobListings';
import JobDetails       from './pages/JobDetails';
import Profile          from './pages/Profile';
import AppliedJobs      from './pages/AppliedJobs';
import Bookmarks        from './pages/Bookmarks';
import RecruiterDashboard from './pages/RecruiterDashboard';
import PostJob          from './pages/PostJob';
import AdminPanel       from './pages/AdminPanel';
import NotFound         from './pages/NotFound';

const ProtectedRoute = ({ children, roles }) => {
  const { isLoggedIn, user } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <Navigate to="/" replace /> : children;
};

const AppContent = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/"            element={<Home />} />
          <Route path="/jobs"        element={<JobListings />} />
          <Route path="/jobs/:id"    element={<JobDetails />} />

          <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/applied-jobs" element={<ProtectedRoute roles={['jobseeker']}><AppliedJobs /></ProtectedRoute>} />
          <Route path="/bookmarks"    element={<ProtectedRoute roles={['jobseeker']}><Bookmarks /></ProtectedRoute>} />

          <Route path="/dashboard"  element={<ProtectedRoute roles={['recruiter']}><RecruiterDashboard /></ProtectedRoute>} />
          <Route path="/post-job"   element={<ProtectedRoute roles={['recruiter']}><PostJob /></ProtectedRoute>} />
          <Route path="/edit-job/:id" element={<ProtectedRoute roles={['recruiter']}><PostJob /></ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminPanel /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}
