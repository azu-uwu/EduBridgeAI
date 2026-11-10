import { ArrowRight, BookOpen, ListTodo, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FeatureCardItem {
  title: string;
  description: string;
  to: string;
  iconBgClass: string;
  iconTextClass: string;
  Icon: typeof BookOpen;
}

const FEATURE_CARDS: FeatureCardItem[] = [
  {
    title: 'Đơn giản hóa văn bản',
    description: 'Hiểu dễ hơn, nhanh hơn',
    to: '/don-gian-hoa',
    iconBgClass: 'bg-blue-50',
    iconTextClass: 'text-blue-600',
    Icon: BookOpen,
  },
  {
    title: 'Giải thích từ khó',
    description: 'Nắm rõ nghĩa, có ví dụ',
    to: '/giai-thich-tu',
    iconBgClass: 'bg-emerald-50',
    iconTextClass: 'text-emerald-600',
    Icon: Search,
  },
  {
    title: 'Tóm tắt bài học',
    description: 'Ghi nhớ nhanh chóng',
    to: '/tom-tat',
    iconBgClass: 'bg-purple-50',
    iconTextClass: 'text-purple-600',
    Icon: ListTodo,
  },
];

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-10 animate-fade-up">
      {/* Hero Banner */}
      <section className="overflow-hidden rounded-3xl border border-blue-100/80 bg-[#EFF6FF] shadow-card">
        <div className="grid items-center gap-6 lg:grid-cols-12">
          {/* Left Column */}
          <div className="space-y-5 p-7 sm:p-10 lg:col-span-7 lg:pr-4">
            <span className="inline-flex items-center rounded-full bg-white px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-blue-600 shadow-sm">
              TRỢ LÝ HỌC TẬP THÔNG MINH
            </span>

            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-[#0F2942] sm:text-4xl lg:text-[42px]">
              <span className="block">
                <span className="text-blue-600">EduBridge</span>{' '}
                <span className="text-emerald-600">AI</span>
              </span>
              <span className="mt-1 block text-2xl sm:text-3xl lg:text-[34px]">
                Học dễ dàng hơn, hiểu sâu hơn cùng AI!
              </span>
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Công cụ hỗ trợ học tập thông minh, giúp bạn hiểu tiếng Việt thật dễ
              dàng!
            </p>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => navigate('/don-gian-hoa')}
                className="inline-flex items-center gap-3 rounded-full bg-blue-600 px-7 py-3.5 text-base font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg active:translate-y-0"
              >
                <span>Bắt đầu ngay</span>
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Right Column: Highland Students Illustration */}
          <div className="h-full p-4 pt-0 sm:p-6 lg:col-span-5 lg:p-6">
            <div className="overflow-hidden rounded-3xl bg-white/60 shadow-sm ring-1 ring-blue-100">
              <img
                src="/images/hero-students.jpg"
                alt="Hai học sinh vùng cao vui vẻ cùng đọc sách dưới ánh sáng bóng đèn trí tuệ"
                className="h-64 w-full object-cover sm:h-80 lg:h-[340px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section: Bạn muốn học gì hôm nay? */}
      <section aria-labelledby="home-features-heading" className="space-y-5">
        <h2
          id="home-features-heading"
          className="text-xl font-extrabold tracking-tight text-[#0F2942] sm:text-2xl"
        >
          Bạn muốn học gì hôm nay?
        </h2>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURE_CARDS.map((card) => {
            const Icon = card.Icon;
            return (
              <button
                key={card.to}
                type="button"
                onClick={() => navigate(card.to)}
                className="group flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 text-left shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
              >
                <span
                  className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-105 ${card.iconBgClass} ${card.iconTextClass}`}
                >
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-[#0F2942] group-hover:text-blue-600 sm:text-[17px]">
                    {card.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {card.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

