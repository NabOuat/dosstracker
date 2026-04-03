import { useState, useEffect } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, FolderOpen, LayoutDashboard, Plus, Search, Bell, LogOut } from 'lucide-react'
import Logo from '../ui/Logo'
import { useAuth } from '../../contexts/AuthContext'

const NAV_ITEMS = [
  { to: '/',         label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/dossiers', label: 'Dossiers',         icon: FolderOpen      },
  { to: '/nouveau',  label: 'Nouveau',          icon: Plus            },
  { to: '/recherche',label: 'Recherche',        icon: Search          },
]

// Couleur d'accent par service
const AVATAR_STYLE = {
  orange: { background: 'linear-gradient(135deg, var(--ci-orange), var(--ci-orange-dark))' },
  green:  { background: 'linear-gradient(135deg, var(--ci-green), var(--ci-green-dark))'   },
  blue:   { background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)'                        },
  purple: { background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)'                        },
}

export default function Navbar() {
  const [open,     setOpen]     = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location  = useLocation()
  const navigate  = useNavigate()
  const { user, logout } = useAuth()

  // Fermer le menu mobile au changement de route
  useEffect(() => setOpen(false), [location])

  // Détecter le scroll
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const avatarStyle = user ? (AVATAR_STYLE[user.color] ?? AVATAR_STYLE.orange) : AVATAR_STYLE.orange

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-shadow duration-300 ${
          scrolled ? 'shadow-md' : ''
        }`}
        style={{
          background:    'rgba(255,255,255,0.92)',
          backdropFilter:'blur(20px)',
          borderBottom:  '1px solid #E2E8F0',
          height:        64,
          display:       'flex',
          alignItems:    'center',
          padding:       '0 1.25rem',
          justifyContent:'space-between',
        }}
      >
        {/* Logo */}
        <NavLink to="/" aria-label="Accueil DosTracker">
          <Logo size="sm" dark />
        </NavLink>

        {/* Navigation desktop */}
        <ul className="hidden md:flex items-center gap-1 list-none m-0 p-0">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-[0.4rem] rounded-full text-[0.82rem] font-semibold no-underline transition-all duration-200 ${
                    isActive
                      ? 'text-orange-dark bg-orange-pale'
                      : 'text-neutral-500 hover:text-orange-dark hover:bg-orange-pale'
                  }`
                }
                style={({ isActive }) => ({
                  color:      isActive ? 'var(--ci-orange-dark)' : undefined,
                  background: isActive ? 'var(--ci-orange-pale)' : undefined,
                })}
              >
                <Icon size={14} />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Actions desktop */}
        <div className="hidden md:flex items-center gap-2">
          {/* Notif */}
          <button
            className="w-9 h-9 flex items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={18} />
          </button>

          {/* Service badge */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-neutral-200">
              <div className="text-right hidden lg:block">
                <p className="text-[0.78rem] font-bold text-neutral-800 leading-tight">{user.label}</p>
              </div>
              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[0.7rem] font-bold shrink-0"
                style={avatarStyle}
                title={user.label}
              >
                {user.initials}
              </div>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-9 h-9 flex items-center justify-center rounded-full text-neutral-500 hover:bg-red-50 hover:text-red-500 transition-colors ml-1"
            aria-label="Déconnexion"
            title="Se déconnecter"
          >
            <LogOut size={16} />
          </button>
        </div>

        {/* Burger mobile */}
        <button
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100 transition-colors"
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: 'rgba(15,25,35,0.4)', backdropFilter: 'blur(4px)' }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer mobile */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 md:hidden bg-white w-72 flex flex-col transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ boxShadow: '-8px 0 32px rgba(0,0,0,0.15)' }}
      >
        {/* Header drawer */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-neutral-200 shrink-0">
          <Logo size="sm" dark />
          <button
            onClick={() => setOpen(false)}
            className="w-9 h-9 flex items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Links drawer */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="flex flex-col gap-1 list-none m-0 p-0">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-md text-sm font-semibold no-underline transition-all duration-200 ${
                      isActive ? '' : 'text-neutral-700 hover:bg-neutral-100'
                    }`
                  }
                  style={({ isActive }) =>
                    isActive
                      ? { background: 'linear-gradient(135deg, var(--ci-orange), var(--ci-orange-dark))', color: 'white' }
                      : {}
                  }
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer drawer – user + logout */}
        <div className="p-4 border-t border-neutral-200 shrink-0">
          {user && (
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                style={avatarStyle}
              >
                {user.initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-neutral-800 leading-tight truncate">{user.label}</p>
                <p className="text-xs text-neutral-400 mt-0.5">Connecté</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} />
            Se déconnecter
          </button>
        </div>
      </div>
    </>
  )
}
