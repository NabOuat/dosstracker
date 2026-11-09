import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import * as LucideIcons from 'lucide-react'
import { LogOut, X } from 'lucide-react'
import { motion } from 'framer-motion'
import Logo from './ui/Logo'
import { useAuth } from '../context/AuthContext'
import { getServiceActions } from '../utils/serviceRoutes'
import UserAvatar from './UserAvatar'

const SIDEBAR_W = 256

// Navigation commune à tous les services
const COMMON_NAV = [
  { to: '/parametres', label: 'Paramètres', icon: 'Settings' }
]

const AVATAR_GLOW = {
  orange: 'rgba(244,121,32,0.55)',
  green:  'rgba(0,133,63,0.55)',
  blue:   'rgba(59,130,246,0.55)',
  purple: 'rgba(139,92,246,0.55)',
}

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()
  const location         = useLocation()
  const [navItems, setNavItems] = useState([])

  // Fermer le drawer mobile au changement de route
  useEffect(() => { onClose?.() }, [location.pathname]) // eslint-disable-line

  // Charger les actions du service de l'utilisateur
  useEffect(() => {
    if (user && user.service) {
      const serviceNavItems = getServiceActions(user.service).map(action => ({
        to: action.route,
        label: action.label,
        icon: action.icon,
        primary: action.primary,
      }))
      setNavItems([...serviceNavItems, ...COMMON_NAV])
    } else {
      setNavItems(COMMON_NAV)
    }
  }, [user])

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const color     = user?.color ?? 'orange'
  const glowColor = AVATAR_GLOW[color] ?? AVATAR_GLOW.orange

  const mainItems    = navItems.filter(i => i.to !== '/parametres')
  const accountItems = navItems.filter(i => i.to === '/parametres')

  const renderItem = ({ to, label, icon }, i) => {
    const Icon = LucideIcons[icon] || LucideIcons.Activity
    return (
      <motion.li
        key={to}
        initial={{ opacity: 0, x: -18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.08 + i * 0.05, duration: 0.35, ease: 'easeOut' }}
      >
        <NavLink
          to={to}
          end
          className="group relative block no-underline rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
        >
          {({ isActive }) => (
            <motion.div
              whileHover={{ x: isActive ? 0 : 4 }}
              whileTap={{ scale: 0.98 }}
              className="relative flex items-center gap-3 px-2.5 py-2 rounded-xl"
            >
              {/* Fond actif partagé : glisse d'un item à l'autre */}
              {isActive && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: 'linear-gradient(90deg, rgba(244,121,32,0.20), rgba(244,121,32,0.04))',
                    border: '1px solid rgba(244,121,32,0.28)',
                  }}
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              {isActive && (
                <motion.span
                  layoutId="sidebar-bar"
                  className="absolute -left-4 top-2 bottom-2 w-1 rounded-r-full"
                  style={{ background: 'var(--ci-orange)', boxShadow: '0 0 12px var(--ci-orange)' }}
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}

              <span
                className="relative z-10 flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-all duration-200"
                style={
                  isActive
                    ? { background: 'linear-gradient(135deg, var(--ci-orange), var(--ci-orange-dark))', color: '#fff', boxShadow: '0 4px 14px rgba(244,121,32,0.45)' }
                    : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.55)' }
                }
              >
                <Icon size={16} />
              </span>
              <span
                className={`relative z-10 text-[0.84rem] font-semibold transition-colors duration-150 ${
                  isActive ? 'text-white' : 'text-white/55 group-hover:text-white'
                }`}
              >
                {label}
              </span>
            </motion.div>
          )}
        </NavLink>
      </motion.li>
    )
  }

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 z-40 flex flex-col
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:z-20
          overflow-hidden
        `}
        style={{
          width: SIDEBAR_W,
          maxWidth: '100vw',
          background: 'linear-gradient(180deg, #121E2A 0%, #0D161F 55%, #090E13 100%)',
          boxShadow: '4px 0 40px rgba(0,0,0,0.25)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {/* Décor : halos + trame */}
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          <div
            className="absolute -top-24 -left-24 w-64 h-64 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(244,121,32,0.18), transparent 70%)', animation: 'pulse-glow 6s ease-in-out infinite' }}
          />
          <div
            className="absolute -bottom-28 -right-24 w-72 h-72 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(0,133,63,0.16), transparent 70%)', animation: 'pulse-glow 7s ease-in-out infinite 2s' }}
          />
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />
        </div>

        {/* ── Header ── */}
        <div
          className="relative flex items-center justify-between px-5 h-16 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <Logo size="sm" dark={false} />
          <button
            onClick={onClose}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
          <div
            className="absolute bottom-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, var(--ci-orange), rgba(255,255,255,0.4), var(--ci-green))', opacity: 0.55 }}
          />
        </div>

        {/* ── Navigation ── */}
        <nav className="relative flex-1 overflow-y-auto px-4 py-5">
          <p className="text-[0.6rem] font-bold uppercase tracking-[0.16em] text-white/30 px-2.5 mb-2.5">
            Menu
          </p>
          <ul className="flex flex-col gap-1 list-none m-0 p-0">
            {mainItems.map(renderItem)}
          </ul>

          {accountItems.length > 0 && (
            <>
              <p className="text-[0.6rem] font-bold uppercase tracking-[0.16em] text-white/30 px-2.5 mt-6 mb-2.5">
                Compte
              </p>
              <ul className="flex flex-col gap-1 list-none m-0 p-0">
                {accountItems.map((it, i) => renderItem(it, mainItems.length + i))}
              </ul>
            </>
          )}
        </nav>

        {/* ── Footer utilisateur ── */}
        <div className="relative px-4 pb-4 pt-3 shrink-0">
          {user && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="flex items-center gap-3 p-3 rounded-2xl mb-2"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}
            >
              <div className="relative shrink-0" style={{ width: 44, height: 44 }}>
                <span
                  style={{
                    position: 'absolute', inset: -4, borderRadius: '50%',
                    border: `2px solid ${glowColor}`, animation: 'avatarRingPulse 2.6s ease-out infinite', zIndex: 0,
                  }}
                />
                <div
                  style={{
                    position: 'relative', zIndex: 1, animation: 'avatarGlow 2.6s ease-in-out infinite',
                    '--avatar-glow': glowColor, borderRadius: '50%',
                  }}
                >
                  <UserAvatar serviceId={user.service_id} size={44} />
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-[0.8rem] font-bold text-white/90 truncate leading-tight">
                  {user.nom_complet || user.label || user.username}
                </p>
                <p className="flex items-center gap-1.5 text-[0.65rem] text-white/45 mt-1 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" style={{ boxShadow: '0 0 8px #4ade80' }} />
                  {user.service || 'Connecté'}
                </p>
              </div>
            </motion.div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[0.82rem] font-semibold text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={16} className="shrink-0" />
            Se déconnecter
          </button>
        </div>
      </aside>
    </>
  )
}

export { SIDEBAR_W }
