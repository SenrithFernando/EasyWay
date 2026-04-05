import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { ReservationPage } from './pages/ReservationPage'
import { StudentDashboard } from './pages/StudentDashboard'
import { VendorDashboard } from './pages/VendorDashboard'
import { ProfilePage } from './pages/ProfilePage'
import { LandingPage } from './pages/LandingPage'
import { BlogPage } from './pages/BlogPage'
import { BlogDetailPage } from './pages/BlogDetailPage'
import { CanteenPage } from './pages/CanteenPage'
import { MenuPage } from './pages/MenuPage'
import { AdminDashboard } from './pages/AdminDashboard'


function App() {
  return (
    <BrowserRouter>
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
        <Route path="/menu" element={<MenuPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
