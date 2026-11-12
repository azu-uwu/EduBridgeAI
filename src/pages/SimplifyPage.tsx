import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
  FileCheck2,
  FileText,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { PageBanner } from '../components/PageBanner';
import { SpeakButton } from '../components/SpeakButton';
import { StepBadge } from '../components/StepBadge';
import { PRESET_LESSONS } from '../data/mockData';
import type { ResultSubTab, SimplificationLevel } from '../types/learning';
import type { LanguageLevel, SimplifyApiData } from '../types/api';
import { simplify, ApiErrorThrown } from '../api/edubridge';
import { stopSpeaking } from '../utils/speech';

const MAX_CHARACTERS = 5000;

// Chỉ lưu dữ liệu thực từ API và văn bản nguồn của chính request đó.
type PageResult = SimplifyApiData & { originalText: string };

const API_LEVELS: Record<SimplificationLevel, LanguageLevel> = {
  'de-hieu': 'basic',
  'co-ban': 'intermediate',
  'nang-cao': 'advanced',
};

const ERROR_MESSAGES: Record<string, string> = {
  NETWORK_ERROR: 'Không kết nối được backend. Hãy kiểm tra server và kết nối mạng.',
  RATE_LIMITED: 'Bạn đã gửi quá nhiều yêu cầu. Hãy chờ một lát rồi thử lại.',
  AI_TIMEOUT: 'AI xử lý quá lâu. Bạn hãy thử lại sau.',
  AI_UNAVAILABLE: 'Dịch vụ AI tạm thời chưa sẵn sàng. Bạn hãy thử lại sau.',
  AI_CANNOT_PROCESS: 'AI chưa thể xử lý nội dung này. Bạn hãy điều chỉnh văn bản.',
  AI_INVALID_RESPONSE: 'AI trả về kết quả chưa hợp lệ. Bạn hãy thử lại.',
  INVALID_RESPONSE: 'Phản hồi từ backend chưa đúng định dạng. Vui lòng thử lại.',
  CONFIG_ERROR: 'Chưa cấu hình đúng địa chỉ backend cho frontend.',
};

const LEVEL_OPTIONS: Array<{ value: SimplificationLevel; label: string }> = [
  { value: 'de-hieu', label: 'Cơ bản (dễ hiểu)' },
  { value: 'co-ban', label: 'Trung bình' },
  { value: 'nang-cao', label: 'Nâng cao' },
];

const SUB_TABS: Array<{ id: ResultSubTab; label: string }> = [
  { id: 'simplified', label: 'Văn bản đơn giản hóa' },
  { id: 'vocabulary', label: 'Giải thích từ khó' },
  { id: 'summary', label: 'Tóm tắt bài học' },
];

