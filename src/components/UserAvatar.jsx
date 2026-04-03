import { memo } from 'react'

const SKIN = '#FDDBB4'

/* ── Courrier (1) – Postier avec casquette et enveloppe ── */
const AvatarCourrier = () => (
  <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="gc1" cx="45%" cy="30%" r="65%">
        <stop offset="0%" stopColor="#F9A05A"/>
        <stop offset="100%" stopColor="#C85E08"/>
      </radialGradient>
    </defs>
    <circle cx="24" cy="24" r="24" fill="url(#gc1)"/>
    {/* Body */}
    <rect x="14" y="29" width="20" height="13" rx="4" fill="#C85E08"/>
    {/* Envelope */}
    <rect x="16" y="31" width="16" height="11" rx="2" fill="white" opacity="0.92"/>
    <path d="M16 33 L24 38 L32 33" stroke="#F47920" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
    {/* Neck */}
    <rect x="21" y="26" width="6" height="4" rx="2" fill={SKIN}/>
    {/* Head */}
    <circle cx="24" cy="21" r="9" fill={SKIN}/>
    {/* Cap brim */}
    <rect x="13" y="18" width="22" height="3.5" rx="1.75" fill="#F47920"/>
    {/* Cap top */}
    <path d="M15 18 Q24 10 33 18" fill="#C85E08"/>
    <rect x="21" y="13.5" width="6" height="2.5" rx="1.25" fill="#C85E08"/>
    {/* Cheeks */}
    <circle cx="18.5" cy="24" r="2.2" fill="rgba(244,121,32,0.28)"/>
    <circle cx="29.5" cy="24" r="2.2" fill="rgba(244,121,32,0.28)"/>
    {/* Eyes */}
    <ellipse cx="21" cy="22" rx="1.6" ry="1.6" fill="#2D3F50"/>
    <ellipse cx="27" cy="22" rx="1.6" ry="1.6" fill="#2D3F50"/>
    <circle cx="21.7" cy="21.3" r="0.55" fill="white"/>
    <circle cx="27.7" cy="21.3" r="0.55" fill="white"/>
    {/* Smile */}
    <path d="M21 25.5 Q24 27.5 27 25.5" stroke="#C85E08" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
  </svg>
)

/* ── SPFEI (2) – Fonctionnaire avec lunettes et chemise ── */
const AvatarSpfei = () => (
  <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="gc2" cx="45%" cy="30%" r="65%">
        <stop offset="0%" stopColor="#60A5FA"/>
        <stop offset="100%" stopColor="#1E40AF"/>
      </radialGradient>
    </defs>
    <circle cx="24" cy="24" r="24" fill="url(#gc2)"/>
    {/* Suit body */}
    <rect x="14" y="29" width="20" height="13" rx="4" fill="#1E40AF"/>
    {/* Shirt + tie */}
    <rect x="21" y="29" width="6" height="13" rx="2" fill="white" opacity="0.85"/>
    <polygon points="24,29 22,35 24,39.5 26,35" fill="#3B82F6"/>
    {/* Neck */}
    <rect x="21" y="26" width="6" height="4" rx="2" fill={SKIN}/>
    {/* Head */}
    <circle cx="24" cy="21" r="9" fill={SKIN}/>
    {/* Hair */}
    <path d="M15 19 Q16 11.5 24 12 Q32 11.5 33 19 Q30 13.5 24 13.5 Q18 13.5 15 19Z" fill="#475569"/>
    {/* Glasses frames */}
    <circle cx="21" cy="21.5" r="3.3" stroke="#1D4ED8" strokeWidth="1.4" fill="none"/>
    <circle cx="27" cy="21.5" r="3.3" stroke="#1D4ED8" strokeWidth="1.4" fill="none"/>
    <line x1="24.3" y1="21.5" x2="23.7" y2="21.5" stroke="#1D4ED8" strokeWidth="1.4"/>
    <line x1="17.7" y1="20.5" x2="15" y2="20" stroke="#1D4ED8" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="30.3" y1="20.5" x2="33" y2="20" stroke="#1D4ED8" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Eyes */}
    <circle cx="21" cy="21.5" r="1.3" fill="#2D3F50"/>
    <circle cx="27" cy="21.5" r="1.3" fill="#2D3F50"/>
    <circle cx="21.6" cy="21" r="0.45" fill="white"/>
    <circle cx="27.6" cy="21" r="0.45" fill="white"/>
    {/* Professional smile */}
    <path d="M21.5 25.5 Q24 27 26.5 25.5" stroke="#475569" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
    {/* Clipboard detail */}
    <rect x="31" y="30" width="7" height="9" rx="1.5" fill="white" opacity="0.9" transform="rotate(-8 34.5 34.5)"/>
    <line x1="31.5" y1="33" x2="37" y2="32" stroke="#93C5FD" strokeWidth="0.8"/>
    <line x1="31.5" y1="35" x2="37" y2="34" stroke="#93C5FD" strokeWidth="0.8"/>
  </svg>
)

