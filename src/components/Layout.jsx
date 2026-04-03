import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Menu, Bell, Settings, X, CheckCircle, AlertCircle, LogOut } from 'lucide-react'
import Sidebar, { SIDEBAR_W } from './Sidebar'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

/* ── Thèmes d'arrière-plan par service ── */
const BG_THEMES = {
  1: { // Courrier – enveloppes flottantes orange
    orbs: [
      { color: 'rgba(244,121,32,0.09)', size: 520, x: '12%', y: '18%', anim: 'bgOrbA', dur: '18s', delay: '0s' },
      { color: 'rgba(244,121,32,0.06)', size: 350, x: '72%', y: '55%', anim: 'bgOrbB', dur: '22s', delay: '3s' },
      { color: 'rgba(244,121,32,0.07)', size: 280, x: '45%', y: '82%', anim: 'bgOrbC', dur: '15s', delay: '6s' },
    ],
    particles: [
      { type: 'env', x: '18%', y: '40%', s: 26, d: '0s',   dur: '13s', op: 0.20 },
      { type: 'env', x: '65%', y: '22%', s: 18, d: '2.5s', dur: '16s', op: 0.14 },
      { type: 'env', x: '40%', y: '75%', s: 22, d: '5s',   dur: '12s', op: 0.17 },
      { type: 'env', x: '80%', y: '58%', s: 16, d: '3.5s', dur: '15s', op: 0.12 },
      { type: 'env', x: '25%', y: '88%', s: 20, d: '7s',   dur: '14s', op: 0.14 },
    ],
  },
  2: { // SPFEI – anneaux expansifs bleus
    orbs: [
      { color: 'rgba(59,130,246,0.08)',  size: 500, x: '75%', y: '12%', anim: 'bgOrbB', dur: '20s', delay: '0s' },
      { color: 'rgba(59,130,246,0.05)',  size: 300, x: '20%', y: '65%', anim: 'bgOrbA', dur: '25s', delay: '4s' },
      { color: 'rgba(99,102,241,0.06)',  size: 220, x: '55%', y: '40%', anim: 'bgOrbC', dur: '17s', delay: '8s' },
    ],
    particles: [
      { type: 'ring', x: '22%', y: '42%', s: 90,  d: '0s',  dur: '9s',  op: 0.16 },
      { type: 'ring', x: '62%', y: '62%', s: 130, d: '3s',  dur: '11s', op: 0.12 },
      { type: 'ring', x: '78%', y: '28%', s: 70,  d: '5s',  dur: '8s',  op: 0.14 },
      { type: 'ring', x: '38%', y: '82%', s: 110, d: '7s',  dur: '10s', op: 0.11 },
      { type: 'ring', x: '50%', y: '15%', s: 60,  d: '2s',  dur: '7s',  op: 0.15 },
    ],
  },
  3: { // SCVAA – hexagones montants verts
    orbs: [
      { color: 'rgba(0,133,63,0.09)', size: 480, x: '15%', y: '25%', anim: 'bgOrbC', dur: '19s', delay: '0s' },
      { color: 'rgba(0,133,63,0.06)', size: 320, x: '68%', y: '60%', anim: 'bgOrbA', dur: '23s', delay: '5s' },
      { color: 'rgba(0,133,63,0.07)', size: 240, x: '42%', y: '85%', anim: 'bgOrbB', dur: '16s', delay: '2s' },
    ],
    particles: [
      { type: 'hex', x: '15%', y: '92%', s: 32, d: '0s',   dur: '14s', op: 0.19 },
      { type: 'hex', x: '50%', y: '96%', s: 24, d: '2.5s', dur: '17s', op: 0.15 },
      { type: 'hex', x: '78%', y: '90%', s: 36, d: '4s',   dur: '13s', op: 0.17 },
      { type: 'hex', x: '32%', y: '94%', s: 20, d: '6s',   dur: '16s', op: 0.13 },
      { type: 'hex', x: '92%', y: '88%', s: 28, d: '3s',   dur: '15s', op: 0.15 },
      { type: 'hex', x: '65%', y: '98%', s: 18, d: '8s',   dur: '18s', op: 0.12 },
    ],
  },
  4: { // Admin – étoiles scintillantes violettes
    orbs: [
      { color: 'rgba(139,92,246,0.09)', size: 550, x: '60%', y: '10%', anim: 'bgOrbA', dur: '21s', delay: '0s' },
      { color: 'rgba(139,92,246,0.06)', size: 300, x: '10%', y: '55%', anim: 'bgOrbC', dur: '26s', delay: '6s' },
      { color: 'rgba(99,102,241,0.07)', size: 200, x: '38%', y: '78%', anim: 'bgOrbB', dur: '14s', delay: '3s' },
    ],
    particles: [
      { type: 'star', x: '14%', y: '14%', s: 20, d: '0s',   dur: '3.2s', op: 0.30 },
      { type: 'star', x: '42%', y: '27%', s: 14, d: '1.1s', dur: '2.6s', op: 0.25 },
      { type: 'star', x: '72%', y: '38%', s: 22, d: '0.6s', dur: '3.8s', op: 0.22 },
      { type: 'star', x: '28%', y: '58%', s: 16, d: '2.2s', dur: '3.0s', op: 0.28 },
      { type: 'star', x: '85%', y: '22%', s: 18, d: '1.6s', dur: '3.4s', op: 0.24 },
      { type: 'star', x: '58%', y: '72%', s: 12, d: '0.9s', dur: '2.5s', op: 0.22 },
      { type: 'star', x: '12%', y: '82%', s: 16, d: '2.8s', dur: '3.1s', op: 0.20 },
      { type: 'star', x: '90%', y: '65%', s: 10, d: '1.4s', dur: '2.8s', op: 0.25 },
    ],
  },
}
const DEFAULT_THEME = BG_THEMES[1]

