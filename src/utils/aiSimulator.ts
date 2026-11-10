import {
  PRESET_LESSONS,
  VOCABULARY_DICTIONARY,
} from '../data/mockData';
import {
  SimplificationLevel,
  SimplifyResult,
  SummaryResult,
  VocabularyEntry,
} from '../types/learning';

function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFC')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripVietnameseTones(input: string): string {
  return normalizeText(input)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
}

const COMPLEX_WORD_REPLACEMENTS: Array<[RegExp, string]> = [
  [/chuyển đổi số/gi, 'dùng máy tính và mạng internet'],
  [/ứng dụng/gi, 'sử dụng'],
  [/tri thức/gi, 'kiến thức'],
  [/đồng thời/gi, 'cùng lúc đó'],
  [/song song với/gi, 'cùng với'],
  [/hiểm trở/gi, 'khó đi, nhiều đèo dốc'],
  [/kỷ nguyên/gi, 'thời kỳ mới'],
  [/ách thống trị/gi, 'sự cai trị'],
  [/quang năng/gi, 'ánh sáng mặt trời'],
  [/khí quyển/gi, 'không khí'],
  [/chất hữu cơ/gi, 'chất dinh dưỡng'],
  [/sinh hóa/gi, 'tự nhiên trong cây'],
  [/khuyến khích/gi, 'động viên'],
  [/bảo tồn/gi, 'giữ gìn'],
  [/thích nghi/gi, 'làm quen'],
];

function findMatchingPreset(text: string) {
  const normalized = normalizeText(text);
  return PRESET_LESSONS.find((preset) => {
    const presetNorm = normalizeText(preset.text);
    return (
      normalized === presetNorm ||
      normalized.includes(presetNorm.slice(0, 60)) ||
      presetNorm.includes(normalized.slice(0, 60))
    );
  });
}

function extractMatchingVocabulary(text: string): VocabularyEntry[] {
  const normalized = normalizeText(text);
  const found = VOCABULARY_DICTIONARY.filter((entry) =>
    normalized.includes(normalizeText(entry.word))
  );

  if (found.length > 0) {
    return found.slice(0, 4);
  }

  return [
    {
      word: 'Từ khóa chính trong bài',
      meaning:
        'Đây là khái niệm quan trọng nhất giúp em hiểu nội dung chính của đoạn văn vừa nhập.',
      example:
        'Em hãy đọc chậm lại từng câu và dùng nút Phát âm để nghe rõ cách đọc nhé!',
      visualTheme: 'general',
    },
    VOCABULARY_DICTIONARY[0],
  ];
}

function buildDynamicSimplifiedText(
  text: string,
  level: SimplificationLevel
): string {
  let simplified = text.trim();

  if (level === 'de-hieu' || level === 'co-ban') {
    for (const [pattern, replacement] of COMPLEX_WORD_REPLACEMENTS) {
      simplified = simplified.replace(pattern, replacement);
    }
  }

  const rawSentences = simplified
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (level === 'de-hieu') {
    const brokenSentences = rawSentences.flatMap((sentence) => {
      if (sentence.length > 90 && sentence.includes(',')) {
        return sentence
          .split(',')
          .map((part) => part.trim())
          .filter(Boolean)
          .map((part) =>
            part.endsWith('.') || part.endsWith('!') || part.endsWith('?')
              ? part
              : `${part.charAt(0).toUpperCase()}${part.slice(1)}.`
          );
      }
      return [sentence];
    });
    return brokenSentences.join('\n\n');
  }

  if (level === 'co-ban') {
    return rawSentences.join('\n\n');
  }

  return rawSentences.join(' ');
}

function buildDynamicSummaryPoints(text: string): string[] {
  const sentences = text
    .trim()
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8);

  if (sentences.length === 0) {
    return [text.trim()];
  }

  if (sentences.length <= 3) {
    return sentences;
  }

  const first = sentences[0];
  const middle = sentences[Math.floor(sentences.length / 2)];
  const last = sentences[sentences.length - 1];
  return [first, middle, last];
}

export function simulateSimplification(
  text: string,
  level: SimplificationLevel
): SimplifyResult {
  const matchedPreset = findMatchingPreset(text);

  if (matchedPreset) {
    return {
      originalText: text,
      level,
      simplifiedText: matchedPreset.simplifyResults[level],
      extractedWords: matchedPreset.extractedWords,
      summaryPoints: matchedPreset.summaryPoints,
      sourceTitle: matchedPreset.label,
    };
  }

  return {
    originalText: text,
    level,
    simplifiedText: buildDynamicSimplifiedText(text, level),
    extractedWords: extractMatchingVocabulary(text),
    summaryPoints: buildDynamicSummaryPoints(text),
  };
}

export function simulateWordLookup(query: string): VocabularyEntry {
  const normalizedQuery = normalizeText(query);
  const plainQuery = stripVietnameseTones(query);

  const exactMatch = VOCABULARY_DICTIONARY.find(
    (entry) => normalizeText(entry.word) === normalizedQuery
  );
  if (exactMatch) return exactMatch;

  const plainExactMatch = VOCABULARY_DICTIONARY.find(
    (entry) => stripVietnameseTones(entry.word) === plainQuery
  );
  if (plainExactMatch) return plainExactMatch;

  const partialMatch = VOCABULARY_DICTIONARY.find(
    (entry) =>
      normalizeText(entry.word).includes(normalizedQuery) ||
      normalizedQuery.includes(normalizeText(entry.word)) ||
      stripVietnameseTones(entry.word).includes(plainQuery) ||
      plainQuery.includes(stripVietnameseTones(entry.word))
  );
  if (partialMatch) return partialMatch;

  const formattedWord =
    query.trim().charAt(0).toUpperCase() + query.trim().slice(1);

  return {
    word: formattedWord,
    meaning: `"${formattedWord}" là một từ hoặc cụm từ dùng để chỉ một sự vật, hoạt động hoặc ý nghĩa quan trọng trong bài học. Khi đọc gặp từ này, em hãy xem các chữ đứng trước và sau nó để hiểu rõ câu chuyện hơn.`,
    example: `Hôm nay cô giáo giảng cho cả lớp hiểu rõ hơn về "${formattedWord.toLowerCase()}" qua những ví dụ gần gũi hằng ngày.`,
    visualTheme: 'general',
  };
}

export function simulateSummary(text: string): SummaryResult {
  const matchedPreset = findMatchingPreset(text);

  if (matchedPreset) {
    return {
      originalText: text,
      points: matchedPreset.summaryPoints,
      readingTip:
        'Mẹo ghi nhớ: Em hãy đọc lại 3 ý chính này một lần và thử bấm nút Phát âm để nghe lại nhé!',
    };
  }

  return {
    originalText: text,
    points: buildDynamicSummaryPoints(text),
    readingTip:
      'Mẹo ghi nhớ: Em có thể chép các ý chính trên vào vở để ôn tập nhanh trước giờ lên lớp.',
  };
}

