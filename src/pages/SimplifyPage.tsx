import { useState } from 'react';
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
  FileCheck2,
  FileText,
  Lightbulb,
  ListTodo,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { PageBanner } from '../components/PageBanner';
import { SpeakButton } from '../components/SpeakButton';
import { StepBadge } from '../components/StepBadge';
import { PRESET_LESSONS } from '../data/mockData';
import {
  ResultSubTab,
  SimplificationLevel,
  SimplifyResult,
} from '../types/learning';
import { simulateSimplification } from '../utils/aiSimulator';
import { stopSpeaking } from '../utils/speech';

const MAX_CHARACTERS = 2000;

const LEVEL_OPTIONS: Array<{ value: SimplificationLevel; label: string }> = [
  { value: 'de-hieu', label: 'Dễ hiểu' },
  { value: 'co-ban', label: 'Cơ bản' },
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
  const [result, setResult] = useState<SimplifyResult | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<ResultSubTab>('simplified');
  const [showOriginal, setShowOriginal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSelectPreset = (presetText: string) => {
    setInputText(presetText.slice(0, MAX_CHARACTERS));
    setErrorMessage('');
  };

  const handleProcess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) {
      setErrorMessage('Em hãy nhập hoặc chọn một đoạn văn bản mẫu trước nhé!');
      return;
    }

    stopSpeaking();
    setErrorMessage('');
    setIsSubmitting(true);

    window.setTimeout(() => {
      const generated = simulateSimplification(inputText, level);
      setResult(generated);
      setActiveSubTab('simplified');
      setIsSubmitting(false);
    }, 800);
  };

  const handleReset = () => {
    stopSpeaking();
    setResult(null);
    setShowOriginal(false);
    setCopied(false);
  };

  const getActiveTabPlainText = (): string => {
    if (!result) return '';
    if (activeSubTab === 'simplified') {
      return result.simplifiedText;
    }
    if (activeSubTab === 'vocabulary') {
      return result.extractedWords
        .map(
          (item) =>
            `${item.word}\n- Ý nghĩa: ${item.meaning}\n- Ví dụ: ${item.example}`
        )
        .join('\n\n');
    }
    return result.summaryPoints.map((pt, idx) => `${idx + 1}. ${pt}`).join('\n');
  };

  const handleCopy = async () => {
    const content = getActiveTabPlainText();
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
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
    link.download = `edubridge-${activeSubTab}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Loading Skeleton View
  if (isSubmitting) {
    return (
      <div className="space-y-6 animate-fade-up">
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
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => {
                  stopSpeaking();
                  setActiveSubTab(tab.id);
                }}
                className={`rounded-full px-5 py-3 text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-[#0F2942] hover:bg-blue-50/70'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Result Split Layout */}
        <div className="grid items-stretch gap-6 lg:grid-cols-12">
          {/* Left Result Content Card */}
          <div className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card sm:p-8 lg:col-span-7">
            <div className="space-y-5">
              {/* Header inside result card */}
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  {activeSubTab === 'simplified' && (
                    <FileCheck2 className="h-6 w-6 text-emerald-600" aria-hidden="true" />
                  )}
                  {activeSubTab === 'vocabulary' && (
                    <Lightbulb className="h-6 w-6 text-amber-500" aria-hidden="true" />
                  )}
                  {activeSubTab === 'summary' && (
                    <ListTodo className="h-6 w-6 text-purple-600" aria-hidden="true" />
                  )}
                </span>
                <div>
                  <h2 className="text-xl font-extrabold leading-snug text-[#0F2942]">
                    {activeSubTab === 'simplified' &&
                      'Văn bản đã được đơn giản hóa thành công!'}
                    {activeSubTab === 'vocabulary' &&
                      'Các từ khó được giải thích dễ hiểu'}
                    {activeSubTab === 'summary' &&
                      'Các ý chính của bài học'}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Bạn có thể nghe phát âm, sao chép, tải xuống hoặc thử lại nếu
                    cần.
                  </p>
                </div>
              </div>

              {/* Tab Content Body */}
              <div className="rounded-2xl border border-blue-100 bg-[#F8FBFF] p-5">
                {activeSubTab === 'simplified' && (
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
                )}

                {activeSubTab === 'vocabulary' && (
                  <ul className="space-y-4">
                    {result.extractedWords.map((entry) => (
                      <li
                        key={entry.word}
                        className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-base font-extrabold text-blue-700">
                            {entry.word}
                          </h3>
                          <SpeakButton
                            variant="icon"
                            text={`${entry.word}. Ý nghĩa: ${entry.meaning}. Ví dụ: ${entry.example}`}
                            className="h-9 w-9"
                          />
                        </div>
                        <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
                          <span className="font-bold text-[#0F2942]">
                            Ý nghĩa:{' '}
                          </span>
                          {entry.meaning}
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-slate-600">
                          <span className="font-bold text-[#0F2942]">
                            Ví dụ:{' '}
                          </span>
                          {entry.example}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}

                {activeSubTab === 'summary' && (
                  <ul className="space-y-3">
                    {result.summaryPoints.map((point, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 text-base leading-relaxed text-[#0F2942]"
                      >
                        <CheckCircle2
                          className="mt-1 h-5 w-5 flex-shrink-0 text-emerald-500"
                          aria-hidden="true"
                        />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                )}
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
                    setLevel(e.target.value as SimplificationLevel)
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
                maxLength={MAX_CHARACTERS}
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
                  {inputText.length}/{MAX_CHARACTERS}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex justify-center">
            <button
              type="submit"
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

