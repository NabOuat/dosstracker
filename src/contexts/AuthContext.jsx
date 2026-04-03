import { createContext, useContext, useState, useCallback } from 'react'

// ─── Services & credentials (demo front-end) ──────────────────────────────
export const SERVICES = {
  COURRIER: {
    key:      'COURRIER',
    label:    'Service Courrier',
    initials: 'SC',
    color:    'blue',
    password: 'courrier2026',
    icon:     '📬',
    desc:     'Réception & enregistrement des dossiers',
  },
  SPFEI: {
    key:      'SPFEI',
    label:    'Service SPFEI',
    initials: 'SS',
    color:    'orange',
    password: 'spfei2026',
    icon:     '📋',
    desc:     'Contrôle administratif & attribution titre',
  },
  SCVAA: {
    key:      'SCVAA',
    label:    'Service SCVAA',
    initials: 'SCV',
    color:    'green',
    password: 'scvaa2026',
    icon:     '📐',
    desc:     'Contrôle technique & vérification cadastrale',
  },
  CONSERVATION: {
    key:      'CONSERVATION',
    label:    'Conservation Foncière',
    initials: 'CF',
    color:    'purple',
    password: 'conserv2026',
    icon:     '🏛️',
    desc:     'Archivage final des dossiers',
  },
}

const LS_KEY = 'dostracker_user'

// ─── Context ──────────────────────────────────────────────────────────────
const AuthContext = createContext(null)

// ─── Provider ─────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(LS_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const login = useCallback((serviceKey, password) => {
    const service = SERVICES[serviceKey]
    if (!service) return { ok: false, error: 'Service inconnu.' }
    if (service.password !== password) return { ok: false, error: 'Mot de passe incorrect.' }

    const userData = {
      service:  service.key,
      label:    service.label,
      initials: service.initials,
      color:    service.color,
      icon:     service.icon,
    }
    setUser(userData)
    localStorage.setItem(LS_KEY, JSON.stringify(userData))
    return { ok: true }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(LS_KEY)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>')
  return ctx
}
