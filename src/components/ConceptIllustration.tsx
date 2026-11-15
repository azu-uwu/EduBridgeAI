import { ConceptVisualTheme } from '../types/learning';

interface ConceptIllustrationProps {
  theme: ConceptVisualTheme;
  word: string;
  imageUrl?: string;
}

export function detectThemeFromWord(word: string, fallbackTheme: ConceptVisualTheme = 'general'): ConceptVisualTheme {
  const lower = word.toLowerCase();
  if (
    lower.includes('công nghệ') ||
    lower.includes('máy') ||
    lower.includes('số') ||
    lower.includes('kỹ thuật') ||
    lower.includes('tri thức') ||
    lower.includes('khoa học') ||
    lower.includes('internet')
  ) {
    return 'tech';
  }
  if (
    lower.includes('văn hóa') ||
    lower.includes('truyền thống') ||
    lower.includes('bản sắc') ||
    lower.includes('dân tộc') ||
    lower.includes('thổ cẩm') ||
    lower.includes('lễ hội') ||
    lower.includes('bảo tồn')
  ) {
    return 'culture';
  }
  if (
    lower.includes('quang hợp') ||
    lower.includes('lá') ||
    lower.includes('cây') ||
    lower.includes('diệp lục') ||
    lower.includes('năng lượng')
  ) {
    return 'photosynthesis';
  }
  if (
    lower.includes('sinh thái') ||
    lower.includes('rừng') ||
    lower.includes('tự nhiên') ||
    lower.includes('môi trường') ||
    lower.includes('tài nguyên')
  ) {
    return 'ecosystem';
  }
  if (
    lower.includes('di sản') ||
    lower.includes('lịch sử') ||
    lower.includes('chiến thắng') ||
    lower.includes('điện biên') ||
    lower.includes('thời kỳ')
  ) {
    return 'heritage';
  }
  if (
    lower.includes('đoàn kết') ||
    lower.includes('yêu thương') ||
    lower.includes('giúp đỡ') ||
    lower.includes('đồng lòng') ||
    lower.includes('chung sức')
  ) {
    return 'solidarity';
  }
  if (
    lower.includes('khí hậu') ||
    lower.includes('thời tiết') ||
    lower.includes('mưa') ||
    lower.includes('sương mù') ||
    lower.includes('gió')
  ) {
    return 'nature';
  }
  return fallbackTheme;
}

