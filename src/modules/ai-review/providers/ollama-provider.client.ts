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

type OllamaChatResponse = {
    model: string;
    created_at: string;
    message?: {
        role: string;
        content: string;
    };
    done: boolean;
    done_reason?: string;
};

const DEFAULT_OLLAMA_BASE_URL = "http://localhost:11434";
const DEFAULT_OLLAMA_MODEL = "qwen2.5:7b";

export class OllamaProviderClient implements IAIProviderClient {
    private readonly baseUrl: string;
    private readonly model: string;

    constructor() {
        this.baseUrl =
            process.env.OLLAMA_BASE_URL || DEFAULT_OLLAMA_BASE_URL;

        this.model =
            process.env.OLLAMA_MODEL || DEFAULT_OLLAMA_MODEL;
    }

    async generateMonthlyReview({
        signals,
        language,
    }: GenerateReviewInput): Promise<GenerateReviewOutput> {
        try {
            const response = await fetch(`${this.baseUrl}/api/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        {
                            role: "system",
                            content: this.createSystemPrompt(language),
                        },
                        {
                            role: "user",
                            content: this.createUserPrompt(signals, language),
                        },
                    ],
                    format: this.createResponseSchema(),
                    stream: false,
                    keep_alive: "0s",
                    options: {
                        temperature: 0,
                        num_predict: 650,
                    },
                }),
            });

            if (!response.ok) {
                return this.createFallbackOutput(language);
            }

            const data = (await response.json()) as OllamaChatResponse;

            if (data.done_reason === "length") {
                return this.createFallbackOutput(language);
            }

            const content = data.message?.content;

            if (!content) {
                return this.createFallbackOutput(language);
            }

            const parsedReview = this.safeParseReview(content);

            if (!this.isValidReview(parsedReview)) {
                return this.createFallbackOutput(language);
            }

            if (this.isLowQualityReview(parsedReview)) {
                return this.createFallbackOutput(language);
            }

            if (this.containsUnsafeContent(parsedReview)) {
                return this.createFallbackOutput(language);
            }

            return {
                review: parsedReview,
                provider: "ollama",
                model: this.model,
            };
        } catch {
            return this.createFallbackOutput(language);
        }
    }

    private createSystemPrompt(language: AIReviewLanguage) {
        if (language === "en") {
            return [
                "You are a personal budget analysis assistant.",
                "You will receive only processed financial signals and calculated metrics.",
                "Respond only in English.",
                "Return only valid JSON.",
                "Do not use Markdown.",
                "Do not explain JSON.",
                "Use only the provided numbers, percentages, and metrics.",
                "Do not create new numbers, new percentages, or estimated calculations.",
                "Do not make comparisons that are not present in the data.",
                "If previous month data is not available, do not compare with the previous month.",
                "If workspace member analysis exists, mention the top spender.",
                "If category percentage exists, mention the dominant category with its percentage.",
                "If previous month comparison exists, mention the expense increase or decrease percentage.",
                "Write amounts together with their currency.",
                "Do not give investment, stock, crypto, coin, fund, buying, selling, or trading advice.",
                "Keep the answer short and user-friendly.",
                "JSON fields must be: summary, highlights, risks, recommendations, savingSuggestion.",
                "highlights, risks, and recommendations must not be empty.",
            ].join(" ");
        }

        return [
            "Türkçe kişisel bütçe analiz asistanısın.",
            "Sana sadece işlenmiş finansal sinyaller ve hesaplanmış metrikler verilecek.",
            "Sadece Türkçe cevap ver.",
            "Sadece geçerli JSON döndür.",
            "Markdown kullanma.",
            "JSON hakkında açıklama yapma.",
            "Sadece verilen sayısal değerleri, yüzdeleri ve metrikleri kullan.",
            "Yeni sayı, yeni yüzde veya tahmini hesaplama üretme.",
            "Veride olmayan karşılaştırma yapma.",
            "Önceki ay verisi yoksa önceki ay ile kıyaslama yapma.",
            "Workspace member analizi varsa en çok harcama yapan kullanıcıyı belirt.",
            "Kategori yüzdesi varsa en baskın kategoriyi yüzdesiyle belirt.",
            "Önceki ay karşılaştırması varsa gider artış veya azalış yüzdesini belirt.",
            "Tutarları para birimiyle birlikte yaz.",
            "Yatırım, hisse, coin, fon, alım-satım tavsiyesi verme.",
            "Cevabı kısa ve kullanıcı dostu tut.",
            "JSON alanları: summary, highlights, risks, recommendations, savingSuggestion.",
            "highlights, risks ve recommendations boş olmamalı.",
        ].join(" ");
    }

    private createUserPrompt(
        signals: AIReviewSignals,
        language: AIReviewLanguage,
    ) {
        if (language === "en") {
            return [
                "Generate a monthly budget review based on the following financial signals and calculated metrics.",
                "Use only the given data.",
                `Signals and calculated metrics: ${JSON.stringify(signals)}`,
            ].join(" ");
        }

        return [
            "Aşağıdaki finansal sinyaller ve hesaplanmış metriklere göre aylık bütçe yorumu üret.",
            "Sadece verilen verileri kullan.",
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

    private createFallbackOutput(
        language: AIReviewLanguage,
    ): GenerateReviewOutput {
        if (language === "en") {
            return {
                provider: "ollama",
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
                    savingSuggestion:
                        "You can consider setting aside part of your net balance for a regular saving habit.",
                },
            };
        }

        return {
            provider: "ollama",
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
                savingSuggestion:
                    "Net bakiyenin bir kısmını düzenli birikim alışkanlığı için ayırmayı değerlendirebilirsin.",
            },
        };
    }
}