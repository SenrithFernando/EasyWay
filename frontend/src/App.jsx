import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { ReservationPage } from './pages/ReservationPage'
import { StudentDashboard } from './pages/StudentDashboard'
import { VendorDashboard } from './pages/VendorDashboard'
import { ProfilePage } from './pages/ProfilePage'
import { LandingPage } from './pages/LandingPage'
import { BlogPage } from './pages/BlogPage'
import { BlogDetailPage } from './pages/BlogDetailPage'
import { CanteenPage } from './pages/CanteenPage'
import { AdminDashboard } from './pages/AdminDashboard'
import MenuItemsPage from './pages/vendor/MenuItemsPage.jsx'
import StudentOrderPage from './pages/student/StudentOrderPage.jsx'
import ChatBotPage from './pages/student/ChatBotPage.jsx'
import { TableCheckInPage } from './pages/TableCheckInPage'


function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/table" element={<ReservationPage />} />
        <Route path="/vendor" element={<VendorDashboard />} />
        <Route path="/vendor-dashboard" element={<Navigate to="/vendor" replace />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin" element={<Navigate to="/login" replace />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:id" element={<BlogDetailPage />} />
        <Route path="/canteen" element={<CanteenPage />} />
        <Route path="/menu" element={<StudentOrderPage />} />
        <Route path="/chatbot" element={<ChatBotPage />} />
      <Route path="/vendor/menu-items" element={<MenuItemsPage />} />
      <Route path="/student/order" element={<StudentOrderPage initialTab="orders" />} />
      <Route path="/checkin/:location/:tableId" element={<TableCheckInPage />} />
      



      </Routes>
    </>
  )
}

export default App
