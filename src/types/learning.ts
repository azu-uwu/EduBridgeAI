export type SimplificationLevel = 'de-hieu' | 'co-ban' | 'nang-cao';

export type ResultSubTab = 'simplified' | 'vocabulary' | 'summary';

export type ConceptVisualTheme =
  | 'tech'
  | 'culture'
  | 'photosynthesis'
  | 'heritage'
  | 'solidarity'
  | 'ecosystem'
  | 'nature'
  | 'general';

export interface VocabularyEntry {
  word: string;
  meaning: string;
  example: string;
  visualTheme: ConceptVisualTheme;
  imageUrl?: string;
}

export interface SimplifyResult {
  originalText: string;
  level: SimplificationLevel;
  simplifiedText: string;
  extractedWords: VocabularyEntry[];
  summaryPoints: string[];
  sourceTitle?: string;
}

export interface PresetLesson {
  id: string;
  label: string;
  category: string;
  text: string;
  simplifyResults: Record<SimplificationLevel, string>;
  extractedWords: VocabularyEntry[];
  summaryPoints: string[];
}

export interface SummaryResult {
  originalText: string;
  points: string[];
  readingTip: string;
}

