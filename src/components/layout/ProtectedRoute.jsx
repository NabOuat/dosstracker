import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

/**
 * Garde de route – redirige vers /login si non authentifié.
 * Utiliser comme route wrapper dans App.jsx :
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/" element={<Dashboard />} />
 *   </Route>
 */
export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}