export function ConceptIllustration({
  theme,
  word,
  imageUrl,
}: ConceptIllustrationProps) {
  if (imageUrl) {
    return (
      <div className="relative flex h-full min-h-[280px] w-full flex-col items-center justify-center overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-sky-100 shadow-card">
        <img
          src={imageUrl}
          alt={`Minh họa khái niệm ${word}`}
          className="h-full max-h-[240px] w-full object-cover rounded-2xl"
        />
        <span className="mt-2 inline-flex items-center rounded-full bg-white/95 px-3.5 py-1 text-xs font-bold text-blue-700 shadow-sm border border-blue-100">
          Khái niệm: {word}
        </span>
      </div>
    );
  }

  const effectiveTheme = detectThemeFromWord(word, theme);

  return (
    <div className="flex h-full min-h-[280px] w-full flex-col items-center justify-center overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-[#EFF6FF] via-white to-[#F0FDF4] p-6 text-center shadow-card transition-all">
      {/* 1. Theme VĂN HÓA & TRUYỀN THỐNG */}
      {effectiveTheme === 'culture' && (
        <svg
          viewBox="0 0 280 200"
          className="h-48 w-full max-w-[260px] drop-shadow-sm"
          role="img"
          aria-label={`Tranh minh họa văn hóa: ${word}`}
        >
          <rect width="280" height="200" rx="24" fill="#FEF3C7" opacity="0.3" />
          {/* Núi đồi Tây Bắc hùng vĩ */}
          <path d="M0 160 Q80 110 160 148 T280 135 L280 200 L0 200 Z" fill="#BBF7D0" />
          <path d="M0 175 Q95 140 190 168 T280 160 L280 200 L0 200 Z" fill="#86EFAC" />
          {/* Mặt trời hồng sương sớm vùng cao */}
          <circle cx="50" cy="45" r="18" fill="#F87171" opacity="0.9" />
          <circle cx="50" cy="45" r="24" fill="#FCA5A5" opacity="0.3" />
          {/* Họa tiết hoa văn thổ cẩm dân tộc Tây Bắc đa sắc */}
          <g transform="translate(140 88)">
            <polygon points="0,-48 48,0 0,48 -48,0" fill="#2563EB" opacity="0.95" />
            <polygon points="0,-36 36,0 0,36 -36,0" fill="#F59E0B" />
            <polygon points="0,-24 24,0 0,24 -24,0" fill="#EF4444" />
            <polygon points="0,-12 12,0 0,12 -12,0" fill="#10B981" />
            <circle cx="0" cy="0" r="5" fill="#FFFFFF" />
          </g>
          <text x="140" y="180" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#047857">
            Bản sắc & Truyền thống
          </text>
        </svg>
      )}

      {/* 2. Theme QUANG HỢP */}
      {effectiveTheme === 'photosynthesis' && (
        <svg
          viewBox="0 0 280 200"
          className="h-48 w-full max-w-[260px] drop-shadow-sm"
          role="img"
          aria-label={`Tranh minh họa quang hợp: ${word}`}
        >
          <rect width="280" height="200" rx="24" fill="#ECFDF5" />
          {/* Mặt trời tỏa ánh sáng quang năng */}
          <circle cx="60" cy="50" r="22" fill="#FACC15" />
          <g stroke="#F59E0B" strokeWidth="3" strokeLinecap="round">
            <line x1="60" y1="18" x2="60" y2="10" />
            <line x1="60" y1="90" x2="60" y2="82" />
            <line x1="28" y1="50" x2="20" y2="50" />
            <line x1="100" y1="50" x2="92" y2="50" />
            <line x1="84" y1="28" x2="90" y2="22" />
            <line x1="36" y1="72" x2="30" y2="78" />
          </g>
          {/* Đất mẹ màu mỡ */}
          <path d="M0 160 Q140 135 280 160 L280 200 L0 200 Z" fill="#86EFAC" />
          {/* Cây non vươn lên đón nắng */}
          <path d="M148 162 V85" stroke="#15803D" strokeWidth="8" strokeLinecap="round" />
          <path d="M148 118 Q105 102 108 72 Q138 72 148 110 Z" fill="#22C55E" />
          <path d="M148 102 Q190 86 192 56 Q162 56 148 95 Z" fill="#16A34A" />
          {/* Bong bóng khí O2 sạch bay lên */}
          <circle cx="215" cy="85" r="16" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2" />
          <text x="215" y="90" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#0284C7">
            O₂
          </text>
          <text x="140" y="186" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#15803D">
            Quang hợp nhả Oxy
          </text>
        </svg>
      )}

      {/* 3. Theme HỆ SINH THÁI & THIÊN NHIÊN */}
      {(effectiveTheme === 'ecosystem' || effectiveTheme === 'nature') && (
        <svg
          viewBox="0 0 280 200"
          className="h-48 w-full max-w-[260px] drop-shadow-sm"
          role="img"
          aria-label={`Tranh minh họa hệ sinh thái: ${word}`}
        >
          <rect width="280" height="200" rx="24" fill="#F0FDF4" />
          {/* Rừng cây xanh mát */}
          <path d="M0 135 Q140 90 280 135 L280 200 L0 200 Z" fill="#BBF7D0" />
          <path d="M0 155 Q140 120 280 155 L280 200 L0 200 Z" fill="#4ADE80" />
          {/* Hàng cây thông rừng núi */}
          <polygon points="70,95 85,135 55,135" fill="#166534" />
          <polygon points="70,75 82,110 58,110" fill="#15803D" />
          <polygon points="120,85 138,135 102,135" fill="#166534" />
          <polygon points="120,65 134,105 106,105" fill="#22C55E" />
          <polygon points="210,95 225,135 195,135" fill="#166534" />
          {/* Dòng suối trong veo */}
          <path d="M120 200 Q150 165 170 145" stroke="#38BDF8" strokeWidth="14" fill="none" />
          <text x="140" y="185" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#166534">
            Rừng xanh & Nguồn nước
          </text>
        </svg>
      )}

      {/* 4. Theme DI SẢN & LỊCH SỬ */}
      {effectiveTheme === 'heritage' && (
        <svg
          viewBox="0 0 280 200"
          className="h-48 w-full max-w-[260px] drop-shadow-sm"
          role="img"
          aria-label={`Tranh minh họa di sản: ${word}`}
        >
          <rect width="280" height="200" rx="24" fill="#FFFBEB" />
          {/* Ruộng bậc thang tầng tầng lớp lớp */}
          <path d="M0 115 Q140 75 280 115 L280 200 L0 200 Z" fill="#FDE68A" />
          <path d="M0 138 Q140 100 280 138 L280 200 L0 200 Z" fill="#FCD34D" />
          <path d="M0 162 Q140 130 280 162 L280 200 L0 200 Z" fill="#F59E0B" />
          {/* Mái nhà sàn truyền thống */}
          <rect x="110" y="85" width="60" height="32" rx="4" fill="#D97706" />
          <polygon points="100,86 140,56 180,86" fill="#92400E" />
          <line x1="120" y1="117" x2="120" y2="138" stroke="#78350F" strokeWidth="4" />
          <line x1="160" y1="117" x2="160" y2="138" stroke="#78350F" strokeWidth="4" />
          <circle cx="230" cy="42" r="16" fill="#F87171" opacity="0.8" />
          <text x="140" y="185" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#92400E">
            Di sản truyền thống
          </text>
        </svg>
      )}

      {/* 5. Theme ĐOÀN KẾT */}
      {effectiveTheme === 'solidarity' && (
        <svg
          viewBox="0 0 280 200"
          className="h-48 w-full max-w-[260px] drop-shadow-sm"
          role="img"
          aria-label={`Tranh minh họa đoàn kết: ${word}`}
        >
          <rect width="280" height="200" rx="24" fill="#EFF6FF" />
          {/* Những người bạn nắm chặt tay nhau */}
          <circle cx="85" cy="80" r="18" fill="#FDBA74" />
          <circle cx="140" cy="70" r="20" fill="#FED7AA" />
          <circle cx="195" cy="80" r="18" fill="#FDBA74" />
          <path d="M58 145 Q85 110 112 145 Z" fill="#2563EB" />
          <path d="M110 145 Q140 98 170 145 Z" fill="#16A34A" />
          <path d="M168 145 Q195 110 222 145 Z" fill="#F59E0B" />
          {/* Trái tim yêu thương ở giữa */}
          <path
            d="M140 34 C134 24 118 26 118 38 C118 50 140 60 140 60 C140 60 162 50 162 38 C162 26 146 24 140 34 Z"
            fill="#EF4444"
          />
          <text x="140" y="175" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#1E40AF">
            Chung sức đồng lòng
          </text>
        </svg>
      )}

      {/* 6. Theme CÔNG NGHỆ */}
      {effectiveTheme === 'tech' && (
        <svg
          viewBox="0 0 280 200"
          className="h-48 w-full max-w-[260px] drop-shadow-sm"
          role="img"
          aria-label={`Tranh minh họa công nghệ: ${word}`}
        >
          <rect width="280" height="200" rx="24" fill="#EFF6FF" />
          {/* Màn hình máy tính bảng hiện đại */}
          <rect x="52" y="36" width="176" height="114" rx="14" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="3" />
          {/* Bóng đèn trí tuệ phát sáng rực rỡ */}
          <circle cx="140" cy="85" r="24" fill="#FEF08A" />
          <path d="M132 106 H148 L144 118 H136 Z" fill="#F59E0B" />
          <circle cx="140" cy="83" r="15" fill="#FACC15" />
          {/* Đế máy tính & bàn phím thông minh */}
          <path d="M40 156 H240 L220 170 H60 Z" fill="#93C5FD" />
          {/* Tia sóng tri thức công nghệ */}
          <line x1="140" y1="48" x2="140" y2="38" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
          <line x1="108" y1="62" x2="100" y2="54" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
          <line x1="172" y1="62" x2="180" y2="54" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
          <text x="140" y="190" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#1D4ED8">
            Công nghệ & Tri thức số
          </text>
        </svg>
      )}

      {/* 7. Theme CHUNG / HỌC TẬP */}
      {effectiveTheme === 'general' && (
        <svg
          viewBox="0 0 280 200"
          className="h-48 w-full max-w-[260px] drop-shadow-sm"
          role="img"
          aria-label={`Tranh minh họa học tập: ${word}`}
        >
          <rect width="280" height="200" rx="24" fill="#F8FAFC" />
          {/* Cuốn sách mở rộng tri thức */}
          <path d="M40 140 Q140 125 140 70 Q140 125 240 140 L230 160 Q140 145 140 90 Q140 145 50 160 Z" fill="#3B82F6" />
          <path d="M50 135 Q140 120 140 68 Q140 120 230 135 L222 153 Q140 138 140 86 Q140 138 58 153 Z" fill="#FFFFFF" />
          {/* Ngôi sao tri thức */}
          <polygon points="140,25 145,38 158,38 147,46 151,59 140,51 129,59 133,46 122,38 135,38" fill="#FACC15" />
          <text x="140" y="185" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#334155">
            Học tập & Khám phá
          </text>
        </svg>
      )}

      <div className="mt-4 flex items-center justify-center gap-2">
        <span className="inline-flex items-center rounded-full bg-blue-50 px-3.5 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-200">
          Khái niệm: {word}
        </span>
      </div>
    </div>
  );
}
