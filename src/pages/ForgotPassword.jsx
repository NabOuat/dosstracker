import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft } from 'lucide-react'
import { forgotPasswordApi } from '../api/auth'
import Logo from '../components/ui/Logo'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    if (!email.trim()) {
      setError('Veuillez saisir votre adresse email.')
      return
    }

    // Validation simple de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Veuillez saisir une adresse email valide.')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const result = await forgotPasswordApi(email)
      setSuccess(result.message || 'Instructions envoyées par email. Veuillez vérifier votre boîte de réception.')
      setEmail('')
    } catch (err) {
      setError(err.message || 'Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0F1923 0%, #1C2B3A 55%, #1a3020 100%)' }}
    >
      {/* Stripes CI */}
      <div
        aria-hidden
        className="absolute top-0 right-0 bottom-0 flex opacity-[0.06]"
        style={{ width: 160 }}
      >
        <div className="flex-1" style={{ background: 'var(--ci-orange)' }} />
        <div className="flex-1 bg-white" />
        <div className="flex-1" style={{ background: 'var(--ci-green)' }} />
      </div>

      {/* Halos */}
      <div aria-hidden className="absolute pointer-events-none" style={{
        width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(244,121,32,0.13) 0%, transparent 70%)',
        top: -130, right: -130, animation: 'pulse-glow 4s ease-in-out infinite',
      }} />
      <div aria-hidden className="absolute pointer-events-none" style={{
        width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(0,133,63,0.10) 0%, transparent 70%)',
        bottom: -80, left: -80, animation: 'pulse-glow 4s ease-in-out infinite 2s',
      }} />

      {/* Carte */}
      <div
        className="relative z-10 w-full max-w-sm bg-white rounded-xl overflow-hidden"
        style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.35)', animation: 'slideUp 0.6s ease forwards' }}
      >
        {/* Bande CI */}
        <div className="ci-divider" />

        <div className="px-8 pt-8 pb-10 flex flex-col gap-6">

          {/* Logo */}
          <div className="flex flex-col items-center gap-1">
            <Logo size="md" dark />
            <p className="text-[0.7rem] text-neutral-400 tracking-[0.12em] uppercase mt-1">
              Système de Gestion Foncière
            </p>
          </div>

          {/* Titre */}
          <div className="text-center">
            <h1 className="font-display font-bold text-xl text-neutral-900">
              Mot de passe oublié
            </h1>
            <p className="text-sm text-neutral-400 mt-1">
              Saisissez votre email pour réinitialiser votre mot de passe
            </p>
          </div>

          {/* Erreur ou succès */}
          {error && <Alert variant="error">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-[0.78rem] font-bold text-neutral-700">
                Adresse email <span style={{ color: 'var(--ci-orange)' }}>*</span>
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                />
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="votre.email@exemple.com"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value)
                    setError('')
                  }}
                  className="input-field pl-9"
                  autoFocus
                  disabled={loading || success}
                />
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center mt-2"
              disabled={loading || success}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                'Envoyer les instructions'
              )}
            </Button>

            {/* Retour à la connexion */}
            <Link
              to="/login"
              className="flex items-center justify-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 transition-colors mt-2"
            >
              <ArrowLeft size={14} />
              Retour à la connexion
            </Link>
          </form>
        </div>
      </div>
    </div>
  )
}
