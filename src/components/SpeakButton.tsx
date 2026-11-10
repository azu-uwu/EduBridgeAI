import { useEffect, useState } from 'react';
import { ChevronDown, Info, Square, Volume2 } from 'lucide-react';
import {
  formatVoiceLabel,
  getSavedPreferredVoiceURI,
  getVietnameseVoices,
  isSpeechSupported,
  savePreferredVoiceURI,
  SpeechErrorReason,
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
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [errorReason, setErrorReason] = useState<SpeechErrorReason | null>(null);
  const supported = isSpeechSupported();

  useEffect(() => {
    if (!supported) return;

    let mounted = true;
    const syncVoices = () => {
      const viVoices = getVietnameseVoices();
      if (!mounted) return;
      setVoices(viVoices);
      setVoicesLoaded(true);
      if (viVoices.length > 0) {
        const saved = getSavedPreferredVoiceURI();
        const validSaved = viVoices.find((v) => v.voiceURI === saved);
        setSelectedVoiceURI(validSaved ? validSaved.voiceURI : viVoices[0].voiceURI);
        setErrorReason(null);
      }
    };

    syncVoices();
    waitForVoices().then(syncVoices);
    window.speechSynthesis.addEventListener('voiceschanged', syncVoices);

    return () => {
      mounted = false;
      window.speechSynthesis.removeEventListener('voiceschanged', syncVoices);
      stopSpeaking();
    };
  }, [supported]);

  const handleToggleSpeak = async () => {
    if (!supported) {
      setErrorReason('UNSUPPORTED');
      return;
    }

    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    setErrorReason(null);
    await speakVietnamese(
      text,
      {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: (reason) => {
          setIsSpeaking(false);
          setErrorReason(reason);
        },
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

  const noVietnameseVoice = voicesLoaded && voices.length === 0;

  if (variant === 'icon') {
    return (
      <div className="flex flex-col items-end gap-1.5">
        <button
          type="button"
          onClick={handleToggleSpeak}
          disabled={!supported}
          title={
            noVietnameseVoice
              ? 'Chưa tìm thấy giọng đọc tiếng Việt trên trình duyệt'
              : isSpeaking
                ? 'Dừng đọc'
                : 'Nghe phát âm giọng tiếng Việt'
          }
          aria-label={isSpeaking ? 'Dừng phát âm' : 'Nghe phát âm tiếng Việt'}
          className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full transition-all ${
            isSpeaking
              ? 'animate-pulse bg-blue-600 text-white shadow-md'
              : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
          } disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        >
          {isSpeaking ? (
            <Square className="h-4 w-4 fill-current" aria-hidden="true" />
          ) : (
            <Volume2 className="h-5 w-5" aria-hidden="true" />
          )}
        </button>

        {errorReason === 'NO_VIETNAMESE_VOICE' && (
          <p className="max-w-[230px] rounded-xl bg-amber-50 px-3 py-1.5 text-right text-[11px] font-medium leading-snug text-amber-800 ring-1 ring-amber-200">
            Trình duyệt chưa có giọng tiếng Việt. Hãy dùng <strong>Microsoft Edge</strong> để nghe giọng Hoài My / Nam Minh chuẩn Việt Nam.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleToggleSpeak}
        disabled={!supported}
        aria-label={isSpeaking ? 'Dừng đọc' : `${label} bằng tiếng Việt`}
        className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
          isSpeaking
            ? 'bg-amber-500 text-white shadow-sm hover:bg-amber-600'
            : 'border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
        } disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
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
            {voices.map((voice) => (
              <option key={voice.voiceURI} value={voice.voiceURI}>
                {formatVoiceLabel(voice)}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
        </div>
      )}

      {errorReason === 'NO_VIETNAMESE_VOICE' && (
        <div
          role="status"
          className="mt-1 flex w-full items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs leading-relaxed text-amber-900"
        >
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" aria-hidden="true" />
          <span>
            Máy hoặc trình duyệt này chưa cài giọng đọc tiếng Việt (nên hệ thống không đọc bằng giọng tiếng Anh). Bạn hãy mở bằng <strong>Microsoft Edge</strong> (có sẵn giọng nữ <strong>Hoài My</strong> / nam <strong>Nam Minh</strong> tiếng Việt tự nhiên) hoặc bật gói ngôn ngữ <em>Tiếng Việt</em> trong cài đặt Windows nhé!
          </span>
        </div>
      )}
    </div>
  );
}
