import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { BookOpen, Search } from 'lucide-react';
import { ConceptIllustration } from '../components/ConceptIllustration';
import { PageBanner } from '../components/PageBanner';
import { SpeakButton } from '../components/SpeakButton';
import { StepBadge } from '../components/StepBadge';
import { QUICK_WORD_PRESETS, VOCABULARY_DICTIONARY } from '../data/mockData';
import type { ExplainApiData } from '../types/api';
import { explain, ApiErrorThrown } from '../api/edubridge';
import { stopSpeaking } from '../utils/speech';

const MAX_TERM_CHARACTERS = 100;

const ERROR_MESSAGES: Record<string, string> = {
  NETWORK_ERROR: 'Không kết nối được backend. Hãy kiểm tra server và kết nối mạng.',
  RATE_LIMITED: 'Bạn đã gửi quá nhiều yêu cầu. Hãy chờ một lát rồi thử lại.',
  AI_TIMEOUT: 'AI xử lý quá lâu. Bạn hãy thử lại sau.',
  AI_UNAVAILABLE: 'Dịch vụ AI tạm thời chưa sẵn sàng. Bạn hãy thử lại sau.',
  AI_CANNOT_PROCESS: 'AI chưa đủ cơ sở giải thích từ này. Hãy kiểm tra lại từ hoặc cụm từ.',
  AI_INVALID_RESPONSE: 'AI trả về kết quả chưa hợp lệ. Bạn hãy thử lại.',
  INVALID_RESPONSE: 'Phản hồi từ backend chưa đúng định dạng. Vui lòng thử lại.',
  CONFIG_ERROR: 'Chưa cấu hình đúng địa chỉ backend cho frontend.',
};

