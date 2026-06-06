import { CurrencyCode } from "../../models/transaction.model";
import { MonthlyReportResult } from "../analytics/analytics.types";
import { IAnalyticsRepository } from "../analytics/analytics.repository.interface";
import {
    AIReviewCalculatedMetrics,
    AIReviewLanguage,
    AIReviewMemberSpendingMetric,
    AIReviewSignals,
    CreateMonthlyAIReviewParams,
    MonthlyAIReviewResult,
} from "./ai-review.types";
import { AIProviderFactory } from "./providers/ai-provider.factory";
import { AppError } from "../../exceptions/AppError";
import { ErrorCode } from "../../exceptions/ErrorCodes";

export class AIReviewService {
    constructor(
        private readonly analyticsRepository: IAnalyticsRepository,
    ) { }

    private validateCurrency(currency: CurrencyCode) {
        const allowedCurrencies: CurrencyCode[] = ["TRY", "USD", "EUR"];

        if (!allowedCurrencies.includes(currency)) {
            throw new AppError(ErrorCode.INVALID_TRANSACTION_CURRENCY, 400);
        }
    }

    async generateMonthlyReview({
        workspaceId,
        month,
        currency,
        provider = "gemini",
        language = "tr",
    }: CreateMonthlyAIReviewParams): Promise<MonthlyAIReviewResult> {
        this.validateCurrency(currency);

        const monthlyReport = await this.analyticsRepository.getMonthlyReport({
            workspaceId,
            month,
            currency,
        });

        const signals = this.buildAIReviewSignals(monthlyReport, language);

        const aiProviderClient = AIProviderFactory.create(provider);

        const aiResult = await aiProviderClient.generateMonthlyReview({
            signals,
            language,
        });

        return {
            month: monthlyReport.month,
            currency: monthlyReport.currency,
            review: aiResult.review,
            generatedAt: new Date().toISOString(),
            provider: aiResult.provider,
            model: aiResult.model,
        };
    }

    private buildAIReviewSignals(
        monthlyReport: MonthlyReportResult,
        language: AIReviewLanguage,
    ): AIReviewSignals {
        const topCategory = monthlyReport.categoryBreakdown[0];

        const financialPosition = this.getFinancialPosition(
            monthlyReport.summary.netBalance,
            monthlyReport.summary.transactionCount,
        );

        const expenseConcentration = this.getExpenseConcentration(
            topCategory?.percentage,
            monthlyReport.summary.expenseCount,
        );

        const memberSpendingStatus = this.getMemberSpendingStatus(
            monthlyReport.memberSpending.length,
        );

        const previousMonthComparison =
            monthlyReport.monthComparison.hasPreviousMonthData
                ? "available"
                : "not_available";

        const calculatedMetrics = this.buildCalculatedMetrics(
            monthlyReport,
            language,
        );

        return {
            month: monthlyReport.month,
            currency: monthlyReport.currency,
            language,
            financialPosition,
            topExpenseCategory: topCategory
                ? this.getCategoryDisplayName(topCategory.category, language)
                : undefined,
            expenseConcentration,
            memberSpendingStatus,
            previousMonthComparison,
            calculatedMetrics,
            insights: this.buildInsights({
                monthlyReport,
                calculatedMetrics,
                topExpenseCategory: topCategory?.category,
                financialPosition,
                expenseConcentration,
                memberSpendingStatus,
                previousMonthComparison,
                language,
            }),
        };
    }

