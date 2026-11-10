import { useState } from 'react';
import { BookOpen, Search } from 'lucide-react';
import { ConceptIllustration } from '../components/ConceptIllustration';
import { PageBanner } from '../components/PageBanner';
import { SpeakButton } from '../components/SpeakButton';
import { StepBadge } from '../components/StepBadge';
import { QUICK_WORD_PRESETS, VOCABULARY_DICTIONARY } from '../data/mockData';
import { VocabularyEntry } from '../types/learning';
import { simulateWordLookup } from '../utils/aiSimulator';
import { stopSpeaking } from '../utils/speech';

export function ExplainWordPage() {
  const [query, setQuery] = useState('công nghệ');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<VocabularyEntry>(
    VOCABULARY_DICTIONARY[0]
  );
  const [errorMessage, setErrorMessage] = useState('');

  const runLookup = (wordToSearch: string) => {
    const trimmed = wordToSearch.trim();
    if (!trimmed) {
      setErrorMessage('Em hãy nhập từ hoặc cụm từ muốn tra cứu nhé!');
      return;
    }

    stopSpeaking();
    setErrorMessage('');
    setIsSearching(true);

    window.setTimeout(() => {
      const found = simulateWordLookup(trimmed);
      setResult(found);
      setIsSearching(false);
    }, 800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runLookup(query);
  };

  const handleSelectPreset = (word: string) => {
    setQuery(word);
    runLookup(word);
  };

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

      {/* Search Card / Section */}
      <section className="space-y-4">
        <StepBadge step={1} label="Nhập từ hoặc cụm từ cần giải thích" />

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">
            Từ vựng mẫu:
          </span>
          {QUICK_WORD_PRESETS.map((presetWord) => (
            <button
              key={presetWord}
              type="button"
              onClick={() => handleSelectPreset(presetWord)}
              className="rounded-full border border-blue-100 bg-blue-50/80 px-3.5 py-1 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100"
            >
              {presetWord}
            </button>
          ))}
        </div>

        {/* Search Input + Button */}
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
              onChange={(e) => {
                setQuery(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder='ví dụ: “công nghệ”'
              className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-base text-[#0F2942] shadow-sm placeholder:text-slate-400 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-3.5 text-base font-bold text-white shadow-md transition-all hover:bg-blue-700 disabled:opacity-70"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
            <span>{isSearching ? 'Đang tìm...' : 'Tra cứu'}</span>
          </button>
        </form>

        {errorMessage && (
          <p className="text-xs font-medium text-rose-600" role="alert">
            {errorMessage}
          </p>
        )}
      </section>

      {/* Results Section */}
      <section aria-labelledby="lookup-result-heading" className="space-y-4">
        <h2
          id="lookup-result-heading"
          className="text-lg font-extrabold text-[#0F2942]"
        >
          Kết quả
        </h2>

        {isSearching ? (
          <div className="grid gap-6 md:grid-cols-12">
            <div className="space-y-4 rounded-3xl bg-[#EFF6FF] p-8 md:col-span-7">
              <div className="h-8 w-44 animate-pulse rounded-lg bg-blue-200/70" />
              <div className="h-4 w-full animate-pulse rounded-lg bg-blue-100" />
              <div className="h-4 w-10/12 animate-pulse rounded-lg bg-blue-100" />
              <div className="h-4 w-8/12 animate-pulse rounded-lg bg-blue-100" />
            </div>
            <div className="h-64 animate-pulse rounded-3xl bg-slate-200/70 md:col-span-5" />
          </div>
        ) : (
          <div className="grid items-stretch gap-6 md:grid-cols-12">
            {/* Left Card: Word Definition & Example */}
            <div className="flex flex-col justify-between rounded-3xl border border-blue-100/80 bg-[#EFF6FF] p-6 shadow-card sm:p-8 md:col-span-7">
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-2xl font-extrabold tracking-tight text-[#0F2942] sm:text-3xl">
                    {result.word}
                  </h3>
                  <SpeakButton
                    variant="icon"
                    text={`${result.word}. Ý nghĩa: ${result.meaning}. Ví dụ: ${result.example}`}
                  />
                </div>

                <div className="space-y-1.5">
                  <p className="text-sm font-extrabold text-[#0F2942] sm:text-base">
                    Ý nghĩa:
                  </p>
                  <p className="text-base leading-relaxed text-slate-700">
                    {result.meaning}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <p className="text-sm font-extrabold text-[#0F2942] sm:text-base">
                    Ví dụ:
                  </p>
                  <p className="text-base leading-relaxed text-slate-700">
                    {result.example}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Card: Concept Visual */}
            <div className="md:col-span-5">
              <ConceptIllustration
                theme={result.visualTheme}
                word={result.word}
                imageUrl={result.imageUrl}
              />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

