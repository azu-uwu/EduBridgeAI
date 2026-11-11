// Ba cấp độ ngôn ngữ theo hợp đồng backend.
export type LanguageLevel =
  | "basic"
  | "intermediate"
  | "advanced";

export type AiMode = "mock" | "gemini";

export interface ApiErrorDetail {
  field: string;
  message: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: ApiErrorDetail[];
}

// Phân biệt rõ phản hồi thành công và thất bại.
export type ApiEnvelope<T> =
  | {
      success: true;
      data: T;
      meta: {
        mode: AiMode;
      };
    }
  | {
      success: false;
      error: ApiError;
    };

export interface SimplifyApiData {
  simplifiedText: string;
  level: LanguageLevel;
}

export interface ExplainApiData {
  term: string;
  meaning: string;
  examples: string[];
}

export interface SummarizeApiData {
  summary: string;
  keyPoints: string[];
}

export type ApiData =
  | SimplifyApiData
  | ExplainApiData
  | SummarizeApiData;