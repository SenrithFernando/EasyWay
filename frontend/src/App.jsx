import { Routes, Route, Navigate } from 'react-router-dom'
import MenuItemsPage from './pages/vendor/MenuItemsPage.jsx'
import StudentOrderPage from './pages/student/StudentOrderPage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/vendor/menu-items" element={<MenuItemsPage />} />
      <Route path="/student/order" element={<StudentOrderPage />} />
      <Route path="*" element={<Navigate to="/student/order" replace />} />
    </Routes>
  )
}

export default App