    private buildCalculatedMetrics(
        monthlyReport: MonthlyReportResult,
        language: AIReviewLanguage,
    ): AIReviewCalculatedMetrics {
        const totalExpense = monthlyReport.summary.totalExpense;
        const totalIncome = monthlyReport.summary.totalIncome;

        const memberSpending: AIReviewMemberSpendingMetric[] =
            monthlyReport.memberSpending.map((member, index) => {
                const displayName = this.getMemberDisplayName({
                    firstName: member.firstName,
                    lastName: member.lastName,
                    email: member.email,
                    language,
                });

                return {
                    userId: member.userId,
                    displayName,
                    email: member.email,
                    totalExpense: member.totalExpense,
                    currency: monthlyReport.currency,
                    percentageOfWorkspaceExpense: this.calculatePercentage(
                        member.totalExpense,
                        totalExpense,
                    ),
                    transactionCount: member.transactionCount,
                    rank: index + 1,
                };
            });

        const topSpender = memberSpending[0];
        const secondTopSpender = memberSpending[1];

        const topSpenderDifferenceAmount =
            topSpender && secondTopSpender
                ? Number(
                    (
                        topSpender.totalExpense - secondTopSpender.totalExpense
                    ).toFixed(2),
                )
                : undefined;

        const topSpenderDifferencePercentage =
            topSpender && secondTopSpender
                ? this.calculatePercentageChange(
                    topSpender.totalExpense,
                    secondTopSpender.totalExpense,
                )
                : null;

        const topCategory = monthlyReport.categoryBreakdown[0];

        return {
            totalIncome,
            totalExpense,
            netBalance: monthlyReport.summary.netBalance,
            transactionCount: monthlyReport.summary.transactionCount,
            incomeCount: monthlyReport.summary.incomeCount,
            expenseCount: monthlyReport.summary.expenseCount,
            savingRatePercentage:
                totalIncome > 0
                    ? this.calculatePercentage(
                        monthlyReport.summary.netBalance,
                        totalIncome,
                    )
                    : null,
            topExpenseCategory: topCategory
                ? {
                    category: this.getCategoryDisplayName(
                        topCategory.category,
                        language,
                    ),
                    totalExpense: topCategory.totalExpense,
                    currency: monthlyReport.currency,
                    percentageOfTotalExpense: topCategory.percentage,
                    transactionCount: topCategory.transactionCount,
                }
                : undefined,
            memberSpending,
            topSpender,
            secondTopSpender,
            topSpenderDifferenceAmount,
            topSpenderDifferencePercentage,
            previousMonth: {
                hasPreviousMonthData:
                    monthlyReport.monthComparison.hasPreviousMonthData,
                incomeDifference:
                    monthlyReport.monthComparison.change.incomeDifference,
                incomeChangePercentage:
                    monthlyReport.monthComparison.change.incomeChangePercentage,
                expenseDifference:
                    monthlyReport.monthComparison.change.expenseDifference,
                expenseChangePercentage:
                    monthlyReport.monthComparison.change.expenseChangePercentage,
                netBalanceDifference:
                    monthlyReport.monthComparison.change.netBalanceDifference,
                netBalanceChangePercentage:
                    monthlyReport.monthComparison.change.netBalanceChangePercentage,
            },
        };
    }

    private calculatePercentage(part: number, total: number) {
        if (!total || total === 0) {
            return 0;
        }

        return Number(((part / total) * 100).toFixed(2));
    }

    private calculatePercentageChange(current: number, previous: number) {
        if (!previous || previous === 0) {
            return null;
        }

        return Number((((current - previous) / previous) * 100).toFixed(2));
    }

    private getMemberDisplayName({
        firstName,
        lastName,
        email,
        language,
    }: {
        firstName: string;
        lastName: string;
        email: string;
        language: AIReviewLanguage;
    }) {
        const fullName = `${firstName} ${lastName}`.trim();

        if (fullName) {
            return fullName;
        }

        return email || this.translate(
            language,
            "Bilinmeyen kullanıcı",
            "Unknown user",
        );
    }

    private getFinancialPosition(
        netBalance: number,
        transactionCount: number,
    ): AIReviewSignals["financialPosition"] {
        if (transactionCount === 0) {
            return "no_data";
        }

        if (netBalance > 0) {
            return "positive_balance";
        }

        if (netBalance < 0) {
            return "negative_balance";
        }

        return "balanced";
    }

    private getExpenseConcentration(
        topCategoryPercentage?: number,
        expenseCount?: number,
    ): AIReviewSignals["expenseConcentration"] {
        if (!expenseCount || expenseCount === 0 || topCategoryPercentage === undefined) {
            return "no_expense_data";
        }

        if (topCategoryPercentage >= 50) {
            return "high";
        }

        if (topCategoryPercentage >= 25) {
            return "normal";
        }

        return "low";
    }

    private getMemberSpendingStatus(
        memberCount: number,
    ): AIReviewSignals["memberSpendingStatus"] {
        if (memberCount === 0) {
            return "no_member_activity";
        }

        if (memberCount === 1) {
            return "single_member_activity";
        }

        return "multiple_member_activity";
    }

