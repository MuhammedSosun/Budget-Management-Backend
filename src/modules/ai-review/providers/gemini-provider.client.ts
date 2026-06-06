import {
    AIReviewLanguage,
    AIReviewResult,
    AIReviewSignals,
} from "../ai-review.types";
import {
    GenerateReviewInput,
    GenerateReviewOutput,
    IAIProviderClient,
} from "./ai-provider.interface";

type GeminiGenerateContentResponse = {
    candidates?: {
        content?: {
            parts?: {
                text?: string;
            }[];
        };
        finishReason?: string;
    }[];
};

const DEFAULT_GEMINI_BASE_URL =
    "https://generativelanguage.googleapis.com/v1beta";

const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

export class GeminiProviderClient implements IAIProviderClient {
    private readonly apiKey: string;
    private readonly model: string;
    private readonly baseUrl: string;

    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY || "";
        this.model = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
        this.baseUrl = process.env.GEMINI_BASE_URL || DEFAULT_GEMINI_BASE_URL;
    }

    async generateMonthlyReview({
        signals,
        language,
    }: GenerateReviewInput): Promise<GenerateReviewOutput> {
        if (!this.apiKey) {
            return this.createFallbackOutput(
                language,
                this.getFallbackReason(language, "missing_api_key"),
            );
        }

        try {
            const response = await fetch(
                `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        contents: [
                            {
                                role: "user",
                                parts: [
                                    {
                                        text: this.createPrompt(signals, language),
                                    },
                                ],
                            },
                        ],
                        generationConfig: {
                            temperature: 0,
                            maxOutputTokens: 900,
                            responseMimeType: "application/json",
                            responseSchema: this.createResponseSchema(),
                            thinkingConfig: {
                                thinkingBudget: 0,
                            },
                        },
                    }),
                },
            );

            if (!response.ok) {
                return this.createFallbackOutput(
                    language,
                    this.getFallbackReason(language, "bad_response"),
                );
            }

            const data = (await response.json()) as GeminiGenerateContentResponse;

            const candidate = data.candidates?.[0];

            if (candidate?.finishReason === "MAX_TOKENS") {
                return this.createFallbackOutput(
                    language,
                    this.getFallbackReason(language, "max_tokens"),
                );
            }

            const content = candidate?.content?.parts?.[0]?.text;

            if (!content) {
                return this.createFallbackOutput(
                    language,
                    this.getFallbackReason(language, "empty_content"),
                );
            }

            const parsedReview = this.safeParseReview(content);

            if (!this.isValidReview(parsedReview)) {
                return this.createFallbackOutput(
                    language,
                    this.getFallbackReason(language, "invalid_format"),
                );
            }

            if (this.isLowQualityReview(parsedReview)) {
                return this.createFallbackOutput(
                    language,
                    this.getFallbackReason(language, "low_quality"),
                );
            }

            if (this.containsUnsafeContent(parsedReview)) {
                return this.createFallbackOutput(
                    language,
                    this.getFallbackReason(language, "unsafe_content"),
                );
            }

            return {
                review: parsedReview,
                provider: "gemini",
                model: this.model,
            };
        } catch {
            return this.createFallbackOutput(
                language,
                this.getFallbackReason(language, "unexpected_error"),
            );
        }
    }

    private createPrompt(
        signals: AIReviewSignals,
        language: AIReviewLanguage,
    ) {
        if (language === "en") {
            return [
                "You are a personal budget analysis assistant.",
                "Generate a strong, short, and user-friendly monthly budget report based on the given financial metrics.",
                "Respond only in English.",
                "Return only valid JSON.",
                "Do not use Markdown or explanations outside JSON.",
                "Use only the provided numeric values, percentages, and metrics.",
                "Do not create new numbers, new percentages, or estimated calculations.",
                "Do not make comparisons that are not present in the data.",
                "If previous month data is not available, do not compare with the previous month.",
                "If workspace member analysis exists, mention the top spender.",
                "If category percentage exists, mention the dominant category with its percentage.",
                "If previous month comparison exists, mention the expense increase or decrease percentage.",
                "Use percentages naturally in user-friendly sentences.",
                "Write amounts together with their currency.",
                "Do not give investment, stock, crypto, coin, fund, buying, selling, or trading advice.",
                "JSON fields: summary, highlights, risks, recommendations, savingSuggestion.",
                "highlights, risks, and recommendations must not be empty.",
                `Signals and calculated metrics: ${JSON.stringify(signals)}`,
            ].join(" ");
        }

        return [
            "Türkçe kişisel bütçe analiz asistanısın.",
            "Verilen finansal metriklere göre güçlü, kısa ve kullanıcı dostu aylık bütçe raporu üret.",
            "Sadece Türkçe cevap ver.",
            "Sadece geçerli JSON döndür.",
            "Markdown veya açıklama yazma.",
            "Sadece verilen sayısal değerleri, yüzdeleri ve metrikleri kullan.",
            "Yeni sayı, yeni yüzde veya tahmini hesaplama üretme.",
            "Veride olmayan karşılaştırma yapma.",
            "Önceki ay verisi yoksa önceki ay ile kıyaslama yapma.",
            "Workspace member analizi varsa en çok harcama yapan kullanıcıyı belirt.",
            "Kategori yüzdesi varsa en baskın kategoriyi yüzdesiyle belirt.",
            "Önceki ay karşılaştırması varsa gider artış veya azalış yüzdesini belirt.",
            "Yüzdelik değerleri kullanıcıyı bilgilendirecek şekilde doğal cümle içinde kullan.",
            "Tutarları para birimiyle birlikte yaz.",
            "Yatırım, hisse, coin, fon, alım-satım tavsiyesi verme.",
            "JSON alanları: summary, highlights, risks, recommendations, savingSuggestion.",
            "highlights, risks ve recommendations boş olmamalı.",
            `Sinyaller ve hesaplanmış metrikler: ${JSON.stringify(signals)}`,
        ].join(" ");
    }

    private createResponseSchema() {
        return {
            type: "object",
            properties: {
                summary: {
                    type: "string",
                },
                highlights: {
                    type: "array",
                    items: {
                        type: "string",
                    },
                },
                risks: {
                    type: "array",
                    items: {
                        type: "string",
                    },
                },
                recommendations: {
                    type: "array",
                    items: {
                        type: "string",
                    },
                },
                savingSuggestion: {
                    type: "string",
                },
            },
            required: [
                "summary",
                "highlights",
                "risks",
                "recommendations",
                "savingSuggestion",
            ],
        };
    }

    private safeParseReview(content: string): unknown {
        try {
            return JSON.parse(content);
        } catch {
            return null;
        }
    }

    private isValidReview(value: unknown): value is AIReviewResult {
        if (!value || typeof value !== "object") {
            return false;
        }

        const review = value as AIReviewResult;

        return (
            typeof review.summary === "string" &&
            Array.isArray(review.highlights) &&
            review.highlights.every((item) => typeof item === "string") &&
            Array.isArray(review.risks) &&
            review.risks.every((item) => typeof item === "string") &&
            Array.isArray(review.recommendations) &&
            review.recommendations.every((item) => typeof item === "string") &&
            typeof review.savingSuggestion === "string"
        );
    }

    private isLowQualityReview(review: AIReviewResult) {
        const fields = [
            review.summary,
            ...review.highlights,
            ...review.risks,
            ...review.recommendations,
            review.savingSuggestion,
        ];

        const hasEmptyRequiredText =
            review.summary.trim().length < 20 ||
            review.savingSuggestion.trim().length < 20;

        const hasTooLongText = fields.some((field) => field.length > 450);

        const hasEmptyArrays =
            review.highlights.length === 0 ||
            review.risks.length === 0 ||
            review.recommendations.length === 0;

        return hasEmptyRequiredText || hasTooLongText || hasEmptyArrays;
    }

    private containsUnsafeContent(review: AIReviewResult) {
        const text = [
            review.summary,
            ...review.highlights,
            ...review.risks,
            ...review.recommendations,
            review.savingSuggestion,
        ]
            .join(" ")
            .toLowerCase();

        const unsafeKeywords = [
            "hisse",
            "coin",
            "bitcoin",
            "ethereum",
            "kripto",
            "borsa",
            "portföy",
            "yatırım aracı",
            "yatırımlar",

            "stock",
            "stocks",
            "crypto",
            "cryptocurrency",
            "portfolio",
            "investment instrument",
            "trading",
            "trade",

            "markdown",
            "json format",
            "json olarak",
            "as json",
        ];

        const unsafePhrases = [
            "hisse al",
            "hisse sat",
            "coin al",
            "coin sat",
            "kripto al",
            "kripto sat",
            "fon al",
            "fon sat",
            "alım satım",
            "al-sat",
            "yatırım tavsiyesi",
            "yatırım yap",
            "borsada",
            "portföy oluştur",

            "buy stock",
            "sell stock",
            "buy stocks",
            "sell stocks",
            "buy crypto",
            "sell crypto",
            "buy coin",
            "sell coin",
            "investment advice",
            "make an investment",
            "create a portfolio",
        ];

        const hasUnsafeKeyword = unsafeKeywords.some((word) =>
            text.includes(word),
        );

        const hasUnsafePhrase = unsafePhrases.some((phrase) =>
            text.includes(phrase),
        );

        const hasChineseCharacters = /[\u4e00-\u9fff]/.test(text);

        const hasSuspiciousJsonTalk =
            text.includes("aşağıdaki json") ||
            text.includes("json döndür") ||
            text.includes("formatında") ||
            text.includes("the following json") ||
            text.includes("return json") ||
            text.includes("in json format");

        const hasCurlyBrace = text.includes("{") || text.includes("}");

        return (
            hasUnsafeKeyword ||
            hasUnsafePhrase ||
            hasChineseCharacters ||
            hasSuspiciousJsonTalk ||
            hasCurlyBrace
        );
    }

    private getFallbackReason(
        language: AIReviewLanguage,
        reason:
            | "missing_api_key"
            | "bad_response"
            | "max_tokens"
            | "empty_content"
            | "invalid_format"
            | "low_quality"
            | "unsafe_content"
            | "unexpected_error",
    ) {
        const reasons: Record<
            typeof reason,
            Record<AIReviewLanguage, string>
        > = {
            missing_api_key: {
                tr: "Gemini API anahtarı bulunamadığı için güvenli varsayılan rapor oluşturuldu.",
                en: "A safe default report was generated because the Gemini API key is missing.",
            },
            bad_response: {
                tr: "Gemini servisinden başarılı yanıt alınamadığı için güvenli varsayılan rapor oluşturuldu.",
                en: "A safe default report was generated because Gemini did not return a successful response.",
            },
            max_tokens: {
                tr: "Gemini yanıtı tamamlanamadığı için güvenli varsayılan rapor oluşturuldu.",
                en: "A safe default report was generated because Gemini response was not completed.",
            },
            empty_content: {
                tr: "Gemini boş yanıt döndürdüğü için güvenli varsayılan rapor oluşturuldu.",
                en: "A safe default report was generated because Gemini returned an empty response.",
            },
            invalid_format: {
                tr: "Gemini yanıtı beklenen formatta olmadığı için güvenli varsayılan rapor oluşturuldu.",
                en: "A safe default report was generated because Gemini response did not match the expected format.",
            },
            low_quality: {
                tr: "Gemini yanıtı kalite kontrolünden geçemediği için güvenli varsayılan rapor oluşturuldu.",
                en: "A safe default report was generated because Gemini response did not pass quality checks.",
            },
            unsafe_content: {
                tr: "Gemini yanıtı güvenli içerik kurallarını karşılamadığı için güvenli varsayılan rapor oluşturuldu.",
                en: "A safe default report was generated because Gemini response did not pass safety checks.",
            },
            unexpected_error: {
                tr: "Gemini isteği sırasında hata oluştuğu için güvenli varsayılan rapor oluşturuldu.",
                en: "A safe default report was generated because an unexpected error occurred during the Gemini request.",
            },
        };

        return reasons[reason][language];
    }

    private createFallbackOutput(
        language: AIReviewLanguage,
        reason: string,
    ): GenerateReviewOutput {
        if (language === "en") {
            return {
                provider: "gemini",
                model: this.model,
                review: {
                    summary:
                        "AI analysis could not be generated safely right now. You can review the monthly financial data from the analytics screen.",
                    highlights: [],
                    risks: [],
                    recommendations: [
                        "You can regularly review spending by category.",
                        "You can check budget limits throughout the month.",
                        "Keeping expense records up to date can improve financial awareness.",
                    ],
                    savingSuggestion: reason,
                },
            };
        }

        return {
            provider: "gemini",
            model: this.model,
            review: {
                summary:
                    "AI analizi şu anda güvenli şekilde üretilemedi. Aylık finansal veriler analytics ekranından incelenebilir.",
                highlights: [],
                risks: [],
                recommendations: [
                    "Kategori bazlı harcamaları düzenli olarak kontrol edebilirsin.",
                    "Bütçe limitlerini ay içinde belirli aralıklarla gözden geçirebilirsin.",
                    "Gider kayıtlarını düzenli tutarak daha sağlıklı finansal farkındalık oluşturabilirsin.",
                ],
                savingSuggestion: reason,
            },
        };
    }
}