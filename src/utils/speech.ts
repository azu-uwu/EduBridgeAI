export type SpeechErrorReason = 'UNSUPPORTED' | 'NO_VIETNAMESE_VOICE' | 'PLAYBACK_FAILED';

export interface SpeakCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (reason: SpeechErrorReason) => void;
}

export const VOICE_STANDARD_ID = 'cloud-vi-standard';
export const VOICE_SLOW_ID = 'cloud-vi-slow';
export const VOICE_WARM_ID = 'cloud-vi-warm';
const PREFERRED_VOICE_KEY = 'edubridge_preferred_vi_voice';

let activeSessionId = 0;
let persistentAudioPlayer: HTMLAudioElement | null = null;

function getAudioPlayer(): HTMLAudioElement {
  if (!persistentAudioPlayer) {
    persistentAudioPlayer = new Audio();
  }
  return persistentAudioPlayer;
}

export function isSpeechSupported(): boolean {
  return true;
}

function isVietnameseVoice(voice: SpeechSynthesisVoice): boolean {
  const lang = voice.lang.trim().toLowerCase();
  const name = voice.name.trim().toLowerCase();
  return (
    /^vi([-_]|$)/.test(lang) ||
    name.includes('vietnam') ||
    name.includes('tiếng việt') ||
    name.includes('tieng viet') ||
    name.includes('hoaimy') ||
    name.includes('hoài my') ||
    name.includes('namminh') ||
    name.includes('nam minh')
  );
}

function isEdgeNaturalVoice(voice: SpeechSynthesisVoice): boolean {
  const name = voice.name.toLowerCase();
  return (
    name.includes('hoaimy') ||
    name.includes('hoài my') ||
    name.includes('namminh') ||
    name.includes('nam minh') ||
    (name.includes('natural') && isVietnameseVoice(voice))
  );
}

/**
 * Luôn cung cấp đầy đủ các tùy chọn giọng đọc phong phú cho cả Chrome, Cốc Cốc, Edge, Firefox
 */
export function getVietnameseVoices(): Array<{ voiceURI: string; name: string }> {
  const options: Array<{ voiceURI: string; name: string }> = [
    {
      voiceURI: VOICE_STANDARD_ID,
      name: 'Giọng Nữ Chuẩn (Tự nhiên • AI)',
    },
    {
      voiceURI: VOICE_SLOW_ID,
      name: 'Giọng Đọc Chậm (Rõ chữ • Cho học sinh)',
    },
    {
      voiceURI: VOICE_WARM_ID,
      name: 'Giọng Nam Trầm Ấm (Dễ nghe • AI)',
    },
  ];

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const rawVoices = window.speechSynthesis.getVoices().filter(isVietnameseVoice);
    for (const v of rawVoices) {
      if (isEdgeNaturalVoice(v)) {
        options.push({
          voiceURI: v.voiceURI,
          name: formatVoiceLabel(v),
        });
      } else if (v.name.toLowerCase().includes('google')) {
        options.push({
          voiceURI: v.voiceURI,
          name: 'Google Tiếng Việt (Trình duyệt)',
        });
      }
    }
  }

  return options;
}

export function getSavedPreferredVoiceURI(): string {
  try {
    return window.localStorage.getItem(PREFERRED_VOICE_KEY) || VOICE_STANDARD_ID;
  } catch {
    return VOICE_STANDARD_ID;
  }
}

export function savePreferredVoiceURI(voiceURI: string): void {
  try {
    window.localStorage.setItem(PREFERRED_VOICE_KEY, voiceURI);
  } catch {
    // Bỏ qua lỗi storage
  }
}

export function formatVoiceLabel(voice: SpeechSynthesisVoice | { name: string }): string {
  const lower = voice.name.toLowerCase();
  if (lower.includes('hoaimy')) return 'Microsoft Hoài My (Nữ • Edge)';
  if (lower.includes('namminh')) return 'Microsoft Nam Minh (Nam • Edge)';
  if (lower.includes('google')) return 'Google Tiếng Việt';
  return voice.name.replace(/\s*-\s*Vietnamese.*$/i, '').trim();
}

export async function waitForVoices(timeoutMs = 500): Promise<void> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  const immediate = window.speechSynthesis.getVoices();
  if (immediate.length > 0 && immediate.some(isVietnameseVoice)) {
    return;
  }

  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
      window.clearInterval(pollTimer);
      window.clearTimeout(maxTimer);
      resolve();
    };

    const onVoicesChanged = () => {
      const loaded = window.speechSynthesis.getVoices();
      if (loaded.length > 0) finish();
    };

    window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
    const pollTimer = window.setInterval(() => {
      const loaded = window.speechSynthesis.getVoices();
      if (loaded.length > 0 && loaded.some(isVietnameseVoice)) finish();
    }, 100);
    const maxTimer = window.setTimeout(finish, timeoutMs);
  });
}

