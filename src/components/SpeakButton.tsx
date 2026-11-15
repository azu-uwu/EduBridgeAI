import { useEffect, useState } from 'react';
import { ChevronDown, Square, Volume2 } from 'lucide-react';
import {
  getSavedPreferredVoiceURI,
  getVietnameseVoices,
  savePreferredVoiceURI,
  speakVietnamese,
  stopSpeaking,
  waitForVoices,
} from '../utils/speech';

interface SpeakButtonProps {
  text: string;
  variant?: 'icon' | 'pill';
  label?: string;
  className?: string;
}

export function SpeakButton({
  text,
  variant = 'pill',
  label = 'Phát âm',
  className = '',
}: SpeakButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<Array<{ voiceURI: string; name: string }>>(() =>
    getVietnameseVoices()
  );
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>(() =>
    getSavedPreferredVoiceURI()
  );

  useEffect(() => {
    let mounted = true;
    const syncVoices = () => {
      const viVoices = getVietnameseVoices();
      if (!mounted) return;
      setVoices(viVoices);
      if (viVoices.length > 0) {
        const saved = getSavedPreferredVoiceURI();
        const validSaved = viVoices.find((v) => v.voiceURI === saved);
        setSelectedVoiceURI(validSaved ? validSaved.voiceURI : viVoices[0].voiceURI);
      }
    };

    syncVoices();
    waitForVoices().then(syncVoices);

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.addEventListener('voiceschanged', syncVoices);
    }

    return () => {
      mounted = false;
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.removeEventListener('voiceschanged', syncVoices);
      }
      stopSpeaking();
    };
  }, []);

  const handleToggleSpeak = async () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    await speakVietnamese(
      text,
      {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      },
      selectedVoiceURI || undefined
    );
  };

  const handleVoiceChange = (voiceURI: string) => {
    setSelectedVoiceURI(voiceURI);
    savePreferredVoiceURI(voiceURI);
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    }
  };

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleToggleSpeak}
        title={isSpeaking ? 'Dừng đọc' : 'Nghe phát âm tiếng Việt'}
        aria-label={isSpeaking ? 'Dừng phát âm' : 'Nghe phát âm tiếng Việt'}
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-all ${
          isSpeaking
            ? 'animate-pulse bg-blue-600 text-white shadow-md'
            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
        } ${className}`}
      >
        {isSpeaking ? (
          <Square className="h-4 w-4 fill-current" aria-hidden="true" />
        ) : (
          <Volume2 className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleToggleSpeak}
        aria-label={isSpeaking ? 'Dừng đọc' : `${label} bằng tiếng Việt`}
        className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
          isSpeaking
            ? 'bg-amber-500 text-white shadow-sm hover:bg-amber-600'
            : 'border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
        } ${className}`}
      >
        {isSpeaking ? (
          <>
            <Square className="h-4 w-4 fill-current" aria-hidden="true" />
            <span>Đang đọc...</span>
          </>
        ) : (
          <>
            <Volume2 className="h-4 w-4" aria-hidden="true" />
            <span>{label}</span>
          </>
        )}
      </button>

      {voices.length > 1 && (
        <div className="relative">
          <label htmlFor="vi-voice-select" className="sr-only">
            Chọn giọng đọc tiếng Việt
          </label>
          <select
            id="vi-voice-select"
            value={selectedVoiceURI}
            onChange={(e) => handleVoiceChange(e.target.value)}
            className="appearance-none rounded-full border border-slate-200 bg-white py-2 pl-3.5 pr-8 text-xs font-semibold text-slate-600 shadow-sm hover:border-blue-300"
          >
            {voices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
}
