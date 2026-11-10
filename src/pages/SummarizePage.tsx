import { useState } from 'react';
import {
  Check,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  Sparkles,
  Star,
} from 'lucide-react';
import { PageBanner } from '../components/PageBanner';
import { SpeakButton } from '../components/SpeakButton';
import { StepBadge } from '../components/StepBadge';
import { PRESET_LESSONS } from '../data/mockData';
import { SummaryResult } from '../types/learning';
import { simulateSummary } from '../utils/aiSimulator';
import { stopSpeaking } from '../utils/speech';

const MAX_CHARACTERS = 5000;

export function SummarizePage() {
  const [lessonText, setLessonText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(
    null
  );
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSelectPreset = (text: string) => {
    setLessonText(text.slice(0, MAX_CHARACTERS));
    setErrorMessage('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonText.trim()) {
      setErrorMessage('Em hãy dán nội dung bài học hoặc chọn mẫu thử nhé!');
      return;
    }

    stopSpeaking();
    setErrorMessage('');
    setIsSubmitting(true);

    window.setTimeout(() => {
      const generated = simulateSummary(lessonText);
      setSummaryResult(generated);
      setIsSubmitting(false);
    }, 800);
  };

  const handleCopySummary = async () => {
    if (!summaryResult) return;
    const textToCopy = summaryResult.points
      .map((point, idx) => `${idx + 1}. ${point}`)
      .join('\n');
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const handleDownloadSummary = () => {
    if (!summaryResult) return;
    const textContent = summaryResult.points
      .map((point, idx) => `${idx + 1}. ${point}`)
      .join('\n');
    const blob = new Blob(
      [
        `EDUBRIDGE AI - TÓM TẮT BÀI HỌC\n===============================\n\n${textContent}\n\n${summaryResult.readingTip}\n`,
      ],
      { type: 'text/plain;charset=utf-8' }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'edubridge-tom-tat.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <PageBanner
        icon={
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
            <FileText className="h-7 w-7" aria-hidden="true" />
          </span>
        }
        title="Tóm tắt bài học"
        subtitle="Nắm bắt ý chính, ghi nhớ nhanh hơn!"
      />

      <div className="grid items-stretch gap-6 lg:grid-cols-12">
        {/* Left Column: Lesson Text Input */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card sm:p-8 lg:col-span-7"
        >
          <div className="space-y-5">
            <StepBadge step={1} label="Nhập nội dung bài học" />

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">
                Mẫu bài học:
              </span>
              {PRESET_LESSONS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset.text)}
                  className="rounded-full border border-blue-100 bg-blue-50/70 px-3.5 py-1 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Textarea */}
            <div>
              <label htmlFor="summarize-textarea" className="sr-only">
                Nội dung bài học cần tóm tắt
              </label>
              <textarea
                id="summarize-textarea"
                rows={8}
                maxLength={MAX_CHARACTERS}
                value={lessonText}
                onChange={(e) => {
                  setLessonText(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="Ví dụ: Dán nội dung bài học vào đây..."
                className="w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 text-base leading-relaxed text-[#0F2942] placeholder:text-slate-400 focus:border-blue-500"
              />
              <div className="mt-1.5 flex items-center justify-between text-xs">
                <span className="font-medium text-rose-600" role="alert">
                  {errorMessage}
                </span>
                <span className="font-medium text-slate-400">
                  {lessonText.length}/{MAX_CHARACTERS}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2.5 rounded-full bg-blue-600 px-8 py-3.5 text-base font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg disabled:opacity-70"
            >
              <Sparkles className="h-5 w-5" aria-hidden="true" />
              <span>{isSubmitting ? 'Đang tóm tắt...' : 'Tóm tắt ngay'}</span>
            </button>
          </div>
        </form>

        {/* Right Column: Summary Output Card */}
        <aside className="flex flex-col justify-between rounded-3xl border border-emerald-200/70 bg-[#ECFDF5] p-6 shadow-card sm:p-8 lg:col-span-5">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <Star
                className="h-6 w-6 fill-amber-400 text-amber-500"
                aria-hidden="true"
              />
              <h2 className="text-xl font-extrabold text-[#0F2942]">
                Kết quả tóm tắt
              </h2>
            </div>

            {isSubmitting ? (
              <div className="space-y-3 pt-2">
                <div className="h-4 w-full animate-pulse rounded-lg bg-emerald-200/70" />
                <div className="h-4 w-11/12 animate-pulse rounded-lg bg-emerald-200/60" />
                <div className="h-4 w-9/12 animate-pulse rounded-lg bg-emerald-200/60" />
              </div>
            ) : summaryResult ? (
              <div className="space-y-4">
                <ul className="space-y-3 rounded-2xl bg-white/85 p-4 shadow-sm ring-1 ring-emerald-100">
                  {summaryResult.points.map((point, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2.5 text-sm leading-relaxed text-[#0F2942] sm:text-[15px]"
                    >
                      <CheckCircle2
                        className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600"
                        aria-hidden="true"
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                <p className="rounded-2xl bg-emerald-100/70 px-4 py-3 text-xs font-medium leading-relaxed text-emerald-900">
                  {summaryResult.readingTip}
                </p>

                <div className="flex flex-wrap items-center gap-2.5">
                  <SpeakButton
                    text={summaryResult.points.join('. ')}
                    label="Nghe tóm tắt"
                  />
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" aria-hidden="true" />
                        <span>Đã sao chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" aria-hidden="true" />
                        <span>Sao chép</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadSummary}
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm transition-colors hover:bg-emerald-50"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    <span>Tải xuống</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2.5 text-slate-600">
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600"
                  aria-hidden="true"
                />
                <p className="text-base leading-relaxed">
                  Các ý chính của bài học sẽ được hiển thị ở đây...
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl bg-white/60 shadow-sm ring-1 ring-emerald-100">
            <img
              src="/images/student-reading.jpg"
              alt="Học sinh vùng cao chăm chú đọc sách dưới bóng râm"
              className="h-52 w-full object-cover sm:h-56"
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

