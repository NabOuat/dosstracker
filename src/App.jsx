import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider }  from './context/AuthContext'
import ProtectedRoute    from './components/ProtectedRoute'
import Layout            from './components/Layout'
import LogViewer         from './components/LogViewer'
import Login             from './pages/Login'
import ForgotPassword    from './pages/ForgotPassword'
import ResetPassword     from './pages/ResetPassword'
import Dashboard         from './pages/Dashboard'
import Courrier          from './pages/Courrier'
import SpfeiAdmin        from './pages/SpfeiAdmin'
import Scvaa             from './pages/Scvaa'
import SpfeiTitre        from './pages/SpfeiTitre'
import DemandesAPFR      from './pages/DemandesAPFR'
import SmsLog            from './pages/SmsLog'
import SmsTest           from './pages/SmsTest'
import Dossiers          from './pages/Dossiers'
import Parametres        from './pages/Parametres'
import Admin             from './pages/Admin'
import logger            from './utils/logger'

export default function App() {
  logger.info('Application DosTracker démarrée');
  
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Routes publiques ── */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* ── Routes protégées ── */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/"            element={<Dashboard />}  />
              <Route path="/courrier"    element={<Courrier />}   />
              <Route path="/courrier/envoyer" element={<Courrier mode="envoyer" />} />
              <Route path="/spfei/admin" element={<SpfeiAdmin />} />
              <Route path="/spfei/titre" element={<SpfeiTitre />} />
              <Route path="/spfei/apfr"  element={<DemandesAPFR />} />
              <Route path="/scvaa"       element={<Scvaa />}      />
              <Route path="/sms"         element={<SmsLog />}     />
              <Route path="/sms-test"    element={<SmsTest />}    />
              <Route path="/dossiers"    element={<Dossiers />}   />
              <Route path="/parametres"  element={<Parametres />} />
              <Route path="/admin"       element={<Admin />}      />
            </Route>
          </Route>

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <LogViewer />
      </BrowserRouter>
    </AuthProvider>
  )
}
