import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Core and Auth Pages
import { LoginPage } from './pages/LoginPage';
import { ReservationPage } from './pages/ReservationPage';
import { StudentDashboard } from './pages/StudentDashboard';
import VendorDashboard from './pages/VendorDashboard';
import { ProfilePage } from './pages/ProfilePage';
import { LandingPage } from './pages/LandingPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { TableCheckInPage } from './pages/TableCheckInPage';
import { BlogPage } from './pages/BlogPage';
import { BlogDetailPage } from './pages/BlogDetailPage';
import { CanteenPage } from './pages/CanteenPage';

// Specialized Feature Pages
import MenuItemsPage from './pages/MenuItemsPage.jsx';
import StudentOrderPage from './pages/StudentOrderPage.jsx';
import ChatBotPage from './pages/ChatBotPage.jsx';

// Feedback Module Pages
import { BlogFeedbackPage } from './pages/BlogFeedbackPage';
import { StudentFeedbackHistory } from './pages/StudentFeedbackHistory';
import { CanteenFeedbackDashboard } from './pages/CanteenFeedbackDashboard';
import { CanteenRanking } from './pages/CanteenRanking';
import { CanteenFeedbackPage } from './pages/CanteenFeedbackPage';
import { AdminFeedbackDashboard } from './pages/AdminFeedbackDashboard';
import { VendorReviewsPage } from './pages/VendorReviewsPage';
import { VendorAnalyticsPage } from './pages/VendorAnalyticsPage';
import { AdminCanteenFeedbacksPage } from './pages/AdminCanteenFeedbacksPage';

function App() {
  return (
    <>
      <Routes>
        {/* Main Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Feedback Module Routes */}
        <Route path="/feedback" element={<BlogFeedbackPage />} />
        <Route path="/student/feedback/history" element={<StudentFeedbackHistory />} />
        <Route path="/vendors/:vendorId/feedback" element={<CanteenFeedbackPage />} />
        <Route path="/vendor/canteens/:vendorId/feedback-dashboard" element={<CanteenFeedbackDashboard />} />
        <Route path="/vendor/reviews" element={<VendorReviewsPage />} />
        <Route path="/vendor/analytics" element={<VendorAnalyticsPage />} />
        <Route path="/admin/feedback-dashboard" element={<AdminFeedbackDashboard />} />
        <Route path="/admin/canteen-feedbacks" element={<AdminCanteenFeedbacksPage />} />
        <Route path="/admin/vendors/ranking" element={<CanteenRanking />} />

        {/* Core App Routes */}
        <Route path="/table" element={<ReservationPage />} />
        <Route path="/vendor" element={<VendorDashboard />} />
        <Route path="/vendor-dashboard" element={<Navigate to="/vendor" replace />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin" element={<Navigate to="/login" replace />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:id" element={<BlogDetailPage />} />
        <Route path="/checkin/:location/:tableId" element={<TableCheckInPage />} />
        
        {/* Additional Pages */}
        <Route path="/canteen" element={<CanteenPage />} />
        <Route path="/chatbot" element={<ChatBotPage />} />

        {/* Order and Menu Routes */}
        <Route path="/menu" element={<StudentOrderPage />} />
        <Route path="/vendor/menu-items" element={<MenuItemsPage />} />
        <Route path="/student/order" element={<StudentOrderPage initialTab="orders" />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
