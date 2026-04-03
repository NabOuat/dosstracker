/**
 * Logo DosTracker – SVG inline
 * size: sm | md (default) | lg
 */
export default function Logo({ size = 'md', dark = false }) {
  const sizes = {
    sm: { icon: 28, font: '1rem',   iconFont: '0.85rem' },
    md: { icon: 36, font: '1.2rem', iconFont: '1rem'    },
    lg: { icon: 72, font: '2.8rem', iconFont: '1.6rem'  },
  }
  const s = sizes[size] ?? sizes.md

  return (
    <div className="flex items-center gap-3">
      {/* Icône dossier */}
      <div
        style={{
          width: s.icon,
          height: s.icon,
          borderRadius: 10,
          background: 'linear-gradient(135deg, #F47920, #C85E08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(244,121,32,0.25)',
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <svg
          width={s.icon * 0.6}
          height={s.icon * 0.6}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"
            fill="white"
            opacity="0.95"
          />
          <path d="M7 12h10M7 15.5h6" stroke="#F47920" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Texte */}
      <div>
        <p
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 800,
            fontSize: s.font,
            color: dark ? '#0F1923' : 'white',
            letterSpacing: '-0.04em',
            lineHeight: 1,
            margin: 0,
          }}
        >
          <span style={{ color: dark ? '#0F1923' : 'white' }}>Dos</span>
          <span style={{ color: '#F47920' }}>Tracker</span>
        </p>
        {size !== 'sm' && (
          <p
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: '0.65rem',
              color: dark ? '#94A3B8' : 'rgba(255,255,255,0.5)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontWeight: 600,
              marginTop: 2,
            }}
          >
            Suivi des dossiers
          </p>
        )}
      </div>
    </div>
  )
}
