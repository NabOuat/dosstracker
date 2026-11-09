import { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Outlet, useNavigate } from 'react-router-dom'
import { Menu, Bell, Settings, X, CheckCircle, AlertCircle, LogOut } from 'lucide-react'
import Sidebar, { SIDEBAR_W } from './Sidebar'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { getNotifications } from '../api/notifications'

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
      {theme.orbs.map((orb, i) => (
        <div key={`orb-${i}`} style={{
          position: 'absolute', left: orb.x, top: orb.y,
          width: orb.size, height: orb.size, background: orb.color,
          borderRadius: '50%', filter: 'blur(80px)',
          animation: `${orb.anim} ${orb.dur} ease-in-out infinite`,
          animationDelay: orb.delay, transform: 'translate(-50%,-50%)',
        }}/>
      ))}
      {theme.particles.map((p, i) => <Particle key={`p-${i}`} p={p} />)}
    </div>
  )
}

function formatRelativeTime(isoStr) {
  if (!isoStr) return ''
  const diff = (Date.now() - new Date(isoStr)) / 1000
  if (diff < 60) return 'À l\'instant'
  if (diff < 3600) return `${Math.floor(diff / 60)} min`
  if (diff < 86400) return `${Math.floor(diff / 3600)} h`
  return `${Math.floor(diff / 86400)} j`
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [dropdownPos, setDropdownPos] = useState({ top: 56, right: 16 })
  const [clearedAt, setClearedAt] = useState(null)
  const mobileBellRef = useRef(null)
  const desktopBellRef = useRef(null)
  const { user } = useAuth()
  const navigate = useNavigate()

  // Charger le timestamp "vider" depuis localStorage dès que l'utilisateur est connu
  useEffect(() => {
    if (user?.id) {
      setClearedAt(localStorage.getItem(`notif_cleared_${user.id}`))
    }
  }, [user?.id])

  const unreadCount = notifications.filter(n => !clearedAt || (n.time && n.time > clearedAt)).length

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await getNotifications()
      setNotifications(Array.isArray(data) ? data : [])
    } catch {
      // silencieux si non connecté
    }
  }, [])

  // Chargement initial + rafraîchissement toutes les 2 minutes
  useEffect(() => {
    if (!user) return
    fetchNotifications()
    const id = setInterval(fetchNotifications, 120_000)
    return () => clearInterval(id)
  }, [user, fetchNotifications])

  const openNotifications = (bellRef) => {
    if (!notificationsOpen) {
      const rect = bellRef.current?.getBoundingClientRect()
      if (rect) {
        setDropdownPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right })
      }
      fetchNotifications()
    }
    setNotificationsOpen(v => !v)
  }

  const clearAll = () => {
    const now = new Date().toISOString()
    if (user?.id) {
      localStorage.setItem(`notif_cleared_${user.id}`, now)
      setClearedAt(now)
    }
    setNotificationsOpen(false)
  }

  const goToSettings = () => {
    setNotificationsOpen(false)
    navigate('/parametres')
  }

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div
        className="min-h-screen flex flex-col transition-all duration-300 w-full"
        style={{ marginLeft: 0 }}
      >
        {/* Topbar mobile */}
        <header
          className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 h-14 bg-white"
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
              ref={mobileBellRef}
              className="w-9 h-9 flex items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 transition-colors"
              aria-label="Notifications"
              onClick={() => openNotifications(mobileBellRef)}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Topbar desktop */}
        <header
          className="hidden md:flex fixed top-0 right-0 z-30 h-14 items-center justify-between px-6 bg-white"
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
              ref={desktopBellRef}
              className="w-9 h-9 flex items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 transition-colors"
              aria-label="Notifications"
              onClick={() => openNotifications(desktopBellRef)}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
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

      {/* ── Dropdown notifications via portal (hors de tout contexte d'empilement) ── */}
      {createPortal(
        <AnimatePresence>
          {notificationsOpen && (
            <>
              {/* Fond transparent pour fermer au clic extérieur */}
              <motion.div
                key="notif-overlay"
                className="fixed inset-0"
                style={{ zIndex: 1100 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setNotificationsOpen(false)}
              />

              {/* Panneau dropdown */}
              <motion.div
                key="notif-panel"
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'fixed',
                  top: dropdownPos.top,
                  right: dropdownPos.right,
                  width: 320,
                  zIndex: 1101,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.16)',
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: '#fff',
                }}
              >
                {/* En-tête */}
                <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
                  <h3 className="font-display font-bold text-sm text-neutral-800">Notifications</h3>
                  <div className="flex gap-1 items-center">
                    {notifications.length > 0 && (
                      <button
                        onClick={clearAll}
                        className="text-xs text-neutral-500 hover:text-red-500 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                      >
                        Vider
                      </button>
                    )}
                    <button
                      onClick={() => setNotificationsOpen(false)}
                      className="text-neutral-400 hover:text-neutral-600 p-1 rounded-full hover:bg-neutral-100 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {/* Liste */}
                <div className="max-h-72 overflow-y-auto divide-y divide-neutral-100">
                  {notifications.length === 0 ? (
                    <div className="py-10 text-center text-neutral-400">
                      <Bell size={28} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Aucune notification</p>
                    </div>
                  ) : (
                    notifications.map(n => {
                      const isNew = !clearedAt || (n.time && n.time > clearedAt)
                      return (
                        <div
                          key={n.id}
                          className={`flex gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors ${isNew ? 'bg-orange-50/40' : ''}`}
                        >
                          <div className="shrink-0 mt-0.5">
                            {n.type === 'success' && <CheckCircle size={17} className="text-green-500" />}
                            {n.type === 'warning' && <AlertCircle size={17} className="text-orange-500" />}
                            {(n.type === 'info' || !n.type) && <Bell size={17} className="text-blue-400" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-neutral-800 truncate">{n.title}</p>
                            <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">{n.message}</p>
                            <p className="text-[10px] text-neutral-400 mt-1">{formatRelativeTime(n.time)}</p>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Pied */}
                <div className="px-4 py-2 border-t border-neutral-100 bg-neutral-50">
                  <button
                    onClick={goToSettings}
                    className="w-full text-xs text-neutral-500 py-1.5 rounded hover:bg-neutral-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <Settings size={11} /> Paramètres de notifications
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}
