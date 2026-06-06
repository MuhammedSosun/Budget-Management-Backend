import {
    AIReviewLanguage,
    AIReviewResult,
    AIReviewSignals,
} from "../ai-review.types";

export interface GenerateReviewInput {
    signals: AIReviewSignals;
    language: AIReviewLanguage;
}

export interface GenerateReviewOutput {
    review: AIReviewResult;
    provider: string;
    model: string;
}

export interface IAIProviderClient {
    generateMonthlyReview(
        input: GenerateReviewInput,
    ): Promise<GenerateReviewOutput>;
}