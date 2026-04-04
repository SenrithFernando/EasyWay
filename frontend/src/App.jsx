<<<<<<< HEAD
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Feedback Pages
import { BlogFeedbackPage } from './Pages/BlogFeedbackPage';
import { StudentFeedbackHistory } from './Pages/StudentFeedbackHistory';
import { CanteenFeedbackDashboard } from './Pages/CanteenFeedbackDashboard';
import { CanteenRanking } from './Pages/CanteenRanking';
import { CanteenFeedbackPage } from './Pages/CanteenFeedbackPage';

// Application Pages (from pre-dev)
import { LoginPage } from './Pages/LoginPage';
import { ReservationPage } from './Pages/ReservationPage';
import { StudentDashboard } from './Pages/StudentDashboard';
import { ProfilePage } from './Pages/ProfilePage';
import { LandingPage } from './Pages/LandingPage';
import { TableCheckInPage } from './Pages/TableCheckInPage';

function App() {
  return (
    <BrowserRouter future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }}>
      <Routes>
        {/* Main Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Feedback Module Routes */}
        <Route path="/blog" element={<BlogFeedbackPage />} />
        <Route path="/student/feedback/history" element={<StudentFeedbackHistory />} />
        <Route path="/vendors/:vendorId/feedback" element={<CanteenFeedbackPage />} />
        <Route path="/vendor/canteens/:vendorId/feedback-dashboard" element={<CanteenFeedbackDashboard />} />
        <Route path="/admin/vendors/ranking" element={<CanteenRanking />} />

        {/* Core App Routes */}
        <Route path="/table" element={<ReservationPage />} />
        <Route path="/vendor" element={<Navigate to="/login" replace />} />
        <Route path="/admin" element={<Navigate to="/login" replace />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/checkin/:location/:tableId" element={<TableCheckInPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
=======
import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { ReservationPage } from './pages/ReservationPage'
import { StudentDashboard } from './pages/StudentDashboard'
import { ProfilePage } from './pages/ProfilePage'
import { LandingPage } from './pages/LandingPage'
import MenuItemsPage from './pages/vendor/MenuItemsPage.jsx'
import StudentOrderPage from './pages/student/StudentOrderPage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/table" element={<ReservationPage />} />
      <Route path="/vendor" element={<Navigate to="/login" replace />} />
      <Route path="/admin" element={<Navigate to="/login" replace />} />
      <Route path="/student" element={<StudentDashboard />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/vendor/menu-items" element={<MenuItemsPage />} />
      <Route path="/student/order" element={<StudentOrderPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
>>>>>>> origin/Order-and-Menu
}

export default App;