function Particle({ p }) {
  const base = { display: 'block', animationDelay: p.d }
  if (p.type === 'env') return (
    <div style={{ position: 'absolute', left: p.x, top: p.y }}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 24" style={{ ...base, width: p.s * 1.5, height: p.s, animation: `bgEnvFloat ${p.dur} ease-in-out infinite` }}>
        <rect width="36" height="24" rx="3" fill={`rgba(244,121,32,${p.op})`}/>
        <path d="M0 1.5 L18 14 L36 1.5" stroke={`rgba(200,94,8,${p.op * 0.85})`} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      </svg>
    </div>
  )
  if (p.type === 'ring') return (
    <div style={{ position: 'absolute', left: p.x, top: p.y }}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" style={{ ...base, width: p.s, height: p.s, animation: `bgRingExpand ${p.dur} ease-out infinite` }}>
        <circle cx="50" cy="50" r="46" stroke={`rgba(59,130,246,${p.op})`} strokeWidth="3" fill="none"/>
        <circle cx="50" cy="50" r="34" stroke={`rgba(99,102,241,${p.op * 0.6})`} strokeWidth="2" fill="none"/>
      </svg>
    </div>
  )
  if (p.type === 'hex') return (
    <div style={{ position: 'absolute', left: p.x, top: p.y }}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 116" style={{ ...base, width: p.s, height: p.s * 1.15, animation: `bgHexFloat ${p.dur} ease-in-out infinite` }}>
        <polygon points="50,3 97,27 97,89 50,113 3,89 3,27" fill="none" stroke={`rgba(0,133,63,${p.op})`} strokeWidth="5"/>
      </svg>
    </div>
  )
  if (p.type === 'star') return (
    <div style={{ position: 'absolute', left: p.x, top: p.y }}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" style={{ ...base, width: p.s, height: p.s, animation: `bgStarTwinkle ${p.dur} ease-in-out infinite` }}>
        <polygon points="50,2 63,37 100,37 70,59 82,95 50,74 18,95 30,59 0,37 37,37" fill={`rgba(167,139,250,${p.op})`}/>
      </svg>
    </div>
  )
  return null
}

function ServiceBackground({ serviceId }) {
  const theme = BG_THEMES[serviceId] ?? DEFAULT_THEME
  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
      {/* Orbes flous */}
      {theme.orbs.map((orb, i) => (
        <div key={`orb-${i}`} style={{
          position: 'absolute', left: orb.x, top: orb.y,
          width: orb.size, height: orb.size, background: orb.color,
          borderRadius: '50%', filter: 'blur(80px)',
          animation: `${orb.anim} ${orb.dur} ease-in-out infinite`,
          animationDelay: orb.delay, transform: 'translate(-50%,-50%)',
        }}/>
      ))}
      {/* Particules uniques par service */}
      {theme.particles.map((p, i) => <Particle key={`p-${i}`} p={p} />)}
    </div>
  )
}

