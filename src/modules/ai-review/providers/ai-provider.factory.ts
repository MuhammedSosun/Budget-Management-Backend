import { AIReviewProvider } from "../ai-review.types";
import { IAIProviderClient } from "./ai-provider.interface";
import { GeminiProviderClient } from "./gemini-provider.client";
import { OllamaProviderClient } from "./ollama-provider.client";

export class AIProviderFactory {
    static create(provider: AIReviewProvider = "ollama"): IAIProviderClient {
        switch (provider) {
            case "gemini":
                return new GeminiProviderClient();

            case "ollama":
                return new OllamaProviderClient();

            default:
                return new OllamaProviderClient();
        }
    }
}