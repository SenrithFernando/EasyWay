import { Routes, Route, Navigate } from 'react-router-dom'
import MenuItemsPage from './pages/vendor/MenuItemsPage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/vendor/menu-items" element={<MenuItemsPage />} />
      <Route path="*" element={<Navigate to="/vendor/menu-items" replace />} />
    </Routes>
  )
}

export default App