/* ── SCVAA (3) – Géomètre-expert avec casque de chantier ── */
const AvatarScvaa = () => (
  <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="gc3" cx="45%" cy="30%" r="65%">
        <stop offset="0%" stopColor="#43B074"/>
        <stop offset="100%" stopColor="#005C2B"/>
      </radialGradient>
    </defs>
    <circle cx="24" cy="24" r="24" fill="url(#gc3)"/>
    {/* Body – safety vest */}
    <rect x="14" y="29" width="20" height="13" rx="4" fill="#005C2B"/>
    {/* Safety stripe */}
    <rect x="14" y="33" width="20" height="3.5" rx="1" fill="#F59E0B" opacity="0.85"/>
    {/* Neck */}
    <rect x="21" y="26" width="6" height="4" rx="2" fill={SKIN}/>
    {/* Head */}
    <circle cx="24" cy="21.5" r="9" fill={SKIN}/>
    {/* Hard hat dome */}
    <ellipse cx="24" cy="16" rx="11" ry="6.5" fill="#00853F"/>
    {/* Hard hat brim */}
    <rect x="12.5" y="17.5" width="23" height="3.5" rx="1.75" fill="#43B074"/>
    {/* Cheeks */}
    <circle cx="18.5" cy="25" r="2.2" fill="rgba(0,133,63,0.22)"/>
    <circle cx="29.5" cy="25" r="2.2" fill="rgba(0,133,63,0.22)"/>
    {/* Eyes */}
    <ellipse cx="21" cy="23" rx="1.6" ry="1.6" fill="#2D3F50"/>
    <ellipse cx="27" cy="23" rx="1.6" ry="1.6" fill="#2D3F50"/>
    <circle cx="21.7" cy="22.3" r="0.55" fill="white"/>
    <circle cx="27.7" cy="22.3" r="0.55" fill="white"/>
    {/* Smile */}
    <path d="M21 26.5 Q24 28.5 27 26.5" stroke="#005C2B" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    {/* Measuring device */}
    <rect x="14" y="32" width="8" height="8" rx="1.5" fill="white" opacity="0.88" transform="rotate(10 18 36)"/>
    <circle cx="17.5" cy="36" r="2.5" stroke="#00853F" strokeWidth="1" fill="none" transform="rotate(10 18 36)"/>
    <line x1="17.5" y1="33.5" x2="17.5" y2="36" stroke="#00853F" strokeWidth="1" transform="rotate(10 18 36)"/>
    <line x1="17.5" y1="36" x2="19.8" y2="37.5" stroke="#00853F" strokeWidth="1" transform="rotate(10 18 36)"/>
  </svg>
)

/* ── Admin (4) – Administrateur avec couronne ── */
const AvatarAdmin = () => (
  <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="gc4" cx="45%" cy="30%" r="65%">
        <stop offset="0%" stopColor="#A78BFA"/>
        <stop offset="100%" stopColor="#4C1D95"/>
      </radialGradient>
    </defs>
    <circle cx="24" cy="24" r="24" fill="url(#gc4)"/>
    {/* Body */}
    <rect x="14" y="29" width="20" height="13" rx="4" fill="#5B21B6"/>
    {/* Badge */}
    <rect x="19" y="31" width="10" height="8" rx="2" fill="#7C3AED"/>
    {/* Star badge */}
    <polygon
      points="24,32.5 25.2,34.8 27.8,34.8 25.7,36.3 26.4,38.7 24,37.3 21.6,38.7 22.3,36.3 20.2,34.8 22.8,34.8"
      fill="#FCD34D"
    />
    {/* Neck */}
    <rect x="21" y="26" width="6" height="4" rx="2" fill={SKIN}/>
    {/* Head */}
    <circle cx="24" cy="21" r="9" fill={SKIN}/>
    {/* Crown base */}
    <path d="M15 19.5 L15 18 L18 21 L21.5 16 L24 19.5 L26.5 16 L30 21 L33 18 L33 19.5 Z" fill="#F59E0B"/>
    {/* Crown gems */}
    <circle cx="18" cy="18.5" r="1.3" fill="#EF4444"/>
    <circle cx="24" cy="17" r="1.5" fill="#10B981"/>
    <circle cx="30" cy="18.5" r="1.3" fill="#3B82F6"/>
    {/* Cheeks */}
    <circle cx="18.5" cy="23.5" r="2.2" fill="rgba(139,92,246,0.28)"/>
    <circle cx="29.5" cy="23.5" r="2.2" fill="rgba(139,92,246,0.28)"/>
    {/* Eyes */}
    <ellipse cx="21" cy="22" rx="1.6" ry="1.6" fill="#2D3F50"/>
    <ellipse cx="27" cy="22" rx="1.6" ry="1.6" fill="#2D3F50"/>
    <circle cx="21.7" cy="21.3" r="0.55" fill="white"/>
    <circle cx="27.7" cy="21.3" r="0.55" fill="white"/>
    {/* Confident smile */}
    <path d="M20.5 25.5 Q24 28 27.5 25.5" stroke="#5B21B6" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
  </svg>
)

const AVATARS = { 1: AvatarCourrier, 2: AvatarSpfei, 3: AvatarScvaa, 4: AvatarAdmin }

export default memo(function UserAvatar({ serviceId, size = 44 }) {
  const Avatar = AVATARS[serviceId] ?? AvatarCourrier
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, display: 'block' }}>
      <Avatar />
    </div>
  )
})
