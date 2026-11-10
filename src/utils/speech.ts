export type SpeechErrorReason = 'UNSUPPORTED' | 'NO_VIETNAMESE_VOICE' | 'PLAYBACK_FAILED';

export interface SpeakCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (reason: SpeechErrorReason) => void;
}

const PREFERRED_VOICE_KEY = 'edubridge_preferred_vi_voice';

let activeSessionId = 0;

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
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

function scoreVietnameseVoice(voice: SpeechSynthesisVoice): number {
  const name = voice.name.toLowerCase();
  const lang = voice.lang.toLowerCase();
  let score = 0;

  if (name.includes('natural') || name.includes('online')) score += 100;
  if (name.includes('hoaimy') || name.includes('namminh')) score += 60;
  if (name.includes('google')) score += 50;
  if (name.includes('linh') || name.includes('an ')) score += 35;
  if (lang === 'vi-vn' || lang === 'vi_vn') score += 25;
  if (!voice.localService) score += 10;
  if (name.includes('espeak')) score -= 30;

  return score;
}

export function getVietnameseVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechSupported()) return [];
  const voices = window.speechSynthesis.getVoices();
  return voices
    .filter(isVietnameseVoice)
    .sort((a, b) => scoreVietnameseVoice(b) - scoreVietnameseVoice(a));
}

export function getSavedPreferredVoiceURI(): string | null {
  try {
    return window.localStorage.getItem(PREFERRED_VOICE_KEY);
  } catch {
    return null;
  }
}

export function savePreferredVoiceURI(voiceURI: string): void {
  try {
    window.localStorage.setItem(PREFERRED_VOICE_KEY, voiceURI);
  } catch {
    // Ignore storage errors in restricted environments
  }
}

export function formatVoiceLabel(voice: SpeechSynthesisVoice): string {
  const lower = voice.name.toLowerCase();
  if (lower.includes('hoaimy')) return 'Hoài My (Nữ • Tự nhiên)';
  if (lower.includes('namminh')) return 'Nam Minh (Nam • Tự nhiên)';
  if (lower.includes('google')) return 'Google Tiếng Việt';
  if (lower.includes('linh')) return 'Linh (Tiếng Việt)';
  return voice.name.replace(/\s*-\s*Vietnamese.*$/i, '').trim();
}

export async function waitForVoices(timeoutMs = 1200): Promise<SpeechSynthesisVoice[]> {
  if (!isSpeechSupported()) return [];

  const immediate = window.speechSynthesis.getVoices();
  if (immediate.length > 0 && immediate.some(isVietnameseVoice)) {
    return immediate;
  }

  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
      window.clearInterval(pollTimer);
      window.clearTimeout(maxTimer);
      resolve(window.speechSynthesis.getVoices());
    };

    const onVoicesChanged = () => {
      const loaded = window.speechSynthesis.getVoices();
      if (loaded.length > 0) {
        finish();
      }
    };

    window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);

    const pollTimer = window.setInterval(() => {
      const loaded = window.speechSynthesis.getVoices();
      if (loaded.length > 0 && loaded.some(isVietnameseVoice)) {
        finish();
      }
    }, 100);

    const maxTimer = window.setTimeout(finish, timeoutMs);
  });
}

function chunkVietnameseText(rawText: string, maxLength = 165): string[] {
  const cleaned = rawText.replace(/\s+/g, ' ').trim();
  if (!cleaned) return [];

  const sentenceParts = cleaned
    .split(/(?<=[.!?\n;])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  for (const part of sentenceParts) {
    if (part.length <= maxLength) {
      chunks.push(part);
      continue;
    }

    const clauses = part.split(/,\s+/).map((c) => c.trim()).filter(Boolean);
    let buffer = '';
    for (const clause of clauses) {
      const next = buffer ? `${buffer}, ${clause}` : clause;
      if (next.length > maxLength && buffer) {
        chunks.push(buffer);
        buffer = clause;
      } else {
        buffer = next;
      }
    }
    if (buffer) chunks.push(buffer);
  }

  return chunks;
}

export function stopSpeaking(): void {
  activeSessionId += 1;
  if (!isSpeechSupported()) return;
  window.speechSynthesis.cancel();
}

export async function speakVietnamese(
  text: string,
  callbacks?: SpeakCallbacks,
  preferredVoiceURI?: string
): Promise<boolean> {
  if (!isSpeechSupported() || !text.trim()) {
    callbacks?.onError?.('UNSUPPORTED');
    return false;
  }

  const sessionId = ++activeSessionId;
  window.speechSynthesis.cancel();

  await waitForVoices();
  if (sessionId !== activeSessionId) {
    return false;
  }

  const vietnameseVoices = getVietnameseVoices();
  if (vietnameseVoices.length === 0) {
    callbacks?.onError?.('NO_VIETNAMESE_VOICE');
    return false;
  }

  const requestedURI = preferredVoiceURI || getSavedPreferredVoiceURI();
  const selectedVoice =
    vietnameseVoices.find((v) => v.voiceURI === requestedURI) ||
    vietnameseVoices[0];

  const chunks = chunkVietnameseText(text);
  if (chunks.length === 0) {
    callbacks?.onEnd?.();
    return false;
  }

  callbacks?.onStart?.();

  const speakChunkAt = (index: number) => {
    if (sessionId !== activeSessionId) return;

    if (index >= chunks.length) {
      callbacks?.onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(chunks[index]);
    utterance.voice = selectedVoice;
    utterance.lang = selectedVoice.lang || 'vi-VN';
    utterance.rate = 0.92;
    utterance.pitch = 1;

    utterance.onend = () => {
      if (sessionId !== activeSessionId) return;
      speakChunkAt(index + 1);
    };

    utterance.onerror = (event) => {
      if (sessionId !== activeSessionId) return;
      if (event.error === 'canceled' || event.error === 'interrupted') {
        callbacks?.onEnd?.();
      } else {
        callbacks?.onError?.('PLAYBACK_FAILED');
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  speakChunkAt(0);
  return true;
}
