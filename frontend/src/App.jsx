import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BlogFeedbackPage } from './Pages/BlogFeedbackPage';
import { StudentFeedbackHistory } from './Pages/StudentFeedbackHistory';
import { CanteenFeedbackDashboard } from './Pages/CanteenFeedbackDashboard';
import { CanteenRanking } from './Pages/CanteenRanking';
import { CanteenFeedbackPage } from './Pages/CanteenFeedbackPage';
export default function App() {
    return (<HashRouter future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
        }}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<BlogFeedbackPage />}/>
        <Route path="/blog" element={<BlogFeedbackPage />}/>

        {/* Feedback Routes */}
        <Route path="/student/feedback/history" element={<StudentFeedbackHistory />}/>
        <Route path="/vendors/:vendorId/feedback" element={<CanteenFeedbackPage />}/>
        <Route path="/vendor/canteens/:vendorId/feedback-dashboard" element={<CanteenFeedbackDashboard />}/>
        <Route path="/admin/vendors/ranking" element={<CanteenRanking />}/>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>
    </HashRouter>);
}
