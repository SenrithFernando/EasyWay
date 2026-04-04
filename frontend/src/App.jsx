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
      <Route path="/menu" element={<StudentOrderPage initialTab="menu" />} />
      <Route path="/vendor/menu-items" element={<MenuItemsPage />} />
      <Route path="/student/order" element={<StudentOrderPage initialTab="orders" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
