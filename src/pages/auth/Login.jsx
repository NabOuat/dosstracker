import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn, ChevronRight } from 'lucide-react'
import { useAuth, SERVICES } from '../../contexts/AuthContext'
import Logo from '../../components/ui/Logo'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'

const SERVICE_LIST = Object.values(SERVICES)

// Couleurs d'accentuation par service
const ACCENT = {
  blue:   { bg: '#EFF6FF', border: '#3B82F6', text: '#1D4ED8', dot: '#3B82F6' },
  orange: { bg: 'var(--ci-orange-pale)', border: 'var(--ci-orange)', text: 'var(--ci-orange-dark)', dot: 'var(--ci-orange)' },
  green:  { bg: 'var(--ci-green-pale)',  border: 'var(--ci-green)',  text: 'var(--ci-green-dark)',  dot: 'var(--ci-green)'  },
  purple: { bg: '#F5F3FF', border: '#8B5CF6', text: '#6D28D9', dot: '#8B5CF6' },
}

export default function Login() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()

  const [selected,  setSelected]  = useState('')
  const [password,  setPassword]  = useState('')
  const [showPwd,   setShowPwd]   = useState(false)
  const [error,     setError]     = useState('')
  const [loading,   setLoading]   = useState(false)

  // Si déjà connecté, rediriger
  if (isAuthenticated) return <Navigate to="/" replace />

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (!selected) { setError('Veuillez sélectionner votre service.'); return }
    if (!password)  { setError('Veuillez saisir votre mot de passe.'); return }

    setLoading(true)
    // Simule un léger délai réseau pour le UX
    await new Promise(r => setTimeout(r, 400))
    const result = login(selected, password)
    setLoading(false)

    if (result.ok) {
      navigate('/', { replace: true })
    } else {
      setError(result.error)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #0F1923 0%, #1C2B3A 55%, #1a3020 100%)',
      }}
    >
      {/* ── Stripes drapeau CI ── */}
      <div
        aria-hidden
        className="absolute top-0 right-0 bottom-0 flex opacity-[0.06]"
        style={{ width: 160 }}
      >
        <div className="flex-1" style={{ background: 'var(--ci-orange)' }} />
        <div className="flex-1 bg-white" />
        <div className="flex-1" style={{ background: 'var(--ci-green)' }} />
      </div>

      {/* ── Halos d'ambiance ── */}
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(244,121,32,0.12) 0%, transparent 70%)',
          top: -120, right: -120,
          animation: 'pulse-glow 4s ease-in-out infinite',
        }}
      />
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(0,133,63,0.10) 0%, transparent 70%)',
          bottom: -80, left: -80,
          animation: 'pulse-glow 4s ease-in-out infinite 2s',
        }}
      />

      {/* ── Carte de connexion ── */}
      <div
        className="relative z-10 w-full max-w-md bg-white rounded-xl flex flex-col overflow-hidden"
        style={{
          boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
          animation: 'slideUp 0.6s ease forwards',
        }}
      >
        {/* Bandeau CI en haut de la carte */}
        <div className="ci-divider" />

        <div className="px-8 pt-8 pb-10 flex flex-col gap-6">

          {/* Logo */}
          <div className="flex flex-col items-center gap-1 mb-2">
            <Logo size="md" dark />
            <p className="text-[0.72rem] text-neutral-400 tracking-[0.1em] uppercase mt-1">
              Système de Gestion Foncière
            </p>
          </div>

          {/* Titre */}
          <div>
            <h1 className="font-display font-bold text-xl text-neutral-900 text-center">
              Connexion à votre espace
            </h1>
            <p className="text-sm text-neutral-500 text-center mt-1">
              Sélectionnez votre service puis saisissez votre mot de passe.
            </p>
          </div>

          {/* Erreur */}
          {error && <Alert variant="error">{error}</Alert>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Sélecteur de service */}
            <div>
              <p className="text-[0.78rem] font-bold text-neutral-700 mb-2">
                Votre service <span style={{ color: 'var(--ci-orange)' }}>*</span>
              </p>
              <div className="grid grid-cols-1 gap-2">
                {SERVICE_LIST.map(svc => {
                  const isActive = selected === svc.key
                  const accent   = ACCENT[svc.color]
                  return (
                    <button
                      key={svc.key}
                      type="button"
                      onClick={() => { setSelected(svc.key); setError('') }}
                      className="flex items-center gap-3 px-4 py-3 rounded-md text-left transition-all duration-200 border-2"
                      style={{
                        borderColor:    isActive ? accent.border : 'var(--neutral-200)',
                        background:     isActive ? accent.bg     : 'var(--neutral-100)',
                        boxShadow:      isActive ? `0 0 0 3px ${accent.dot}20` : 'none',
                      }}
                    >
                      {/* Point radio */}
                      <div
                        className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200"
                        style={{
                          borderColor:  isActive ? accent.dot : 'var(--neutral-400)',
                          background:   isActive ? accent.dot : 'transparent',
                        }}
                      >
                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>

                      {/* Icône */}
                      <span className="text-lg leading-none">{svc.icon}</span>

                      {/* Texte */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-bold leading-tight"
                          style={{ color: isActive ? accent.text : 'var(--neutral-800)' }}
                        >
                          {svc.label}
                        </p>
                        <p className="text-[0.7rem] text-neutral-400 truncate mt-0.5">
                          {svc.desc}
                        </p>
                      </div>

                      <ChevronRight
                        size={14}
                        className="shrink-0 transition-opacity"
                        style={{ color: accent.dot, opacity: isActive ? 1 : 0 }}
                      />
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Mot de passe */}
            <div className="flex flex-col gap-1">
              <label className="text-[0.78rem] font-bold text-neutral-700">
                Mot de passe <span style={{ color: 'var(--ci-orange)' }}>*</span>
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  className="input-field pr-11"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                  aria-label={showPwd ? 'Masquer' : 'Afficher'}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Bouton connexion */}
            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center mt-1"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Connexion…
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Se connecter
                </>
              )}
            </Button>
          </form>

          {/* Aide demo */}
          <details className="text-center">
            <summary className="text-[0.72rem] text-neutral-400 cursor-pointer hover:text-neutral-600 transition-colors select-none">
              Identifiants de démonstration
            </summary>
            <div className="mt-3 rounded-md bg-neutral-100 p-3 text-left">
              <table className="w-full text-[0.72rem] text-neutral-600">
                <thead>
                  <tr className="text-neutral-400 font-bold uppercase tracking-wider">
                    <th className="pb-1 font-bold">Service</th>
                    <th className="pb-1 font-bold">Mot de passe</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {SERVICE_LIST.map(s => (
                    <tr key={s.key}>
                      <td className="py-0.5 pr-4">{s.label}</td>
                      <td className="py-0.5 text-neutral-800">{s.password}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}
