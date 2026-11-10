import { ReactNode } from 'react';

interface PageBannerProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  tone?: 'blue' | 'success';
}

export function PageBanner({
  icon,
  title,
  subtitle,
  tone = 'blue',
}: PageBannerProps) {
  const containerClass =
    tone === 'success'
      ? 'bg-[#EBF4FF] border border-blue-100/80'
      : 'bg-[#EBF3FF] border border-blue-100/80';

  return (
    <section
      className={`rounded-3xl px-6 py-5 shadow-sm sm:px-8 sm:py-6 ${containerClass}`}
    >
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
        <div className="flex-shrink-0">{icon}</div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0F2942] sm:text-[26px]">
            {title}
          </h1>
          <p className="mt-1 text-sm text-slate-600 sm:text-base">{subtitle}</p>
        </div>
      </div>
    </section>
  );
}

