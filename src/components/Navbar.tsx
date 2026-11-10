import { useState } from 'react';
import { GraduationCap, Menu, User, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface NavItem {
  label: string;
  to: string;
  end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Trang chủ', to: '/', end: true },
  { label: 'Đơn giản hóa', to: '/don-gian-hoa' },
  { label: 'Giải thích từ', to: '/giai-thich-tu' },
  { label: 'Tóm tắt', to: '/tom-tat' },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Logo */}
        <NavLink
          to="/"
          className="flex items-center gap-2.5 rounded-xl py-1 pr-2 transition-opacity hover:opacity-90"
          aria-label="EduBridge AI - Trang chủ"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-sm">
            <GraduationCap className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-[#0F2942]">
            EduBridge AI
          </span>
        </NavLink>

        {/* Center: Desktop Navigation */}
        <nav
          aria-label="Điều hướng chính"
          className="hidden h-full items-center gap-8 md:flex"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `relative flex h-full items-center px-1 text-[15px] transition-colors ${
                  isActive
                    ? 'font-bold text-blue-600'
                    : 'font-medium text-slate-600 hover:text-[#0F2942]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span>{item.label}</span>
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full bg-blue-600"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right: Static Symbolic Profile Avatar + Mobile Toggle */}
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-200 bg-gradient-to-b from-blue-100 to-blue-200/80 text-blue-700 shadow-sm"
            role="img"
            aria-label="Học sinh"
            title="Bạn học sinh EduBridge AI"
          >
            <User className="h-5 w-5" aria-hidden="true" />
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 md:hidden"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <nav
          aria-label="Điều hướng di động"
          className="border-t border-slate-100 bg-white px-4 py-3 md:hidden"
        >
          <div className="flex flex-col gap-1.5">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-2.5 text-sm transition-colors ${
                    isActive
                      ? 'bg-blue-50 font-bold text-blue-600'
                      : 'font-medium text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

