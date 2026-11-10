import { ConceptVisualTheme } from '../types/learning';

interface ConceptIllustrationProps {
  theme: ConceptVisualTheme;
  word: string;
  imageUrl?: string;
}

export function ConceptIllustration({
  theme,
  word,
  imageUrl,
}: ConceptIllustrationProps) {
  if (imageUrl) {
    return (
      <div className="relative h-full min-h-[240px] w-full overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-sky-100 shadow-card">
        <img
          src={imageUrl}
          alt={`Minh họa khái niệm ${word}`}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[240px] w-full flex-col items-center justify-center overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-[#EFF6FF] via-white to-[#ECFDF5] p-6 text-center shadow-card">
      {theme === 'culture' && (
        <svg
          viewBox="0 0 280 200"
          className="h-48 w-full max-w-[260px]"
          role="img"
          aria-label={`Tranh minh họa ${word}`}
        >
          <rect width="280" height="200" rx="24" fill="#EFF6FF" />
          <path d="M0 155 Q75 110 150 145 T280 135 L280 200 L0 200 Z" fill="#BBF7D0" />
          <path d="M0 170 Q95 140 190 165 T280 155 L280 200 L0 200 Z" fill="#86EFAC" />
          {/* Traditional pattern weave diamond */}
          <g transform="translate(140 85)">
            <polygon points="0,-46 46,0 0,46 -46,0" fill="#2563EB" opacity="0.9" />
            <polygon points="0,-32 32,0 0,32 -32,0" fill="#FACC15" />
            <polygon points="0,-18 18,0 0,18 -18,0" fill="#EF4444" />
            <circle cx="0" cy="0" r="6" fill="#FFFFFF" />
          </g>
          <circle cx="48" cy="44" r="14" fill="#FDE047" />
        </svg>
      )}

      {(theme === 'photosynthesis' || theme === 'ecosystem' || theme === 'nature') && (
        <svg
          viewBox="0 0 280 200"
          className="h-48 w-full max-w-[260px]"
          role="img"
          aria-label={`Tranh minh họa ${word}`}
        >
          <rect width="280" height="200" rx="24" fill="#ECFDF5" />
          {/* Sun */}
          <circle cx="62" cy="52" r="24" fill="#FACC15" />
          <g stroke="#F59E0B" strokeWidth="3" strokeLinecap="round">
            <line x1="62" y1="18" x2="62" y2="10" />
            <line x1="62" y1="94" x2="62" y2="86" />
            <line x1="28" y1="52" x2="20" y2="52" />
            <line x1="104" y1="52" x2="96" y2="52" />
            <line x1="88" y1="28" x2="94" y2="22" />
          </g>
          {/* Ground */}
          <path d="M0 160 Q140 135 280 160 L280 200 L0 200 Z" fill="#86EFAC" />
          {/* Sprout & Leaves */}
          <path d="M150 162 V88" stroke="#15803D" strokeWidth="7" strokeLinecap="round" />
          <path d="M150 120 Q110 105 112 75 Q142 75 150 112 Z" fill="#22C55E" />
          <path d="M150 105 Q190 90 192 60 Q162 60 150 98 Z" fill="#16A34A" />
          {/* Water droplets */}
          <path d="M218 82 Q228 98 218 106 Q208 98 218 82 Z" fill="#38BDF8" />
          <path d="M236 105 Q244 118 236 124 Q228 118 236 105 Z" fill="#60A5FA" />
        </svg>
      )}

      {theme === 'heritage' && (
        <svg
          viewBox="0 0 280 200"
          className="h-48 w-full max-w-[260px]"
          role="img"
          aria-label={`Tranh minh họa ${word}`}
        >
          <rect width="280" height="200" rx="24" fill="#EFF6FF" />
          {/* Terraced hills */}
          <path d="M0 120 Q140 75 280 120 L280 200 L0 200 Z" fill="#A7F3D0" />
          <path d="M0 140 Q140 100 280 140 L280 200 L0 200 Z" fill="#6EE7B7" />
          <path d="M0 162 Q140 130 280 162 L280 200 L0 200 Z" fill="#34D399" />
          {/* Stilt house */}
          <rect x="112" y="88" width="56" height="32" rx="4" fill="#D97706" />
          <polygon points="102,90 140,62 178,90" fill="#92400E" />
          <line x1="120" y1="120" x2="120" y2="140" stroke="#78350F" strokeWidth="4" />
          <line x1="160" y1="120" x2="160" y2="140" stroke="#78350F" strokeWidth="4" />
        </svg>
      )}

      {theme === 'solidarity' && (
        <svg
          viewBox="0 0 280 200"
          className="h-48 w-full max-w-[260px]"
          role="img"
          aria-label={`Tranh minh họa ${word}`}
        >
          <rect width="280" height="200" rx="24" fill="#EFF6FF" />
          <circle cx="95" cy="78" r="20" fill="#FDBA74" />
          <circle cx="140" cy="68" r="22" fill="#FED7AA" />
          <circle cx="185" cy="78" r="20" fill="#FDBA74" />
          <path d="M68 145 Q95 108 122 145 Z" fill="#2563EB" />
          <path d="M110 145 Q140 98 170 145 Z" fill="#16A34A" />
          <path d="M158 145 Q185 108 212 145 Z" fill="#F59E0B" />
          <path
            d="M140 36 C135 28 122 30 122 40 C122 50 140 58 140 58 C140 58 158 50 158 40 C158 30 145 28 140 36 Z"
            fill="#EF4444"
          />
        </svg>
      )}

      {(theme === 'tech' || theme === 'general') && (
        <svg
          viewBox="0 0 280 200"
          className="h-48 w-full max-w-[260px]"
          role="img"
          aria-label={`Tranh minh họa ${word}`}
        >
          <rect width="280" height="200" rx="24" fill="#EFF6FF" />
          <rect x="64" y="42" width="152" height="104" rx="14" fill="#FFFFFF" stroke="#93C5FD" strokeWidth="3" />
          <circle cx="140" cy="86" r="26" fill="#FEF08A" />
          <path d="M130 108 H150 L146 122 H134 Z" fill="#F59E0B" />
          <circle cx="140" cy="84" r="16" fill="#FACC15" />
          <rect x="92" y="156" width="96" height="12" rx="6" fill="#2563EB" opacity="0.2" />
        </svg>
      )}

      <span className="mt-3 inline-flex items-center rounded-full bg-white/90 px-4 py-1 text-xs font-semibold text-blue-700 shadow-sm">
        Minh họa: {word}
      </span>
    </div>
  );
}

