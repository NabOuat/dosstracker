import React, { useState } from 'react'
import { send2FACode, verify2FACode } from '../api/authEnhanced'
import logger from '../utils/logger'
import { Lock, Send } from 'lucide-react'

export default function TwoFactorAuth({ onSuccess, onCancel }) {
  const [step, setStep] = useState('send') // 'send' | 'verify'
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [timeLeft, setTimeLeft] = useState(0)

  const handleSend2FA = async () => {
    setLoading(true)
    setError('')
    setMessage('')
    try {
      logger.debug('Envoi du code 2FA')
      const response = await send2FACode()
      setMessage(response.message)
      setStep('verify')
      setTimeLeft(300) // 5 minutes
      logger.info('Code 2FA envoyé avec succès')
    } catch (err) {
      logger.error('Erreur lors de l\'envoi du code 2FA', { error: err.message })
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify2FA = async () => {
    if (!code.trim()) {
      setError('Veuillez entrer le code')
      return
    }

    setLoading(true)
    setError('')
    try {
      logger.debug('Vérification du code 2FA')
      const response = await verify2FACode(code)
      logger.info('Code 2FA vérifié avec succès')
      setMessage(response.message)
      setTimeout(() => {
        onSuccess()
      }, 1000)
    } catch (err) {
      logger.error('Erreur lors de la vérification du code 2FA', { error: err.message })
      setError(err.message)
      setCode('')
    } finally {
      setLoading(false)
    }
  }

  // Timer pour l'expiration du code
  React.useEffect(() => {
    if (timeLeft <= 0) return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setStep('send')
          setCode('')
          setError('Le code a expiré. Veuillez en demander un nouveau.')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timeLeft])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-center mb-4">
          <Lock size={32} className="text-blue-600" />
        </div>

        <h2 className="text-xl font-bold text-center text-gray-800 mb-2">
          Authentification à Deux Facteurs
        </h2>

        <p className="text-sm text-gray-600 text-center mb-6">
          Sécurisez votre compte avec un code envoyé par SMS
        </p>

        {error && (
          <div className="p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm mb-4">
            {error}
          </div>
        )}

        {message && (
          <div className="p-3 bg-green-100 border border-green-300 rounded text-green-700 text-sm mb-4">
            {message}
          </div>
        )}

        {step === 'send' ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Un code de vérification sera envoyé à votre numéro de téléphone enregistré.
            </p>
            <button
              onClick={handleSend2FA}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded font-medium transition"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Envoyer le code
                </>
              )}
            </button>

            <button
              onClick={onCancel}
              className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-medium transition"
            >
              Annuler
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code de vérification
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength="6"
                className="w-full px-4 py-2 border border-gray-300 rounded font-mono text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            <div className="text-center text-sm text-gray-600">
              Code expire dans: <span className="font-bold text-red-600">{formatTime(timeLeft)}</span>
            </div>

            <button
              onClick={handleVerify2FA}
              disabled={loading || code.length !== 6}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded font-medium transition"
            >
              {loading ? 'Vérification...' : 'Vérifier le code'}
            </button>

            <button
              onClick={() => {
                setStep('send')
                setCode('')
                setError('')
                setMessage('')
              }}
              className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-medium transition"
            >
              Renvoyer le code
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
