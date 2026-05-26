import { sendWorkspaceEvent } from "../../utils/sse";

type TransactionEventAction = "created" | "updated" | "deleted";

interface PublishTransactionEventParams {
    workspaceId: string;
    action: TransactionEventAction;
    transaction?: unknown;
    transactionId?: string;
    actor: {
        userId: string;
        email: string;
    };
}

export const publishTransactionEvent = ({
    workspaceId,
    action,
    transaction,
    transactionId,
    actor,
}: PublishTransactionEventParams) => {
    sendWorkspaceEvent({
        type: `transaction:${action}`,
        workspaceId,
        actorUserId: actor.userId,
        data: {
            action,
            transaction,
            transactionId,
            actor,
        },
    });
};