export function SimplifyPage() {
  const [inputText, setInputText] = useState('');
  const [level, setLevel] = useState<SimplificationLevel>('de-hieu');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<PageResult | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
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

  const handleSelectPreset = (presetText: string) => {
    setInputText(Array.from(presetText).slice(0, MAX_CHARACTERS).join(''));
    setErrorMessage('');
  };

  const handleProcess = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inFlight.current) return;

    const originalText = inputText.trim();
    if (!originalText) {
      setErrorMessage('Em hãy nhập hoặc chọn một đoạn văn bản mẫu trước nhé!');
      return;
    }
    if (Array.from(originalText).length > MAX_CHARACTERS) {
      setErrorMessage(`Văn bản chỉ được tối đa ${MAX_CHARACTERS} ký tự.`);
      return;
    }

    stopSpeaking();
    if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
    setErrorMessage('');
    setResult(null);
    setCopied(false);
    setShowOriginal(false);
    inFlight.current = true;
    setIsSubmitting(true);

    try {
      // Hàm simplify trả trực tiếp data, không phải envelope success/data/meta.
      const generated = await simplify(originalText, API_LEVELS[level]);
      if (mounted.current) {
        setResult({ ...generated, originalText });
      }
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
        setErrorMessage('Không thể xử lý văn bản. Bạn hãy thử lại sau.');
      }
    } finally {
      inFlight.current = false;
      if (mounted.current) setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    stopSpeaking();
    setResult(null);
    setShowOriginal(false);
    setCopied(false);
    setErrorMessage('');
    if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
  };

  const getActiveTabPlainText = (): string => result?.simplifiedText ?? '';

  const handleCopy = async () => {
    const content = getActiveTabPlainText();
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      if (!mounted.current) return;
      setCopied(true);
      if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => {
        if (mounted.current) setCopied(false);
      }, 2200);
    } catch {
      setCopied(false);
    }
  };

  const handleDownload = () => {
    const content = getActiveTabPlainText();
    if (!content) return;
    const blob = new Blob(
      [
        `EDUBRIDGE AI - KẾT QUẢ HỌC TẬP\n================================\n\n${content}\n`,
      ],
      { type: 'text/plain;charset=utf-8' }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'edubridge-simplified.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Loading Skeleton View
  if (isSubmitting) {
    return (
      <div className="space-y-6 animate-fade-up" role="status" aria-live="polite" aria-busy="true">
        <PageBanner
          icon={
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
              <FileText className="h-7 w-7" aria-hidden="true" />
            </span>
          }
          title="Đơn giản hóa văn bản"
          subtitle="AI đang đọc và chuyển đổi đoạn văn thành ngôn ngữ dễ hiểu..."
        />

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-card lg:col-span-7">
            <div className="h-6 w-56 animate-pulse rounded-lg bg-slate-200" />
            <div className="h-4 w-full animate-pulse rounded-lg bg-slate-100" />
            <div className="h-4 w-11/12 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-4 w-4/5 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-4 w-9/12 animate-pulse rounded-lg bg-slate-100" />
            <div className="flex items-center gap-2 pt-4 text-sm font-semibold text-blue-600">
              <Sparkles className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>Đang xử lý bằng AI...</span>
            </div>
          </div>
          <div className="h-72 animate-pulse rounded-3xl bg-blue-50 lg:col-span-5" />
        </div>
      </div>
    );
  }

  // Result State View (Matches Screen 4)
  if (result) {
    const activePlainText = getActiveTabPlainText();

    return (
      <div className="space-y-6 animate-fade-up">
        {/* Green Success Banner */}
        <PageBanner
          tone="success"
          icon={
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
              <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
            </span>
          }
          title="Kết quả xử lý"
          subtitle="Dưới đây là kết quả từ AI:"
        />

        {/* 3 Sub-Tabs Pill Bar */}
        <div
          role="tablist"
          aria-label="Chế độ xem kết quả AI"
          className="grid grid-cols-1 gap-2 rounded-3xl border border-slate-200/80 bg-white p-1.5 shadow-sm sm:grid-cols-3 sm:rounded-full"
        >
          {SUB_TABS.map((tab) => {
            const isActive = tab.id === 'simplified';
            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={isActive}
                disabled={!isActive}
                title={!isActive ? 'Dùng chức năng tương ứng trên thanh điều hướng.' : undefined}
                className={`rounded-full px-5 py-3 text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'cursor-not-allowed text-slate-400'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <p className="text-sm text-slate-500">
          Kết quả này chỉ gồm văn bản đơn giản hóa. Để giải thích từ khó hoặc
          tóm tắt bài học, chọn chức năng tương ứng trên thanh điều hướng.
        </p>

        {/* Result Split Layout */}
        <div className="grid items-stretch gap-6 lg:grid-cols-12">
          {/* Left Result Content Card */}
          <div className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card sm:p-8 lg:col-span-7">
            <div className="space-y-5">
              {/* Header inside result card */}
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <FileCheck2 className="h-6 w-6 text-emerald-600" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-xl font-extrabold leading-snug text-[#0F2942]">
                    Văn bản đã được đơn giản hóa thành công!
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Bạn có thể nghe phát âm, sao chép, tải xuống hoặc thử lại nếu
                    cần.
                  </p>
                </div>
              </div>

              {/* Tab Content Body */}
              <div className="rounded-2xl border border-blue-100 bg-[#F8FBFF] p-5">

                  <div className="space-y-4">
                    <div className="space-y-3 whitespace-pre-line text-base leading-relaxed text-[#0F2942]">
                      {result.simplifiedText}
                    </div>
                    <div className="border-t border-blue-100 pt-3">
                      <button
                        type="button"
                        onClick={() => setShowOriginal((prev) => !prev)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
                      >
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            showOriginal ? 'rotate-180' : ''
                          }`}
                          aria-hidden="true"
                        />
                        <span>
                          {showOriginal
                            ? 'Ẩn văn bản gốc'
                            : 'Xem lại văn bản gốc để đối chiếu'}
                        </span>
                      </button>
                      {showOriginal && (
                        <p className="mt-2 rounded-xl bg-white p-3.5 text-sm leading-relaxed text-slate-600 ring-1 ring-slate-200/70">
                          {result.originalText}
                        </p>
                      )}
                    </div>
                  </div>
                
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="mt-6 flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 rounded-full border border-blue-300 bg-white px-5 py-2.5 text-sm font-bold text-blue-600 transition-colors hover:bg-blue-50"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                <span>Thử lại</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
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
                onClick={handleDownload}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-700"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                <span>Tải xuống</span>
              </button>

              <SpeakButton text={activePlainText} label="Phát âm" />
            </div>
          </div>

          {/* Right Robot "Học tốt nhé!" Illustration */}
          <div className="overflow-hidden rounded-3xl border border-blue-100 bg-[#EFF6FF] shadow-card lg:col-span-5">
            <img
              src="/images/robot-goodjob.jpg"
              alt='Robot AI thân thiện giơ ngón tay cái cổ vũ với bảng chữ "Học tốt nhé!"'
              className="h-full min-h-[300px] w-full object-cover"
            />
          </div>
        </div>
      </div>
    );
  }

  // Input State View (Matches Screen 1)
  return (
    <div className="space-y-6 animate-fade-up">
      <PageBanner
        icon={
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
            <FileText className="h-7 w-7" aria-hidden="true" />
          </span>
        }
        title="Đơn giản hóa văn bản"
        subtitle="Chuyển đổi đoạn văn phức tạp thành cách diễn đạt dễ hiểu hơn!"
      />

      <div className="grid items-stretch gap-6 lg:grid-cols-12">
        {/* Left Column: Input Card */}
        <form
          onSubmit={handleProcess}
          className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card sm:p-8 lg:col-span-7"
        >
          <div className="space-y-5">
            <StepBadge step={1} label="Nhập hoặc dán văn bản của bạn" />

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">
                Mẫu thử nhanh:
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

            {/* Level Select Row */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <label
                htmlFor="simplification-level"
                className="text-sm font-semibold text-slate-600"
              >
                Mức độ đơn giản:
              </label>
              <div className="relative w-full sm:w-56">
                <select
                  id="simplification-level"
                  value={level}
                  onChange={(e) =>
                    {
                      const value = e.target.value;
                      if (value === 'de-hieu' || value === 'co-ban' || value === 'nang-cao') {
                        setLevel(value);
                      }
                    }
                  }
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm font-bold text-[#0F2942] shadow-sm transition-colors hover:border-blue-300"
                >
                  {LEVEL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                  aria-hidden="true"
                />
              </div>
            </div>

            {/* Textarea */}
            <div>
              <label htmlFor="simplify-textarea" className="sr-only">
                Đoạn văn bản cần đơn giản hóa
              </label>
              <textarea
                id="simplify-textarea"
                rows={7}
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="Ví dụ: Em hãy dán đoạn văn bản cần đơn giản hóa vào đây..."
                className="w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 text-base leading-relaxed text-[#0F2942] placeholder:text-slate-400 focus:border-blue-500"
              />
              <div className="mt-1.5 flex items-center justify-between text-xs">
                <span className="font-medium text-rose-600" role="alert">
                  {errorMessage}
                </span>
                <span className="font-medium text-slate-400">
                  {Array.from(inputText.trim()).length}/{MAX_CHARACTERS}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2.5 rounded-full bg-blue-600 px-8 py-3.5 text-base font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg"
            >
              <Sparkles className="h-5 w-5" aria-hidden="true" />
              <span>Xử lý bằng AI</span>
            </button>
          </div>
        </form>

        {/* Right Column: AI Helper Guidance Card */}
        <aside className="flex flex-col justify-between rounded-3xl border border-blue-100/80 bg-[#EFF6FF] p-6 shadow-card sm:p-8 lg:col-span-5">
          <div className="space-y-3">
            <h2 className="text-2xl font-extrabold leading-snug text-[#0F2942]">
              AI sẽ giúp bạn hiểu dễ hơn!
            </h2>
            <p className="text-base leading-relaxed text-slate-600">
              Diễn đạt đơn giản, giữ nguyên ý nghĩa.
            </p>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl bg-white/70 shadow-sm ring-1 ring-blue-100">
            <img
              src="/images/robot-reading.jpg"
              alt="Robot AI thân thiện đeo tai nghe đang đọc sách"
              className="h-60 w-full object-cover sm:h-64"
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