// Données de notifications fictives pour la démo
const MOCK_NOTIFICATIONS = [
  { id: 1, title: 'Nouveau dossier', message: 'Un nouveau dossier a été créé', time: '5 min', read: false, type: 'info' },
  { id: 2, title: 'Dossier non conforme', message: 'Le dossier DOS-2024-0140 a été marqué comme non conforme', time: '1 heure', read: false, type: 'warning' },
  { id: 3, title: 'SMS envoyé', message: 'Notification envoyée au propriétaire du dossier DOS-2024-0139', time: '3 heures', read: true, type: 'success' },
  { id: 4, title: 'Maintenance prévue', message: 'Une maintenance est prévue ce soir à 22h', time: '1 jour', read: true, type: 'info' },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const unreadCount = notifications.filter(n => !n.read).length
  
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }
  
  const goToSettings = () => {
    setNotificationsOpen(false)
    navigate('/parametres')
  }

  // Composant pour le widget de notifications
  const NotificationsWidget = () => (
    <AnimatePresence>
      {notificationsOpen && (
        <motion.div 
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-50"
          style={{ boxShadow: 'var(--shadow-lg)' }}
        >
          <div className="p-3 border-b border-neutral-100 flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-neutral-800">Notifications</h3>
            <div className="flex gap-1">
              <button 
                onClick={markAllAsRead}
                className="text-xs text-neutral-500 hover:text-neutral-700 px-2 py-1 rounded hover:bg-neutral-100 transition-colors"
              >
                Tout marquer comme lu
              </button>
              <button 
                onClick={() => setNotificationsOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 p-1 rounded-full hover:bg-neutral-100 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>
          
          <div className="max-h-[300px] overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="divide-y divide-neutral-100">
                {notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    className={`p-3 hover:bg-neutral-50 transition-colors cursor-pointer ${!notif.read ? 'bg-blue-50/30' : ''}`}
                  >
                    <div className="flex gap-3">
                      <div className="shrink-0 mt-0.5">
                        {notif.type === 'success' && <CheckCircle size={18} className="text-green-500" />}
                        {notif.type === 'warning' && <AlertCircle size={18} className="text-orange-500" />}
                        {notif.type === 'info' && <Bell size={18} className="text-blue-500" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-800">{notif.title}</p>
                        <p className="text-xs text-neutral-600 mt-0.5">{notif.message}</p>
                        <p className="text-[10px] text-neutral-400 mt-1">{notif.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-neutral-400">
                <p className="text-sm">Aucune notification</p>
              </div>
            )}
          </div>
          
          <div className="p-2 border-t border-neutral-100 bg-neutral-50">
            <button 
              onClick={goToSettings}
              className="w-full text-xs text-neutral-600 py-2 rounded hover:bg-neutral-100 transition-colors flex items-center justify-center gap-1"
            >
              <Settings size={12} />
              Paramètres de notifications
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Contenu principal décalé à droite sur desktop */}
      <div
        className="min-h-screen flex flex-col transition-all duration-300 w-full"
        style={{ marginLeft: 0 }}
      >
        {/* Topbar mobile */}
        <header
          className="md:hidden fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-4 h-14 bg-white"
          style={{ borderBottom: '1px solid var(--neutral-200)', boxShadow: 'var(--shadow-sm)' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100 transition-colors"
            aria-label="Ouvrir le menu"
          >
            <Menu size={22} />
          </button>

          <span className="font-display font-bold text-base text-neutral-900">
            Dos<span style={{ color: 'var(--ci-orange)' }}>Tracker</span>
          </span>

          <div className="relative">
            <button
              className="w-9 h-9 flex items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 transition-colors"
              aria-label="Notifications"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <NotificationsWidget />
          </div>
        </header>

        {/* Topbar desktop (après sidebar) */}
        <header
          className={`hidden md:flex fixed top-0 right-0 z-10 h-14 items-center justify-between px-6 bg-white`}
          style={{
            left: SIDEBAR_W,
            borderBottom: '1px solid var(--neutral-200)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <p className="font-display font-bold text-sm text-neutral-800">
            {user?.nom_complet || user?.label || user?.username || ''}
          </p>
          <div className="relative">
            <button
              className="w-9 h-9 flex items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 transition-colors"
              aria-label="Notifications"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <NotificationsWidget />
          </div>
        </header>

        {/* Zone page */}
        <main
          className="flex-1 pt-14 w-full overflow-x-hidden md:pl-64"
          style={{ position: 'relative', background: 'var(--n-50)' }}
        >
          <ServiceBackground serviceId={user?.service_id} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