export function ExplainWordPage() {
  const [query, setQuery] = useState('công nghệ');
  const [isSearching, setIsSearching] = useState(false);
  // Không hiển thị định nghĩa mẫu trước khi người dùng gọi API.
  const [result, setResult] = useState<ExplainApiData | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const inFlight = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      stopSpeaking();
    };
  }, []);

  const runLookup = async (wordToSearch: string) => {
    if (inFlight.current) return;

    const trimmed = wordToSearch.trim();
    if (!trimmed) {
      setErrorMessage('Em hãy nhập từ hoặc cụm từ muốn tra cứu nhé!');
      return;
    }
    if (Array.from(trimmed).length > MAX_TERM_CHARACTERS) {
      setErrorMessage(`Từ hoặc cụm từ chỉ được tối đa ${MAX_TERM_CHARACTERS} ký tự.`);
      return;
    }

    stopSpeaking();
    setErrorMessage('');
    setResult(null);
    inFlight.current = true;
    setIsSearching(true);

    try {
      // Trang hiện chưa có ô ngữ cảnh nên chỉ gửi term.
      // explain() trả trực tiếp data, không phải envelope success/data/meta.
      const generated = await explain(trimmed);
      if (mounted.current) setResult(generated);
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
        setErrorMessage('Không thể tra cứu từ. Bạn hãy thử lại sau.');
      }
    } finally {
      inFlight.current = false;
      if (mounted.current) setIsSearching(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void runLookup(query);
  };

  const handleSelectPreset = (word: string) => {
    if (inFlight.current) return;
    setQuery(word);
    void runLookup(word);
  };

  // Từ điển local chỉ cung cấp hình minh họa; không lấy nghĩa hoặc ví dụ.
  const illustration = result
    ? VOCABULARY_DICTIONARY.find(
        (entry) => entry.word.trim().toLocaleLowerCase('vi') ===
          result.term.trim().toLocaleLowerCase('vi')
      )
    : undefined;

  return (
    <div className="space-y-6 animate-fade-up">
      <PageBanner
        icon={
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
            <BookOpen className="h-7 w-7" aria-hidden="true" />
          </span>
        }
        title="Giải thích từ khó"
        subtitle="Hiểu rõ nghĩa, dễ dàng ghi nhớ!"
      />

      <section className="space-y-4">
        <StepBadge step={1} label="Nhập từ hoặc cụm từ cần giải thích" />

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">
            Từ vựng mẫu:
          </span>
          {QUICK_WORD_PRESETS.map((presetWord) => (
            <button
              key={presetWord}
              type="button"
              disabled={isSearching}
              onClick={() => handleSelectPreset(presetWord)}
              className="rounded-full border border-blue-100 bg-blue-50/80 px-3.5 py-1 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-wait disabled:opacity-60"
            >
              {presetWord}
            </button>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <div className="flex-1">
            <label htmlFor="word-lookup-input" className="sr-only">
              Từ hoặc cụm từ cần giải thích
            </label>
            <input
              id="word-lookup-input"
              type="text"
              value={query}
              disabled={isSearching}
              aria-invalid={Boolean(errorMessage)}
              aria-describedby={errorMessage ? 'word-lookup-error' : undefined}
              onChange={(e) => {
                stopSpeaking();
                setQuery(e.target.value);
                setResult(null);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder='ví dụ: “công nghệ”'
              className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-base text-[#0F2942] shadow-sm placeholder:text-slate-400 focus:border-blue-500 disabled:opacity-70"
            />
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-3.5 text-base font-bold text-white shadow-md transition-all hover:bg-blue-700 disabled:cursor-wait disabled:opacity-70"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
            <span>{isSearching ? 'Đang tìm...' : 'Tra cứu'}</span>
          </button>
        </form>

        {errorMessage && (
          <p id="word-lookup-error" className="text-xs font-medium text-rose-600" role="alert">
            {errorMessage}
          </p>
        )}
      </section>

      <section
        aria-labelledby="lookup-result-heading"
        aria-busy={isSearching}
        className="space-y-4"
      >
        <h2
          id="lookup-result-heading"
          className="text-lg font-extrabold text-[#0F2942]"
        >
          Kết quả
        </h2>

        {isSearching ? (
          <div className="grid gap-6 md:grid-cols-12" role="status" aria-live="polite">
            <span className="sr-only">AI đang giải thích từ, vui lòng chờ.</span>
            <div className="space-y-4 rounded-3xl bg-[#EFF6FF] p-8 md:col-span-7">
              <div className="h-8 w-44 animate-pulse rounded-lg bg-blue-200/70" />
              <div className="h-4 w-full animate-pulse rounded-lg bg-blue-100" />
              <div className="h-4 w-10/12 animate-pulse rounded-lg bg-blue-100" />
              <div className="h-4 w-8/12 animate-pulse rounded-lg bg-blue-100" />
            </div>
            <div className="h-64 animate-pulse rounded-3xl bg-slate-200/70 md:col-span-5" />
          </div>
        ) : result ? (
          <div className="grid items-stretch gap-6 md:grid-cols-12">
            <div className="flex flex-col justify-between rounded-3xl border border-blue-100/80 bg-[#EFF6FF] p-6 shadow-card sm:p-8 md:col-span-7">
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-2xl font-extrabold tracking-tight text-[#0F2942] sm:text-3xl">
                    {result.term}
                  </h3>
                  <SpeakButton
                    variant="icon"
                    text={`${result.term}. Ý nghĩa: ${result.meaning}. Ví dụ: ${result.examples.join('. ')}`}
                  />
                </div>

                <div className="space-y-1.5">
                  <p className="text-sm font-extrabold text-[#0F2942] sm:text-base">
                    Ý nghĩa:
                  </p>
                  <p className="whitespace-pre-line text-base leading-relaxed text-slate-700">
                    {result.meaning}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <p className="text-sm font-extrabold text-[#0F2942] sm:text-base">
                    Ví dụ:
                  </p>
                  <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-slate-700">
                    {result.examples.map((example, index) => (
                      <li key={index} className="whitespace-pre-line">{example}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="md:col-span-5">
              {illustration ? (
                <ConceptIllustration
                  theme={illustration.visualTheme}
                  word={result.term}
                  imageUrl={illustration.imageUrl}
                />
              ) : (
                <div className="flex h-full min-h-64 flex-col items-center justify-center gap-4 rounded-3xl border border-blue-100 bg-[#EFF6FF] p-8 text-center shadow-card">
                  <BookOpen className="h-20 w-20 text-blue-500" aria-hidden="true" />
                  <p className="text-lg font-bold text-[#0F2942]">Học thêm một từ mới!</p>
                  <p className="text-sm text-slate-600">Đọc nghĩa và ví dụ để hiểu cách dùng từ.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="rounded-2xl border border-blue-100 bg-[#F8FBFF] p-5 text-sm text-slate-600">
            {errorMessage
              ? 'Chưa có kết quả. Bạn có thể điều chỉnh từ hoặc tra cứu lại.'
              : 'Nhập từ hoặc chọn từ vựng mẫu, rồi tra cứu để nhận lời giải thích từ AI.'}
          </p>
        )}
      </section>
    </div>
  );
}
