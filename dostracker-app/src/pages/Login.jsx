import { useState, lazy, Suspense } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { User, Lock, Eye, EyeOff, LogIn, Inbox, FileCheck2, Landmark, ChevronRight } from 'lucide-react'
import Lottie from 'lottie-react'
import radar from '../assets/lottie/radar-foncier.json'
import { useAuth } from '../context/AuthContext'
import { getDefaultRoute } from '../utils/serviceRoutes'
import Logo from '../components/ui/Logo'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import logger from '../utils/logger'

// three.js chargé à la demande : ne pèse pas sur le reste de l'app
const LandScene = lazy(() => import('../components/login/LandScene'))

const STEPS = [
  { icon: Inbox,      label: 'Courrier' },
  { icon: FileCheck2, label: 'SPFEI' },
  { icon: Landmark,   label: 'Conservation' },
]

export default function Login() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()

  const [form,    setForm]    = useState({ username: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) return <Navigate to="/" replace />

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async e => {
    e.preventDefault()
    logger.debug('Tentative de connexion initiée', { username: form.username })
    
    if (!form.username.trim()) { 
      logger.warn('Validation échouée: nom d\'utilisateur vide')
      setError('Veuillez saisir votre nom d\'utilisateur.'); 
      return 
    }
    if (!form.password) {
      logger.warn('Validation échouée: mot de passe vide')
      setError('Veuillez saisir votre mot de passe.'); 
      return 
    }

    setLoading(true)
    logger.info(`Envoi des identifiants pour l'utilisateur: ${form.username}`)
    
    try {
      logger.debug('Appel de la fonction login...')
      const userData = await login(form.username, form.password)
      logger.info(`Connexion réussie pour l'utilisateur: ${userData.username}`, { 
        userId: userData.user_id,
        service: userData.service 
      })
      
      // Rediriger vers la page appropriée selon le service de l'utilisateur
      const defaultRoute = getDefaultRoute(userData.service)
      logger.debug(`Redirection vers: ${defaultRoute}`)
      navigate(defaultRoute, { replace: true })
    } catch (err) {
      const errorMessage = err.message ?? 'Erreur de connexion.'
      logger.error(`Erreur lors de la connexion pour ${form.username}`, {
        error: errorMessage,
        status: err.response?.status,
        details: err.response?.data
      })
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden"
      style={{ background: 'radial-gradient(120% 90% at 50% 0%, #1C2B3A 0%, #0F1923 55%, #090E13 100%)' }}
    >
      {/* Fond 3D : cadastre de parcelles */}
      <Suspense fallback={null}>
        <LandScene />
      </Suspense>

      {/* Vignette pour garder la carte lisible */}
      <div aria-hidden className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(9,14,19,0.55) 0%, rgba(9,14,19,0) 55%, rgba(9,14,19,0.65) 100%)' }} />

      {/* Carte */}
      <div
        className="relative z-10 w-full max-w-[26rem] rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.94)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          border: '1px solid rgba(255,255,255,0.35)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.55), 0 0 0 1px rgba(244,121,32,0.12), 0 0 60px rgba(244,121,32,0.10)',
          animation: 'slideUp 0.6s ease forwards',
        }}
      >
        <div className="ci-divider" />

        <div className="px-8 pt-6 pb-9 flex flex-col gap-5">

          {/* En-tête : radar Lottie + logo */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 -mb-2" aria-hidden>
              <Lottie animationData={radar} loop autoplay />
            </div>
            <Logo size="md" dark />
            <p className="text-[0.68rem] text-neutral-400 tracking-[0.14em] uppercase mt-2">
              Système de Gestion Foncière
            </p>
          </div>

          <div className="text-center">
            <h1 className="font-display font-bold text-xl text-neutral-900">Connexion</h1>
            <p className="text-sm text-neutral-400 mt-1">Accès réservé aux agents habilités</p>
          </div>

          {error && <Alert variant="error">{error}</Alert>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1">
              <label htmlFor="username" className="text-[0.78rem] font-bold text-neutral-700">
                Nom d'utilisateur <span style={{ color: 'var(--ci-orange)' }}>*</span>
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  placeholder="ex : spfei"
                  value={form.username}
                  onChange={handleChange}
                  className="input-field pl-9"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-[0.78rem] font-bold text-neutral-700">
                  Mot de passe <span style={{ color: 'var(--ci-orange)' }}>*</span>
                </label>
                <Link to="/forgot-password" className="text-[0.7rem] text-neutral-500 hover:text-orange-600 transition-colors">
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  id="password"
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="input-field pl-9 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                  aria-label={showPwd ? 'Masquer' : 'Afficher'}
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full justify-center mt-2" disabled={loading}>
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
        </div>
      </div>

      {/* Parcours d'un dossier */}
      <div className="relative z-10 mt-6 flex items-center gap-2 text-white/70 text-[0.72rem] tracking-wide" aria-hidden>
        {STEPS.map((step, i) => (
          <span key={step.label} className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full px-3 py-1"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <step.icon size={13} /> {step.label}
            </span>
            {i < STEPS.length - 1 && <ChevronRight size={13} className="text-white/30" />}
          </span>
        ))}
      </div>
    </div>
  )
}
