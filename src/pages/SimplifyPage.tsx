import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import {
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Cpu,
  Download,
  FileCheck2,
  FileText,
  Heart,
  Landmark,
  Leaf,
  Lightbulb,
  ListTodo,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { PageBanner } from '../components/PageBanner';
import { SpeakButton } from '../components/SpeakButton';
import { StepBadge } from '../components/StepBadge';
import { PRESET_LESSONS } from '../data/mockData';
import type {
  DifficultWordItem,
  LanguageLevel,
  SimplifyApiData,
  SummarizeApiData,
} from '../types/api';
import type { ResultSubTab, SimplificationLevel } from '../types/learning';
import {
  simplify,
  explainDifficultWords,
  summarize,
  ApiErrorThrown,
} from '../api/edubridge';
import { simulateSimplification, simulateSummary } from '../utils/aiSimulator';
import { stopSpeaking } from '../utils/speech';

const MAX_CHARACTERS = 5000;

interface PageResult extends SimplifyApiData {
  originalText: string;
  difficultWords?: DifficultWordItem[];
  summaryData?: SummarizeApiData;
}

const API_LEVELS: Record<SimplificationLevel, LanguageLevel> = {
  'de-hieu': 'basic',
  'co-ban': 'intermediate',
  'nang-cao': 'advanced',
};

const ERROR_MESSAGES: Record<string, string> = {
  NETWORK_ERROR: 'Không kết nối được backend. Đang sử dụng trợ lý mô phỏng.',
  RATE_LIMITED: 'Bạn đã gửi quá nhiều yêu cầu. Hãy chờ một lát rồi thử lại.',
  AI_TIMEOUT: 'AI xử lý quá lâu. Bạn hãy thử lại sau.',
  AI_UNAVAILABLE: 'Dịch vụ AI tạm thời chưa sẵn sàng. Bạn hãy thử lại sau.',
  AI_CANNOT_PROCESS: 'AI chưa thể xử lý nội dung này. Bạn hãy điều chỉnh văn bản.',
  AI_INVALID_RESPONSE: 'AI trả về kết quả chưa hợp lệ. Bạn hãy thử lại.',
  INVALID_RESPONSE: 'Phản hồi từ backend chưa đúng định dạng. Vui lòng thử lại.',
  CONFIG_ERROR: 'Chưa cấu hình đúng địa chỉ backend cho frontend.',
};

const LEVEL_OPTIONS: Array<{ value: SimplificationLevel; label: string }> = [
  { value: 'nang-cao', label: 'Nâng cao' },
  { value: 'co-ban', label: 'Trung bình' },
  { value: 'de-hieu', label: 'Cơ bản' },
];

const SUB_TABS: Array<{ id: ResultSubTab; label: string }> = [
  { id: 'simplified', label: 'Văn bản đơn giản hóa' },
  { id: 'vocabulary', label: 'Giải thích từ khóa' },
  { id: 'summary', label: 'Tóm tắt bài học' },
];

function getWordBadge(word: string) {
  const lower = word.toLowerCase();
  if (lower.includes('công nghệ') || lower.includes('máy') || lower.includes('số') || lower.includes('tri thức')) {
    return { icon: Cpu, label: 'Công nghệ', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
  }
  if (lower.includes('văn hóa') || lower.includes('truyền thống') || lower.includes('bản sắc') || lower.includes('thổ cẩm')) {
    return { icon: Sparkles, label: 'Văn hóa', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
  }
  if (lower.includes('quang hợp') || lower.includes('cây') || lower.includes('rừng') || lower.includes('sinh thái') || lower.includes('tự nhiên')) {
    return { icon: Leaf, label: 'Tự nhiên', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  }
  if (lower.includes('đoàn kết') || lower.includes('yêu thương') || lower.includes('đồng lòng')) {
    return { icon: Heart, label: 'Đoàn kết', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
  }
  if (lower.includes('di sản') || lower.includes('lịch sử') || lower.includes('điện biên') || lower.includes('chiến thắng')) {
    return { icon: Landmark, label: 'Lịch sử', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
  }
  return { icon: BookOpen, label: 'Từ vựng', bg: 'bg-slate-50 text-slate-700 border-slate-200' };
}

export function SimplifyPage() {
  const [inputText, setInputText] = useState('');
  const [level, setLevel] = useState<SimplificationLevel>('nang-cao');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<PageResult | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<ResultSubTab>('simplified');
  const [loadingSubTab, setLoadingSubTab] = useState(false);
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
    setActiveSubTab('simplified');
    setCopied(false);
    setShowOriginal(false);
    inFlight.current = true;
    setIsSubmitting(true);

    try {
      // Gọi song song cả 3 API: /api/simplify, /api/explain-difficult-word, /api/summarize
      const [simpRes, wordsRes, sumRes] = await Promise.allSettled([
        simplify(originalText, API_LEVELS[level]),
        explainDifficultWords(originalText),
        summarize(originalText),
      ]);

      if (!mounted.current) return;

      if (simpRes.status === 'fulfilled') {
        const wordsData =
          wordsRes.status === 'fulfilled' ? wordsRes.value.words : undefined;
        const sumData =
          sumRes.status === 'fulfilled' ? sumRes.value : undefined;

        setResult({
          ...simpRes.value,
          originalText,
          difficultWords: wordsData,
          summaryData: sumData,
        });
      } else {
        throw simpRes.reason;
      }
    } catch (error: unknown) {
      if (!mounted.current) return;
      // Fallback client nếu backend chưa bật hoặc lỗi mạng
      const fallback = simulateSimplification(originalText, level);
      setResult({
        simplifiedText: fallback.simplifiedText,
        level: API_LEVELS[level],
        originalText,
        difficultWords: fallback.extractedWords.map((w) => ({
          word: w.word,
          meaning: w.meaning,
          example: w.example,
        })),
        summaryData: {
          summary: fallback.summaryPoints.join(' '),
          keyPoints: fallback.summaryPoints,
        },
      });
      if (error instanceof ApiErrorThrown && error.code !== 'NETWORK_ERROR') {
        setErrorMessage(ERROR_MESSAGES[error.code] || error.message);
      }
    } finally {
      inFlight.current = false;
      if (mounted.current) setIsSubmitting(false);
    }
  };

  const handleSwitchSubTab = async (tabId: ResultSubTab) => {
    stopSpeaking();
    setActiveSubTab(tabId);
    if (!result) return;

    if (tabId === 'vocabulary' && !result.difficultWords) {
      setLoadingSubTab(true);
      try {
        const res = await explainDifficultWords(result.originalText);
        if (mounted.current && res.words && res.words.length > 0) {
          setResult((prev) => (prev ? { ...prev, difficultWords: res.words } : null));
        } else {
          throw new Error('Dữ liệu rỗng');
        }
      } catch {
        if (mounted.current) {
          const sim = simulateSimplification(result.originalText, level);
          setResult((prev) =>
            prev
              ? {
                  ...prev,
                  difficultWords: sim.extractedWords.map((w) => ({
                    word: w.word,
                    meaning: w.meaning,
                    example: w.example,
                  })),
                }
              : null
          );
        }
      } finally {
        if (mounted.current) setLoadingSubTab(false);
      }
    } else if (tabId === 'summary' && !result.summaryData) {
      setLoadingSubTab(true);
      try {
        const res = await summarize(result.originalText);
        if (mounted.current) {
          setResult((prev) => (prev ? { ...prev, summaryData: res } : null));
        }
      } catch {
        if (mounted.current) {
          const simSummary = simulateSummary(result.originalText);
          setResult((prev) =>
            prev
              ? {
                  ...prev,
                  summaryData: {
                    summary: simSummary.points.join(' '),
                    keyPoints: simSummary.points,
                  },
                }
              : null
          );
        }
      } finally {
        if (mounted.current) setLoadingSubTab(false);
      }
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

  const getActiveTabPlainText = (): string => {
    if (!result) return '';
    if (activeSubTab === 'simplified') {
      return result.simplifiedText.replace(/^\[(basic|intermediate|advanced)\]\s*/i, '');
    }
    if (activeSubTab === 'vocabulary') {
      if (!result.difficultWords || result.difficultWords.length === 0) return '';
      return result.difficultWords
        .map((w) => `${w.word}\n- Ý nghĩa: ${w.meaning}\n- Ví dụ: ${w.example}`)
        .join('\n\n');
    }
    if (activeSubTab === 'summary') {
      if (!result.summaryData) return '';
      return `${result.summaryData.summary}\n\nÝ chính:\n` +
        result.summaryData.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n');
    }
    return '';
  };

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
        `EDUBRIDGE AI - KẾT QUẢ HỌC TẬP (${activeSubTab.toUpperCase()})\n================================\n\n${content}\n`,
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

  // Result State View
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
          subtitle="Dưới đây là kết quả từ AI EduBridge:"
        />

        {/* 3 Sub-Tabs Pill Bar - CẢ 3 TAB ĐỀU BẤM ĐƯỢC */}
        <div
          role="tablist"
          aria-label="Chế độ xem kết quả AI"
          className="grid grid-cols-1 gap-2 rounded-3xl border border-slate-200/80 bg-white p-1.5 shadow-sm sm:grid-cols-3 sm:rounded-full"
        >
          {SUB_TABS.map((tab) => {
            const isActive = tab.id === activeSubTab;
            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => handleSwitchSubTab(tab.id)}
                className={`rounded-full px-5 py-3 text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
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
                      'Các từ khó được trích xuất và giải thích'}
                    {activeSubTab === 'summary' &&
                      'Bản tóm tắt và các ý chính của bài học'}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Bạn có thể nghe phát âm, sao chép, tải xuống hoặc thử lại nếu cần.
                  </p>
                </div>
              </div>

              {/* Tab Content Body */}
              <div className="rounded-2xl border border-blue-100 bg-[#F8FBFF] p-5">
                {loadingSubTab ? (
                  <div className="space-y-3 py-4" role="status">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-blue-200" />
                    <div className="h-4 w-5/6 animate-pulse rounded bg-blue-100" />
                    <div className="h-4 w-2/3 animate-pulse rounded bg-blue-100" />
                    <p className="text-xs text-blue-600">Đang phân tích dữ liệu...</p>
                  </div>
                ) : activeSubTab === 'simplified' ? (
                  <div className="space-y-4">
                    <div className="space-y-3 whitespace-pre-line text-base leading-relaxed text-[#0F2942]">
                      {result.simplifiedText.replace(/^\[(basic|intermediate|advanced)\]\s*/i, '')}
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
                          {showOriginal ? 'Ẩn văn bản gốc' : 'Xem lại văn bản gốc để đối chiếu'}
                        </span>
                      </button>
                      {showOriginal && (
                        <p className="mt-2 rounded-xl bg-white p-3.5 text-sm leading-relaxed text-slate-600 ring-1 ring-slate-200/70">
                          {result.originalText}
                        </p>
                      )}
                    </div>
                  </div>
                ) : activeSubTab === 'vocabulary' ? (
                  result.difficultWords && result.difficultWords.length > 0 ? (
                    <ul className="space-y-4">
                      {result.difficultWords.map((item, index) => {
                        const badge = getWordBadge(item.word);
                        const IconComponent = badge.icon;
                        return (
                          <li
                            key={index}
                            className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition-all hover:border-blue-200 hover:shadow-md"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex flex-wrap items-center gap-2.5">
                                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${badge.bg}`}>
                                  <IconComponent className="h-3.5 w-3.5" aria-hidden="true" />
                                  <span>{badge.label}</span>
                                </span>
                                <h3 className="text-lg font-extrabold text-blue-900">
                                  {item.word}
                                </h3>
                              </div>
                              <SpeakButton
                                variant="icon"
                                text={`${item.word}. Ý nghĩa: ${item.meaning}. Ví dụ: ${item.example}`}
                                className="h-9 w-9"
                              />
                            </div>
                            <p className="mt-3 text-sm leading-relaxed text-slate-700">
                              <strong className="text-[#0F2942]">Ý nghĩa: </strong>
                              {item.meaning}
                            </p>
                            <div className="mt-2.5 rounded-xl bg-blue-50/70 p-3 text-xs leading-relaxed text-slate-600 border border-blue-100/60">
                              <strong className="text-blue-900">Ví dụ câu: </strong>
                              {item.example}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-600">
                      Không tìm thấy từ khó đặc biệt trong đoạn văn này, ngôn từ khá trong sáng và dễ hiểu!
                    </p>
                  )
                ) : activeSubTab === 'summary' ? (
                  result.summaryData ? (
                    <div className="space-y-4">
                      <div className="rounded-xl bg-white p-4 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-500">Tóm lược tổng quan:</h3>
                        <p className="mt-1 text-base leading-relaxed text-[#0F2942]">
                          {result.summaryData.summary}
                        </p>
                      </div>

                      <div>
                        <h3 className="mb-2 text-sm font-bold text-slate-500">Các ý chính cần ghi nhớ:</h3>
                        <ul className="space-y-2.5">
                          {result.summaryData.keyPoints.map((point, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600">Chưa có tóm tắt bài học.</p>
                  )
                ) : null}
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
                disabled={!activePlainText}
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50"
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
                disabled={!activePlainText}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-50"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                <span>Tải xuống</span>
              </button>

              {activePlainText && (
                <SpeakButton text={activePlainText} label="Phát âm" />
              )}
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
                  disabled={isSubmitting}
                  onClick={() => handleSelectPreset(preset.text)}
                  className="rounded-full border border-blue-100 bg-blue-50/70 px-3.5 py-1 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-wait disabled:opacity-60"
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
                  disabled={isSubmitting}
                  onChange={(e) =>
                    setLevel(e.target.value as SimplificationLevel)
                  }
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm font-bold text-[#0F2942] shadow-sm transition-colors hover:border-blue-300 disabled:opacity-60"
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
                disabled={isSubmitting}
                aria-invalid={Boolean(errorMessage)}
                aria-describedby={errorMessage ? 'simplify-error' : undefined}
                onChange={(e) => {
                  setInputText(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="Ví dụ: Em hãy dán đoạn văn bản cần đơn giản hóa vào đây..."
                className="w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 text-base leading-relaxed text-[#0F2942] placeholder:text-slate-400 focus:border-blue-500 disabled:opacity-70"
              />
              <div className="mt-1.5 flex items-center justify-between text-xs">
                <span id="simplify-error" className="font-medium text-rose-600" role="alert">
                  {errorMessage}
                </span>
                <span className="font-medium text-slate-400">
                  {Array.from(inputText).length}/{MAX_CHARACTERS}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2.5 rounded-full bg-blue-600 px-8 py-3.5 text-base font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg disabled:cursor-wait disabled:opacity-70"
            >
              <Sparkles className="h-5 w-5" aria-hidden="true" />
              <span>{isSubmitting ? 'Đang xử lý...' : 'Xử lý bằng AI'}</span>
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
