import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import * as LucideIcons from 'lucide-react'
import { LogOut, X } from 'lucide-react'
import Logo from './ui/Logo'
import { useAuth } from '../context/AuthContext'
import { getServiceActions } from '../utils/serviceRoutes'
import UserAvatar from './UserAvatar'

const SIDEBAR_W = 256

// Navigation commune à tous les services
const COMMON_NAV = [
  { to: '/parametres',label: 'Paramètres',       icon: 'Settings' }
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
      // Obtenir les actions spécifiques au service
      const serviceActions = getServiceActions(user.service)
      
      // Convertir les actions en éléments de navigation
      const serviceNavItems = serviceActions.map(action => ({
        to: action.route,
        label: action.label,
        icon: action.icon,
        primary: action.primary
      }))
      
      // Ajouter les éléments communs
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

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 z-40 flex flex-col
          bg-neutral-900 transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:z-20
          overflow-hidden
        `}
        style={{ width: SIDEBAR_W, boxShadow: '4px 0 32px rgba(0,0,0,0.2)', maxWidth: '100vw' }}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-5 h-16 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <Logo size="sm" dark={false} />
          <button
            onClick={onClose}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-white/30 px-3 mb-2">
            Navigation
          </p>
          <ul className="flex flex-col gap-0.5 list-none m-0 p-0">
            {navItems.map(({ to, label, icon, primary }) => {
              const Icon = LucideIcons[icon] || LucideIcons.Activity;
              return (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={true}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-md text-[0.85rem] font-semibold no-underline transition-all duration-150 ${
                        isActive
                          ? 'text-white'
                          : 'text-white/50 hover:text-white hover:bg-white/8'
                      }`
                    }
                    style={({ isActive }) =>
                      isActive
                        ? { background: 'linear-gradient(135deg, var(--ci-orange), var(--ci-orange-dark))', color: 'white', boxShadow: '0 4px 12px rgba(244,121,32,0.3)' }
                        : {}
                    }
                  >
                    <Icon size={17} className="shrink-0" />
                    {label}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ── Footer utilisateur ── */}
        <div
          className="px-4 py-4 shrink-0"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          {user && (
            <div className="flex items-center gap-3 mb-3 px-1">
              {/* Avatar animé */}
              <div className="relative shrink-0" style={{ width: 44, height: 44 }}>
                {/* Anneau pulsant */}
                <span
                  style={{
                    position: 'absolute', inset: -4,
                    borderRadius: '50%',
                    border: `2px solid ${glowColor}`,
                    animation: 'avatarRingPulse 2.6s ease-out infinite',
                    zIndex: 0,
                  }}
                />
                {/* Personnage SVG */}
                <div style={{ position: 'relative', zIndex: 1, animation: 'avatarGlow 2.6s ease-in-out infinite', '--avatar-glow': glowColor, borderRadius: '50%' }}>
                  <UserAvatar serviceId={user.service_id} size={44} />
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-[0.8rem] font-bold text-white/90 truncate leading-tight">
                  {user.nom_complet || user.label || user.username}
                </p>
                <p className="text-[0.65rem] text-white/35 mt-0.5">Connecté</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[0.82rem] font-semibold text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
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
