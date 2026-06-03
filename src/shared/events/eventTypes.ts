export const EventTypes = {
    TRANSACTION_CREATED: "transaction.created",
    TRANSACTION_UPDATED: "transaction.updated",
    TRANSACTION_DELETED: "transaction.deleted",

    BUDGET_LIMIT_CREATED: "budget-limit.created",
    BUDGET_LIMIT_UPDATED: "budget-limit.updated",
    BUDGET_LIMIT_DELETED: "budget-limit.deleted",
    BUDGET_LIMIT_WARNING: "budget-limit.warning",
    BUDGET_LIMIT_EXCEEDED: "budget-limit.exceeded",
    WORKSPACE_MEMBER_JOINED: "workspace-member.joined",
    WORKSPACE_MEMBER_REMOVED: "workspace-member.removed",
    WORKSPACE_MEMBER_ROLE_UPDATED: "workspace-member.role-updated",
    WORKSPACE_MEMBER_LEFT: "workspace-member.left",

    WORKSPACE_INVITATION_CREATED: "workspace-invitation.created",
    WORKSPACE_INVITATION_ACCEPTED: "workspace-invitation.accepted",
    WORKSPACE_INVITATION_REJECTED: "workspace-invitation.rejected",
} as const;

export type EventType = (typeof EventTypes)[keyof typeof EventTypes];