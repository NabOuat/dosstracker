import { useAuth } from '../context/AuthContext'
import ServiceDashboardOverview from './ServiceDashboardOverview'

export default function ServiceDashboardSection() {
  const { user } = useAuth()

  // Afficher le dashboard uniquement pour les utilisateurs avec service_tag = 'Bob'
  if (!user || user.service_tag !== 'Bob') {
    return null
  }

  return (
    <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
      <div className="mb-4">
        <h2 className="font-display font-bold text-2xl text-neutral-900">
          Tableau de Bord du Service
        </h2>
        <p className="text-sm text-neutral-600 mt-1">
          Aperçu complet des dossiers, activités et performances de votre service
        </p>
      </div>
      <ServiceDashboardOverview />
    </div>
  )
}
