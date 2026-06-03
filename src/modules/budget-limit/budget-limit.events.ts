import { eventBus } from "../../shared/event-bus/eventBus";
import { EventTypes } from "../../shared/events/eventTypes";

type BudgetLimitEventAction = "created" | "updated" | "deleted";

type BudgetLimitEventPayload = {
    workspaceId: string;
    budgetLimitId: string;
    category?: string;
    limit?: unknown;
    actor: {
        userId: string;
        email?: string;
    };
};

const getBudgetLimitEventType = (action: BudgetLimitEventAction) => {
    if (action === "created") return EventTypes.BUDGET_LIMIT_CREATED;
    if (action === "updated") return EventTypes.BUDGET_LIMIT_UPDATED;
    return EventTypes.BUDGET_LIMIT_DELETED;
};

export const publishBudgetLimitEvent = (
    action: BudgetLimitEventAction,
    payload: BudgetLimitEventPayload,
) => {
    eventBus.emit(getBudgetLimitEventType(action), payload);
};