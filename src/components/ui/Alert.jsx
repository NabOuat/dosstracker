import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react'

const ICONS = {
  success: CheckCircle,
  warning: AlertTriangle,
  error:   XCircle,
  info:    Info,
}

/**
 * Alert – charte DosTracker
 * variants: success | warning | error | info
 */
export default function Alert({ variant = 'info', className = '', children }) {
  const Icon = ICONS[variant]

  return (
    <div className={`alert alert-${variant} ${className}`}>
      {Icon && <Icon size={16} className="shrink-0 mt-[2px]" />}
      <span>{children}</span>
    </div>
  )
}
