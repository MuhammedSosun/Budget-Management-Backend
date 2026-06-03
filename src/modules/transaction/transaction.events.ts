import { eventBus } from "../../shared/event-bus/eventBus";
import { EventTypes } from "../../shared/events/eventTypes";

type TransactionEventAction = "created" | "updated" | "deleted";

type TransactionEventPayload = {
  workspaceId: string;
  transaction?: any;
  transactionId?: string;
  action: TransactionEventAction;
  actor: {
    userId: string;
    email?: string;
  };
};

const getTransactionEventType = (action: TransactionEventAction) => {
  if (action === "created") return EventTypes.TRANSACTION_CREATED;
  if (action === "updated") return EventTypes.TRANSACTION_UPDATED;
  return EventTypes.TRANSACTION_DELETED;
};

export const publishTransactionEvent = (payload: TransactionEventPayload) => {
  const eventType = getTransactionEventType(payload.action);

  eventBus.emit(eventType, payload);
};