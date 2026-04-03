/**
 * Badge – statuts dossier DosTracker
 * variants: courrier | spfei | scvaa | nonconforme | termine | conservation
 */
export default function Badge({ variant = 'courrier', className = '', children }) {
  const variantClass = {
    courrier:     'badge-courrier',
    spfei:        'badge-spfei',
    scvaa:        'badge-scvaa',
    nonconforme:  'badge-nonconforme',
    termine:      'badge-termine',
    conservation: 'badge-conservation',
  }[variant] ?? 'badge-courrier'

  return (
    <span className={`badge ${variantClass} ${className}`}>
      {children}
    </span>
  )
}
