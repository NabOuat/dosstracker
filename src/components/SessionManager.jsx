import React, { useState, useEffect } from 'react'
import { LogOut, Smartphone, Clock } from 'lucide-react'
import { getActiveSessions } from '../api/authEnhanced'
import logger from '../utils/logger'

export default function SessionManager() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    setLoading(true)
    setError('')
    try {
      logger.debug('Chargement des sessions actives')
      const data = await getActiveSessions()
      setSessions(data.sessions || [])
      logger.info('Sessions actives chargées', { count: data.total })
    } catch (err) {
      logger.error('Erreur lors du chargement des sessions', { error: err.message })
      setError('Erreur lors du chargement des sessions')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('fr-FR')
  }

  const getDeviceType = (userAgent) => {
    if (!userAgent) return 'Inconnu'
    if (/mobile|android|iphone/i.test(userAgent)) return 'Mobile'
    if (/tablet|ipad/i.test(userAgent)) return 'Tablette'
    return 'Ordinateur'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-800">Sessions Actives</h3>
        <button
          onClick={loadSessions}
          className="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          Rafraîchir
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {sessions.length === 0 ? (
        <div className="text-center text-gray-500 py-4">
          Aucune session active
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.session_id}
              className="p-3 bg-gray-50 border border-gray-200 rounded-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Smartphone size={16} className="text-blue-600" />
                    <span className="font-medium text-gray-800">
                      {getDeviceType(session.user_agent)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    <div>IP: {session.ip_address}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock size={14} />
                      Créée: {formatDate(session.created_at)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Dernière activité: {formatDate(session.last_activity)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
