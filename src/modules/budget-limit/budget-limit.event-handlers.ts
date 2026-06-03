import { eventBus } from "../../shared/event-bus/eventBus";
import { EventTypes } from "../../shared/events/eventTypes";
import { BudgetLimitRepository } from "./budget-limit.repository";
import { BudgetUsageService } from "./budget-usage.service";
import { TransactionRepository } from "../transaction/transaction.repository";

const budgetLimitRepository = new BudgetLimitRepository();
const transactionRepository = new TransactionRepository();

const budgetUsageService = new BudgetUsageService(
    budgetLimitRepository,
    transactionRepository,
);

type TransactionEventPayload = {
    workspaceId: string;
    transaction?: {
        category: string;
        date: Date | string;
        type: "income" | "expense";
    };
    actor: {
        userId: string;
        email?: string;
    };
};

const getYearMonth = (date: Date | string) => {
    const parsedDate = new Date(date);

    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");

    return `${year}-${month}`;
};

const handleTransactionBudgetCheck = async (
    payload: TransactionEventPayload,
) => {
    const transaction = payload.transaction;

    if (!transaction) return;
    if (transaction.type !== "expense") return;

    const budgetWarning =
        await budgetUsageService.checkBudgetLimitAfterTransaction({
            workspaceId: payload.workspaceId,
            category: transaction.category,
            transactionDate: new Date(transaction.date),
        });

    if (
        !budgetWarning ||
        !["WARNING", "EXCEEDED"].includes(budgetWarning.status)
    ) {
        return;
    }

    const eventType =
        budgetWarning.status === "EXCEEDED"
            ? EventTypes.BUDGET_LIMIT_EXCEEDED
            : EventTypes.BUDGET_LIMIT_WARNING;

    eventBus.emit(eventType, {
        workspaceId: payload.workspaceId,
        category: budgetWarning.category,
        limit: budgetWarning.limit,
        usagePercentage: budgetWarning.usagePercentage,
        status: budgetWarning.status,
        budgetMonth: getYearMonth(transaction.date),
        actor: payload.actor,
    });
};

export const registerBudgetLimitEventHandlers = () => {
    eventBus.on<TransactionEventPayload>(
        EventTypes.TRANSACTION_CREATED,
        handleTransactionBudgetCheck,
    );

    eventBus.on<TransactionEventPayload>(
        EventTypes.TRANSACTION_UPDATED,
        handleTransactionBudgetCheck,
    );
};