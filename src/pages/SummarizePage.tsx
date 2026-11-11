import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
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
import type { SummarizeApiData } from '../types/api';
import { summarize, ApiErrorThrown } from '../api/edubridge';
import { stopSpeaking } from '../utils/speech';

const MAX_CHARACTERS = 5000;

const ERROR_MESSAGES: Record<string, string> = {
  NETWORK_ERROR: 'Không kết nối được backend. Hãy kiểm tra server và kết nối mạng.',
  RATE_LIMITED: 'Bạn đã gửi quá nhiều yêu cầu. Hãy chờ một lát rồi thử lại.',
  AI_TIMEOUT: 'AI xử lý quá lâu. Bạn hãy thử lại sau.',
  AI_UNAVAILABLE: 'Dịch vụ AI tạm thời chưa sẵn sàng. Bạn hãy thử lại sau.',
  AI_CANNOT_PROCESS: 'AI chưa thể tóm tắt nội dung này. Bạn hãy điều chỉnh văn bản.',
  AI_INVALID_RESPONSE: 'AI trả về kết quả chưa hợp lệ. Bạn hãy thử lại.',
  INVALID_RESPONSE: 'Phản hồi từ backend chưa đúng định dạng. Vui lòng thử lại.',
  CONFIG_ERROR: 'Chưa cấu hình đúng địa chỉ backend cho frontend.',
};

export function SummarizePage() {
  const [lessonText, setLessonText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [summaryResult, setSummaryResult] = useState<SummarizeApiData | null>(
    null
  );
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const inFlight = useRef(false);
  const mounted = useRef(true);
  const copyTimer = useRef<number | null>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      stopSpeaking();
      if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
    };
  }, []);

  const clearPreviousResult = () => {
    stopSpeaking();
    setSummaryResult(null);
    setCopied(false);
    setErrorMessage('');
    if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
  };

  const handleSelectPreset = (text: string) => {
    if (inFlight.current) return;
    clearPreviousResult();
    setLessonText(Array.from(text).slice(0, MAX_CHARACTERS).join(''));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inFlight.current) return;

    const text = lessonText.trim();
    if (!text) {
      setErrorMessage('Em hãy dán nội dung bài học hoặc chọn mẫu thử nhé!');
      return;
    }
    if (Array.from(text).length > MAX_CHARACTERS) {
      setErrorMessage(`Bài học chỉ được tối đa ${MAX_CHARACTERS} ký tự.`);
      return;
    }

    clearPreviousResult();
    inFlight.current = true;
    setIsSubmitting(true);

    try {
      // summarize() trả trực tiếp data: summary và keyPoints.
      const generated = await summarize(text);
      if (mounted.current) setSummaryResult(generated);
    } catch (error: unknown) {
      if (!mounted.current) return;
      if (error instanceof ApiErrorThrown) {
        const validationMessage = error.code === 'VALIDATION_ERROR'
          ? error.details?.[0]?.message || error.message
          : undefined;
        setErrorMessage(
          validationMessage || ERROR_MESSAGES[error.code] || error.message
        );
      } else {
        setErrorMessage('Không thể tóm tắt bài học. Bạn hãy thử lại sau.');
      }
    } finally {
      inFlight.current = false;
      if (mounted.current) setIsSubmitting(false);
    }
  };

  // Dùng cùng nội dung cho sao chép, tải xuống và phát âm.
  const getSummaryPlainText = (): string => {
    if (!summaryResult) return '';
    const points = summaryResult.keyPoints
      .map((point, index) => `${index + 1}. ${point}`)
      .join('\n');
    return `Tóm tắt:\n${summaryResult.summary}\n\nCác ý chính:\n${points}`;
  };

  const handleCopySummary = async () => {
    if (!summaryResult) return;
    const textToCopy = getSummaryPlainText();
    try {
      await navigator.clipboard.writeText(textToCopy);
      if (!mounted.current) return;
      setCopied(true);
      if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => {
        if (mounted.current) setCopied(false);
      }, 2200);
    } catch {
      if (mounted.current) setCopied(false);
    }
  };

  const handleDownloadSummary = () => {
    if (!summaryResult) return;
    const textContent = getSummaryPlainText();
    const blob = new Blob(
      [
        `EDUBRIDGE AI - TÓM TẮT BÀI HỌC\n===============================\n\n${textContent}\n`,
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
                  disabled={isSubmitting}
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
                disabled={isSubmitting}
                aria-invalid={Boolean(errorMessage)}
                aria-describedby="summarize-error"
                value={lessonText}
                onChange={(e) => {
                  clearPreviousResult();
                  setLessonText(e.target.value);
                }}
                placeholder="Ví dụ: Dán nội dung bài học vào đây..."
                className="w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 text-base leading-relaxed text-[#0F2942] placeholder:text-slate-400 focus:border-blue-500"
              />
              <div className="mt-1.5 flex items-center justify-between text-xs">
                <span id="summarize-error" className="font-medium text-rose-600" role="alert">
                  {errorMessage}
                </span>
                <span className="font-medium text-slate-400">
                  {Array.from(lessonText.trim()).length}/{MAX_CHARACTERS}
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
        <aside aria-busy={isSubmitting} className="flex flex-col justify-between rounded-3xl border border-emerald-200/70 bg-[#ECFDF5] p-6 shadow-card sm:p-8 lg:col-span-5">
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
              <div className="space-y-3 pt-2" role="status" aria-live="polite">
                <span className="sr-only">AI đang tóm tắt bài học, vui lòng chờ.</span>
                <div className="h-4 w-full animate-pulse rounded-lg bg-emerald-200/70" />
                <div className="h-4 w-11/12 animate-pulse rounded-lg bg-emerald-200/60" />
                <div className="h-4 w-9/12 animate-pulse rounded-lg bg-emerald-200/60" />
              </div>
            ) : summaryResult ? (
              <div className="space-y-4">
                <div className="rounded-2xl bg-emerald-100/70 px-4 py-3 text-sm leading-relaxed text-emerald-900">
                  <h3 className="mb-2 font-bold">Bản tóm tắt</h3>
                  <p className="whitespace-pre-line">{summaryResult.summary}</p>
                </div>
                <h3 className="font-bold text-[#0F2942]">Các ý chính</h3>
                <ul className="space-y-3 rounded-2xl bg-white/85 p-4 shadow-sm ring-1 ring-emerald-100">
                  {summaryResult.keyPoints.map((point, index) => (
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

                <div className="flex flex-wrap items-center gap-2.5">
                  <SpeakButton
                    text={getSummaryPlainText()}
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
                  {errorMessage
                    ? 'Chưa có kết quả. Bạn có thể điều chỉnh nội dung hoặc thử lại.'
                    : 'Bản tóm tắt và các ý chính sẽ được hiển thị ở đây...'}
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

