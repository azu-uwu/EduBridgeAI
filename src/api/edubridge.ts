import type {
  ApiErrorDetail,
  ExplainApiData,
  LanguageLevel,
  SimplifyApiData,
  SummarizeApiData,
} from "../types/api";

// ============================================================
// Lỗi thống nhất để các trang giao diện xử lý.
// status = 0 khi chưa nhận được HTTP response.
// ============================================================

export class ApiErrorThrown extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: ApiErrorDetail[];

  constructor(
    code: string,
    message: string,
    status = 0,
    details?: ApiErrorDetail[]
  ) {
    super(message);

    this.name = "ApiErrorThrown";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

// ============================================================
// Các hàm kiểm tra dữ liệu lúc chạy.
// JSON nhận từ mạng luôn được xem là unknown.
// ============================================================

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isLanguageLevel(
  value: unknown
): value is LanguageLevel {
  return (
    value === "basic" ||
    value === "intermediate" ||
    value === "advanced"
  );
}

function isStringList(
  value: unknown,
  min: number,
  max: number
): value is string[] {
  return (
    Array.isArray(value) &&
    value.length >= min &&
    value.length <= max &&
    value.every(isNonEmptyString)
  );
}

function invalidResponse(status: number): ApiErrorThrown {
  return new ApiErrorThrown(
    "INVALID_RESPONSE",
    "Phản hồi từ server không đúng cấu trúc.",
    status
  );
}

// Đọc details nếu backend cung cấp đúng cấu trúc.
function parseErrorDetails(
  value: unknown
): ApiErrorDetail[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const details: ApiErrorDetail[] = [];

  for (const item of value) {
    if (
      !isRecord(item) ||
      !isNonEmptyString(item.field) ||
      !isNonEmptyString(item.message)
    ) {
      return undefined;
    }

    details.push({
      field: item.field,
      message: item.message,
    });
  }

  return details;
}

// ============================================================
// Kiểm tra data riêng cho từng API.
// Trả object đã được xác thực, không ép kiểu bằng "as T".
// ============================================================

function parseSimplifyData(
  value: unknown,
  status: number
): SimplifyApiData {
  if (
    !isRecord(value) ||
    !isNonEmptyString(value.simplifiedText) ||
    !isLanguageLevel(value.level)
  ) {
    throw invalidResponse(status);
  }

  return {
    simplifiedText: value.simplifiedText,
    level: value.level,
  };
}

function parseExplainData(
  value: unknown,
  status: number
): ExplainApiData {
  if (
    !isRecord(value) ||
    !isNonEmptyString(value.term) ||
    !isNonEmptyString(value.meaning) ||
    !isStringList(value.examples, 1, 3)
  ) {
    throw invalidResponse(status);
  }

  return {
    term: value.term,
    meaning: value.meaning,
    examples: value.examples,
  };
}

function parseSummarizeData(
  value: unknown,
  status: number
): SummarizeApiData {
  if (
    !isRecord(value) ||
    !isNonEmptyString(value.summary) ||
    !isStringList(value.keyPoints, 1, 7)
  ) {
    throw invalidResponse(status);
  }

  return {
    summary: value.summary,
    keyPoints: value.keyPoints,
  };
}

// ============================================================
// Cấu hình địa chỉ backend.
// ============================================================

function getBaseUrl(): string {
  const configuredValue: unknown =
    import.meta.env.VITE_API_BASE_URL;

  if (!isNonEmptyString(configuredValue)) {
    throw new ApiErrorThrown(
      "CONFIG_ERROR",
      "Thiếu cấu hình VITE_API_BASE_URL."
    );
  }

  const baseUrl = configuredValue.trim().replace(/\/+$/, "");

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(baseUrl);
  } catch {
    throw new ApiErrorThrown(
      "CONFIG_ERROR",
      "Địa chỉ backend không hợp lệ."
    );
  }

  if (
    !["http:", "https:"].includes(parsedUrl.protocol) ||
    parsedUrl.username ||
    parsedUrl.password ||
    parsedUrl.search ||
    parsedUrl.hash
  ) {
    throw new ApiErrorThrown(
      "CONFIG_ERROR",
      "Địa chỉ backend phải dùng HTTP/HTTPS và không chứa thông tin đăng nhập, query hoặc hash."
    );
  }

  return baseUrl;
}

// ============================================================
// POST JSON dùng chung.
// Thành công: trả data.
// Thất bại: throw ApiErrorThrown.
// Không retry và không trả dữ liệu giả.
// ============================================================

async function postJson<T>(
  endpoint: string,
  body: Record<string, unknown>,
  parseData: (value: unknown, status: number) => T
): Promise<T> {
  const url = `${getBaseUrl()}${endpoint}`;

  let response: Response;

  // Chỉ bắt lỗi kết nối ở bước fetch.
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiErrorThrown(
      "NETWORK_ERROR",
      "Không kết nối được backend. Hãy kiểm tra kết nối và server."
    );
  }

  // Parse JSON đúng một lần.
  let parsed: unknown;

  try {
    parsed = await response.json();
  } catch {
    throw new ApiErrorThrown(
      "INVALID_RESPONSE",
      "Không đọc được phản hồi JSON hợp lệ từ server.",
      response.status
    );
  }

  if (!isRecord(parsed)) {
    throw invalidResponse(response.status);
  }

  // Backend trả lỗi theo hợp đồng.
  if (parsed.success === false) {
    const error = parsed.error;

    if (
      !isRecord(error) ||
      !isNonEmptyString(error.code) ||
      !isNonEmptyString(error.message)
    ) {
      throw invalidResponse(response.status);
    }

    throw new ApiErrorThrown(
      error.code,
      error.message,
      response.status,
      parseErrorDetails(error.details)
    );
  }

  // HTTP không thành công nhưng không có error envelope hợp lệ.
  if (!response.ok) {
    throw new ApiErrorThrown(
      "HTTP_ERROR",
      `Server trả lỗi HTTP ${response.status}.`,
      response.status
    );
  }

  if (parsed.success !== true) {
    throw invalidResponse(response.status);
  }

  // Ba API AI phải có meta.mode hợp lệ.
  const meta = parsed.meta;

  if (
    !isRecord(meta) ||
    (meta.mode !== "mock" && meta.mode !== "gemini")
  ) {
    throw invalidResponse(response.status);
  }

  return parseData(parsed.data, response.status);
}

// ============================================================
// Ba hàm được các trang giao diện sử dụng.
// ============================================================

export function simplify(
  text: string,
  level: LanguageLevel = "basic"
): Promise<SimplifyApiData> {
  return postJson(
    "/api/simplify",
    { text, level },
    parseSimplifyData
  );
}

export function explain(
  term: string,
  context?: string
): Promise<ExplainApiData> {
  const body: Record<string, unknown> = { term };

  if (context !== undefined) {
    body.context = context;
  }

  return postJson(
    "/api/explain",
    body,
    parseExplainData
  );
}

export function summarize(
  text: string
): Promise<SummarizeApiData> {
  return postJson(
    "/api/summarize",
    { text },
    parseSummarizeData
  );
}