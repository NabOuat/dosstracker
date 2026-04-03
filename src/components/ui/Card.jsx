/**
 * Card – conteneur générique charte DosTracker
 */
export default function Card({ className = '', children }) {
  return (
    <div className={`card ${className}`}>
      {children}
    </div>
  )
}

/**
 * DosCard – carte dossier avec bordure colorée à gauche
 * color: orange (default) | green | blue
 */
export function DosCard({ color = 'orange', icon, num, name, children, className = '', onClick }) {
  return (
    <div
      className={`dos-card ${color !== 'orange' ? color : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-center gap-4">
        {icon && (
          <div
            className="w-[42px] h-[42px] rounded-sm flex items-center justify-center text-lg shrink-0"
            style={{
              background: color === 'green'
                ? 'var(--ci-green-pale)'
                : color === 'blue'
                ? '#EFF6FF'
                : 'var(--ci-orange-pale)',
            }}
          >
            {icon}
          </div>
        )}
        <div>
          {num  && <p className="font-display font-bold text-[0.95rem] text-neutral-800">{num}</p>}
          {name && <p className="text-[0.8rem] text-neutral-500">{name}</p>}
          {children}
        </div>
      </div>
    </div>
  )
}