export function chunkVietnameseText(rawText: string, maxLength = 85): string[] {
  const cleaned = rawText.replace(/\s+/g, ' ').trim();
  if (!cleaned) return [];

  const sentences = cleaned
    .split(/(?<=[.!?\n;])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  const chunks: string[] = [];

  for (const sentence of sentences) {
    if (sentence.length <= maxLength) {
      chunks.push(sentence);
      continue;
    }

    const clauses = sentence.split(/,\s+/).map((c) => c.trim()).filter(Boolean);
    let buffer = '';

    for (const clause of clauses) {
      const candidate = buffer ? `${buffer}, ${clause}` : clause;
      if (candidate.length > maxLength && buffer) {
        chunks.push(buffer);
        buffer = clause;
      } else {
        buffer = candidate;
      }
    }
    if (buffer) {
      if (buffer.length > maxLength) {
        const words = buffer.split(' ');
        let wordBuffer = '';
        for (const w of words) {
          const nextWord = wordBuffer ? `${wordBuffer} ${w}` : w;
          if (nextWord.length > maxLength && wordBuffer) {
            chunks.push(wordBuffer);
            wordBuffer = w;
          } else {
            wordBuffer = nextWord;
          }
        }
        if (wordBuffer) chunks.push(wordBuffer);
      } else {
        chunks.push(buffer);
      }
    }
  }

  return chunks;
}

export function stopSpeaking(): void {
  activeSessionId += 1;
  if (persistentAudioPlayer) {
    try {
      persistentAudioPlayer.pause();
      persistentAudioPlayer.currentTime = 0;
      persistentAudioPlayer.onended = null;
      persistentAudioPlayer.onerror = null;
    } catch {
      // Ignore
    }
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore
    }
  }
}

/**
 * Phát âm tiếng Việt:
 * 1. Gọi stopSpeaking() trước để dừng bất kỳ phiên phát trước đó và tăng activeSessionId.
 * 2. Lấy sessionId hiện thời để đối chiếu.
 * 3. Phát mượt mà qua HTML5 Audio Stream hoặc Web Speech API.
 */
export async function speakVietnamese(
  text: string,
  callbacks?: SpeakCallbacks,
  preferredVoiceURI?: string
): Promise<boolean> {
  if (!text.trim()) {
    callbacks?.onError?.('UNSUPPORTED');
    return false;
  }

  // Dừng mọi âm thanh đang phát trước đó
  stopSpeaking();
  // Lấy session ID mới SAU KHI đã dừng
  const sessionId = activeSessionId;

  const chunks = chunkVietnameseText(text);
  if (chunks.length === 0) {
    callbacks?.onEnd?.();
    return false;
  }

  const requestedURI = preferredVoiceURI || getSavedPreferredVoiceURI();

  // Hàm phát thông qua Audio Stream của backend
  const playViaAudioStream = (startIndex = 0) => {
    callbacks?.onStart?.();
    const player = getAudioPlayer();

    let playbackRate = 1.0;
    let speedParam = '';
    if (requestedURI === VOICE_SLOW_ID) {
      playbackRate = 0.88;
      speedParam = '&speed=slow';
    } else if (requestedURI === VOICE_WARM_ID) {
      playbackRate = 0.93;
    }

    const playNext = (index: number) => {
      if (sessionId !== activeSessionId) return;

      if (index >= chunks.length) {
        callbacks?.onEnd?.();
        return;
      }

      const baseUrl = (
        import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
      )
        .trim()
        .replace(/\/+$/, '');

      const ttsUrl = `${baseUrl}/api/tts?text=${encodeURIComponent(chunks[index])}${speedParam}`;

      player.src = ttsUrl;
      player.playbackRate = playbackRate;

      player.onended = () => {
        if (sessionId !== activeSessionId) return;
        playNext(index + 1);
      };

      player.onerror = () => {
        if (sessionId !== activeSessionId) return;
        callbacks?.onError?.('PLAYBACK_FAILED');
      };

      player.play().catch(() => {
        if (sessionId !== activeSessionId) return;
        callbacks?.onError?.('PLAYBACK_FAILED');
      });
    };

    playNext(startIndex);
  };

  // Nếu người dùng chọn giọng cục bộ của Edge hoặc Chrome và trình duyệt có hỗ trợ
  const isCloudVoice =
    requestedURI === VOICE_STANDARD_ID ||
    requestedURI === VOICE_SLOW_ID ||
    requestedURI === VOICE_WARM_ID;

  if (!isCloudVoice && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    await waitForVoices();
    if (sessionId !== activeSessionId) return false;

    const viVoices = window.speechSynthesis.getVoices().filter(isVietnameseVoice);
    const matchedVoice = viVoices.find((v) => v.voiceURI === requestedURI);

    if (matchedVoice) {
      callbacks?.onStart?.();

      const speakChunkAt = (index: number) => {
        if (sessionId !== activeSessionId) return;

        if (index >= chunks.length) {
          callbacks?.onEnd?.();
          return;
        }

        const utterance = new SpeechSynthesisUtterance(chunks[index]);
        utterance.voice = matchedVoice;
        utterance.lang = matchedVoice.lang || 'vi-VN';
        utterance.rate = 0.95;
        utterance.pitch = 1;

        let hasStarted = false;
        utterance.onstart = () => {
          hasStarted = true;
        };

        utterance.onend = () => {
          if (sessionId !== activeSessionId) return;
          speakChunkAt(index + 1);
        };

        utterance.onerror = (event) => {
          if (sessionId !== activeSessionId) return;
          if (event.error === 'canceled' || event.error === 'interrupted') {
            callbacks?.onEnd?.();
          } else {
            playViaAudioStream(index);
          }
        };

        // Watchdog: Nếu trong 1200ms không chạy, fallback sang Audio Stream
        setTimeout(() => {
          if (sessionId === activeSessionId && !hasStarted && window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            playViaAudioStream(index);
          }
        }, 1200);

        window.speechSynthesis.speak(utterance);
      };

      speakChunkAt(0);
      return true;
    }
  }

  // Mặc định hoặc người dùng chọn giọng AI Chuẩn: Phát ngay qua Audio Stream
  playViaAudioStream(0);
  return true;
}