    private getCategoryDisplayName(
        category: string,
        language: AIReviewLanguage = "tr",
    ) {
        const normalizedCategory = category.toLowerCase().trim();

        const categoryMap: Record<string, { tr: string; en: string }> = {
            market: {
                tr: "market alışverişi",
                en: "grocery shopping",
            },
            food: {
                tr: "yemek",
                en: "food",
            },
            transport: {
                tr: "ulaşım",
                en: "transportation",
            },
            bills: {
                tr: "faturalar",
                en: "bills",
            },
            okul: {
                tr: "okul",
                en: "school",
            },
            school: {
                tr: "okul",
                en: "school",
            },
            hastane: {
                tr: "sağlık",
                en: "health",
            },
            health: {
                tr: "sağlık",
                en: "health",
            },
            supplements: {
                tr: "takviye ürünleri",
                en: "supplements",
            },
            other: {
                tr: "diğer",
                en: "other",
            },
        };

        return categoryMap[normalizedCategory]?.[language] ?? normalizedCategory;
    }

    private translate(
        language: AIReviewLanguage,
        tr: string,
        en: string,
    ) {
        return language === "en" ? en : tr;
    }

    private buildInsights({
        monthlyReport,
        calculatedMetrics,
        topExpenseCategory,
        financialPosition,
        expenseConcentration,
        memberSpendingStatus,
        previousMonthComparison,
        language,
    }: {
        monthlyReport: MonthlyReportResult;
        calculatedMetrics: AIReviewCalculatedMetrics;
        topExpenseCategory?: string;
        financialPosition: AIReviewSignals["financialPosition"];
        expenseConcentration: AIReviewSignals["expenseConcentration"];
        memberSpendingStatus: AIReviewSignals["memberSpendingStatus"];
        previousMonthComparison: AIReviewSignals["previousMonthComparison"];
        language: AIReviewLanguage;
    }) {
        const insights: string[] = [];

        if (financialPosition === "positive_balance") {
            insights.push(
                this.translate(
                    language,
                    `gelir-gider dengesi pozitif ve net bakiye ${monthlyReport.summary.netBalance} ${monthlyReport.currency}`,
                    `income-expense balance is positive and net balance is ${monthlyReport.summary.netBalance} ${monthlyReport.currency}`,
                ),
            );
        }

        if (financialPosition === "negative_balance") {
            insights.push(
                this.translate(
                    language,
                    `giderler gelirden yüksek ve net bakiye ${monthlyReport.summary.netBalance} ${monthlyReport.currency}`,
                    `expenses are higher than income and net balance is ${monthlyReport.summary.netBalance} ${monthlyReport.currency}`,
                ),
            );
        }

        if (financialPosition === "balanced") {
            insights.push(
                this.translate(
                    language,
                    "gelir ve gider dengesi birbirine yakın görünüyor",
                    "income and expenses appear to be close to each other",
                ),
            );
        }

        if (financialPosition === "no_data") {
            insights.push(
                this.translate(
                    language,
                    "seçilen ay için yeterli finansal hareket bulunmuyor",
                    "there is not enough financial activity for the selected month",
                ),
            );
        }

        if (topExpenseCategory && calculatedMetrics.topExpenseCategory) {
            const categoryName = this.getCategoryDisplayName(
                topExpenseCategory,
                language,
            );

            insights.push(
                this.translate(
                    language,
                    `${categoryName} kategorisi toplam giderlerin %${calculatedMetrics.topExpenseCategory.percentageOfTotalExpense} kadarını oluşturuyor`,
                    `${categoryName} accounts for %${calculatedMetrics.topExpenseCategory.percentageOfTotalExpense} of total expenses`,
                ),
            );
        }

        if (calculatedMetrics.savingRatePercentage !== null) {
            insights.push(
                this.translate(
                    language,
                    `net bakiye toplam gelirin %${calculatedMetrics.savingRatePercentage} kadarına denk geliyor`,
                    `net balance equals %${calculatedMetrics.savingRatePercentage} of total income`,
                ),
            );
        }

        if (calculatedMetrics.topSpender) {
            insights.push(
                this.translate(
                    language,
                    `${calculatedMetrics.topSpender.displayName} workspace içinde en yüksek harcamayı yapan kullanıcı ve toplam giderlerin %${calculatedMetrics.topSpender.percentageOfWorkspaceExpense} kadarını oluşturuyor`,
                    `${calculatedMetrics.topSpender.displayName} is the top spender in the workspace and accounts for %${calculatedMetrics.topSpender.percentageOfWorkspaceExpense} of total expenses`,
                ),
            );
        }

        if (
            calculatedMetrics.topSpender &&
            calculatedMetrics.secondTopSpender &&
            calculatedMetrics.topSpenderDifferencePercentage !== null
        ) {
            insights.push(
                this.translate(
                    language,
                    `${calculatedMetrics.topSpender.displayName}, ${calculatedMetrics.secondTopSpender.displayName} kullanıcısından %${calculatedMetrics.topSpenderDifferencePercentage} daha fazla harcama yapmış`,
                    `${calculatedMetrics.topSpender.displayName} spent %${calculatedMetrics.topSpenderDifferencePercentage} more than ${calculatedMetrics.secondTopSpender.displayName}`,
                ),
            );
        }

        if (expenseConcentration === "high") {
            insights.push(
                this.translate(
                    language,
                    "harcamaların tek kategoriye yoğunlaşması bütçe kontrolünü zorlaştırabilir",
                    "spending concentrated in a single category may make budget control harder",
                ),
            );
        }

        if (expenseConcentration === "normal") {
            insights.push(
                this.translate(
                    language,
                    "harcama dağılımı izlenebilir seviyede fakat düzenli takip gerektiriyor",
                    "spending distribution is manageable but requires regular tracking",
                ),
            );
        }

        if (expenseConcentration === "low") {
            insights.push(
                this.translate(
                    language,
                    "harcamalar kategoriler arasında daha dengeli görünüyor",
                    "spending appears more balanced across categories",
                ),
            );
        }

        if (expenseConcentration === "no_expense_data") {
            insights.push(
                this.translate(
                    language,
                    "seçilen ay için gider verisi bulunmuyor",
                    "there is no expense data for the selected month",
                ),
            );
        }

        if (memberSpendingStatus === "single_member_activity") {
            insights.push(
                this.translate(
                    language,
                    "workspace içinde harcama hareketleri tek kullanıcıda yoğunlaşmış",
                    "spending activity in the workspace is concentrated in a single user",
                ),
            );
        }

        if (memberSpendingStatus === "multiple_member_activity") {
            insights.push(
                this.translate(
                    language,
                    "workspace içinde birden fazla kullanıcı harcama hareketi oluşturmuş",
                    "multiple users created spending activity in the workspace",
                ),
            );
        }

        if (memberSpendingStatus === "no_member_activity") {
            insights.push(
                this.translate(
                    language,
                    "workspace içinde kullanıcı bazlı harcama hareketi bulunmuyor",
                    "there is no user-based spending activity in the workspace",
                ),
            );
        }

        if (previousMonthComparison === "not_available") {
            insights.push(
                this.translate(
                    language,
                    "önceki ay verisi olmadığı için ay bazlı karşılaştırma yapılmamalı",
                    "monthly comparison should not be made because previous month data is not available",
                ),
            );
        }

        if (
            previousMonthComparison === "available" &&
            monthlyReport.monthComparison.change.expenseChangePercentage !== null
        ) {
            const expenseChangePercentage =
                monthlyReport.monthComparison.change.expenseChangePercentage;

            if (monthlyReport.monthComparison.change.expenseDifference > 0) {
                insights.push(
                    this.translate(
                        language,
                        `giderler önceki aya göre %${expenseChangePercentage} artmış`,
                        `expenses increased by %${expenseChangePercentage} compared to the previous month`,
                    ),
                );
            }

            if (monthlyReport.monthComparison.change.expenseDifference < 0) {
                insights.push(
                    this.translate(
                        language,
                        `giderler önceki aya göre %${Math.abs(
                            expenseChangePercentage,
                        )} azalmış`,
                        `expenses decreased by %${Math.abs(
                            expenseChangePercentage,
                        )} compared to the previous month`,
                    ),
                );
            }

            if (monthlyReport.monthComparison.change.expenseDifference === 0) {
                insights.push(
                    this.translate(
                        language,
                        "giderler önceki ay ile aynı seviyede",
                        "expenses are at the same level as the previous month",
                    ),
                );
            }
        }

        return insights;
    }
}