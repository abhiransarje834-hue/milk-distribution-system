import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Login from './pages/Login'
import AdminDashboard from './pages/admin/AdminDashboard'
import DistributorDashboard from './pages/distributor/DistributorDashboard'
import DeliveryDashboard from './pages/delivery/DeliveryDashboard'
import Customers from './pages/distributor/Customers'
import DeliveryBoys from './pages/distributor/DeliveryBoys'
import DailyDelivery from './pages/delivery/DailyDelivery'
import MyCustomers from './pages/delivery/MyCustomers'
import Billing from './pages/distributor/Billing'
import Reports from './pages/distributor/Reports'
import MilkPrices from './pages/distributor/MilkPrices'
import Settings from './pages/Settings'

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function RoleRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />
  if (user.role === 'DISTRIBUTOR') return <Navigate to="/distributor" replace />
  return <Navigate to="/delivery" replace />
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<RoleRedirect />} />
            <Route path="/admin" element={
              <ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>
            } />
            <Route path="/distributor" element={
              <ProtectedRoute roles={['DISTRIBUTOR']}><DistributorDashboard /></ProtectedRoute>
            } />
            <Route path="/distributor/customers" element={
              <ProtectedRoute roles={['DISTRIBUTOR']}><Customers /></ProtectedRoute>
            } />
            <Route path="/distributor/delivery-boys" element={
              <ProtectedRoute roles={['DISTRIBUTOR']}><DeliveryBoys /></ProtectedRoute>
            } />
            <Route path="/distributor/billing" element={
              <ProtectedRoute roles={['DISTRIBUTOR']}><Billing /></ProtectedRoute>
            } />
            <Route path="/distributor/reports" element={
              <ProtectedRoute roles={['DISTRIBUTOR']}><Reports /></ProtectedRoute>
            } />
            <Route path="/distributor/milk-prices" element={
              <ProtectedRoute roles={['DISTRIBUTOR']}><MilkPrices /></ProtectedRoute>
            } />
            <Route path="/delivery" element={
              <ProtectedRoute roles={['DELIVERY_BOY']}><DeliveryDashboard /></ProtectedRoute>
            } />
            <Route path="/delivery/entry" element={
              <ProtectedRoute roles={['DELIVERY_BOY']}><DailyDelivery /></ProtectedRoute>
            } />
            <Route path="/delivery/customers" element={
              <ProtectedRoute roles={['DELIVERY_BOY']}><MyCustomers /></ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute roles={['ADMIN','DISTRIBUTOR','DELIVERY_BOY']}><Settings /></ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
