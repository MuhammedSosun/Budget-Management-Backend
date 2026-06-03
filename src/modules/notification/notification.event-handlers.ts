import { eventBus } from "../../shared/event-bus/eventBus";
import { EventTypes } from "../../shared/events/eventTypes";
import { NotificationRepository } from "./notification.repository";
import { NotificationService } from "./notification.service";
import { NotificationTypes } from "./notification.types";
import { WorkspaceMemberRepository } from "../workspace/workspace-member/workspace-member.repository";
import { NotificationRecipientService } from "./notification-recipient.service";

const NotificationMessageKeys = {
    BUDGET_LIMIT_WARNING: {
        titleKey: "notification_message.budget_limit_warning.title",
        messageKey: "notification_message.budget_limit_warning.message",
    },
    BUDGET_LIMIT_EXCEEDED: {
        titleKey: "notification_message.budget_limit_exceeded.title",
        messageKey: "notification_message.budget_limit_exceeded.message",
    },
    BUDGET_LIMIT_CREATED: {
        titleKey: "notification_message.budget_limit_created.title",
        messageKey: "notification_message.budget_limit_created.message",
    },
    BUDGET_LIMIT_UPDATED: {
        titleKey: "notification_message.budget_limit_updated.title",
        messageKey: "notification_message.budget_limit_updated.message",
    },
    BUDGET_LIMIT_DELETED: {
        titleKey: "notification_message.budget_limit_deleted.title",
        messageKey: "notification_message.budget_limit_deleted.message",
    },

    TRANSACTION_CREATED: {
        titleKey: "notification_message.transaction_created.title",
        messageKey: "notification_message.transaction_created.message",
    },
    TRANSACTION_UPDATED: {
        titleKey: "notification_message.transaction_updated.title",
        messageKey: "notification_message.transaction_updated.message",
    },
    TRANSACTION_DELETED: {
        titleKey: "notification_message.transaction_deleted.title",
        messageKey: "notification_message.transaction_deleted.message",
    },

    WORKSPACE_MEMBER_JOINED: {
        titleKey: "notification_message.workspace_member_joined.title",
        messageKey: "notification_message.workspace_member_joined.message",
    },
    WORKSPACE_MEMBER_REMOVED: {
        titleKey: "notification_message.workspace_member_removed.title",
        messageKey: "notification_message.workspace_member_removed.message",
    },
    WORKSPACE_MEMBER_LEFT: {
        titleKey: "notification_message.workspace_member_left.title",
        messageKey: "notification_message.workspace_member_left.message",
    },
    WORKSPACE_MEMBER_ROLE_UPDATED: {
        titleKey: "notification_message.workspace_member_role_updated.title",
        messageKey: "notification_message.workspace_member_role_updated.message",
    },

    WORKSPACE_INVITATION_CREATED: {
        titleKey: "notification_message.workspace_invitation_created.title",
        messageKey: "notification_message.workspace_invitation_created.message",
    },
    WORKSPACE_INVITATION_ACCEPTED: {
        titleKey: "notification_message.workspace_invitation_accepted.title",
        messageKey: "notification_message.workspace_invitation_accepted.message",
    },
    WORKSPACE_INVITATION_REJECTED: {
        titleKey: "notification_message.workspace_invitation_rejected.title",
        messageKey: "notification_message.workspace_invitation_rejected.message",
    },
} as const;

const getNotificationMessageKeys = (
    type: keyof typeof NotificationMessageKeys,
) => {
    return NotificationMessageKeys[type];
};

type EventActor = {
    userId: string;
    email?: string;
};

type BudgetLimitNotificationPayload = {
    userId?: string;
    workspaceId: string;
    category?: string;
    limit?: unknown;
    usagePercentage?: number;
    status?: "WARNING" | "EXCEEDED" | string;
    budgetMonth?: string;
    budgetLimitId?: string;
    actor?: EventActor;
};

type TransactionNotificationPayload = {
    workspaceId: string;
    transaction?: {
        _id?: unknown;
        title?: string;
        type?: "income" | "expense";
        category?: string;
        input_details?: {
            amount?: number;
            currency?: string;
        };
    };
    transactionId?: string;
    action: "created" | "updated" | "deleted";
    actor: {
        userId: string;
        email?: string;
    };
};

type WorkspaceMemberNotificationPayload = {
    workspaceId: string;
    memberId?: string;
    targetUserId: string;
    targetUserEmail?: string;
    oldRole?: string;
    newRole?: string;
    actor: {
        userId: string;
        email?: string;
    };
};

type WorkspaceInvitationNotificationPayload = {
    workspaceId: string;
    invitationId?: string;
    invitedEmail: string;
    invitedUserId?: string;
    actor: {
        userId: string;
        email?: string;
    };
};

const createWorkspaceDedupeKey = ({
    type,
    userId,
    workspaceId,
    entityId,
    category,
    budgetMonth,
}: {
    type: string;
    userId: string;
    workspaceId: string;
    entityId?: string;
    category?: string;
    budgetMonth?: string;
}) => {
    return [
        type.toLowerCase(),
        userId,
        workspaceId,
        entityId ?? "no-entity",
        category ?? "no-category",
        budgetMonth ?? "no-month",
    ].join(":");
};

const getTransactionId = (payload: TransactionNotificationPayload) => {
    if (payload.transactionId) {
        return payload.transactionId;
    }

    const id = payload.transaction?._id;

    if (!id) {
        return undefined;
    }

    if (typeof id === "string") {
        return id;
    }

    if (
        typeof id === "object" &&
        id !== null &&
        "toString" in id &&
        typeof id.toString === "function"
    ) {
        return id.toString();
    }

    return undefined;
};

const notificationRepository = new NotificationRepository();
const notificationService = new NotificationService(notificationRepository);

const workspaceMemberRepository = new WorkspaceMemberRepository();
const notificationRecipientService = new NotificationRecipientService(
    workspaceMemberRepository,
);

export const registerNotificationEventHandlers = () => {
    eventBus.on<BudgetLimitNotificationPayload>(
        EventTypes.BUDGET_LIMIT_CREATED,
        async (payload) => {
            const recipients =
                await notificationRecipientService.resolveWorkspaceRecipients({
                    workspaceId: payload.workspaceId,
                    actorUserId: payload.actor?.userId,
                    includeActor: false,
                });

            const messageKeys = getNotificationMessageKeys(
                NotificationTypes.BUDGET_LIMIT_CREATED,
            );

            await notificationService.createNotificationsForUsers({
                userIds: recipients,
                workspaceId: payload.workspaceId,
                type: NotificationTypes.BUDGET_LIMIT_CREATED,

                titleKey: messageKeys.titleKey,
                messageKey: messageKeys.messageKey,
                messageParams: {
                    category: payload.category ?? "category",
                },

                metadata: {
                    budgetLimitId: payload.budgetLimitId,
                    category: payload.category,
                    limit: payload.limit,
                    actor: payload.actor,
                },

                dedupeKeyFactory: (userId) =>
                    createWorkspaceDedupeKey({
                        type: NotificationTypes.BUDGET_LIMIT_CREATED,
                        userId,
                        workspaceId: payload.workspaceId,
                        entityId: payload.budgetLimitId,
                    }),
            });
        },
    );

    eventBus.on<BudgetLimitNotificationPayload>(
        EventTypes.BUDGET_LIMIT_UPDATED,
        async (payload) => {
            const recipients =
                await notificationRecipientService.resolveWorkspaceRecipients({
                    workspaceId: payload.workspaceId,
                    actorUserId: payload.actor?.userId,
                    includeActor: false,
                });

            const messageKeys = getNotificationMessageKeys(
                NotificationTypes.BUDGET_LIMIT_UPDATED,
            );

            await notificationService.createNotificationsForUsers({
                userIds: recipients,
                workspaceId: payload.workspaceId,
                type: NotificationTypes.BUDGET_LIMIT_UPDATED,

                titleKey: messageKeys.titleKey,
                messageKey: messageKeys.messageKey,
                messageParams: {
                    category: payload.category ?? "category",
                },

                metadata: {
                    budgetLimitId: payload.budgetLimitId,
                    category: payload.category,
                    limit: payload.limit,
                    actor: payload.actor,
                },

                dedupeKeyFactory: (userId) =>
                    createWorkspaceDedupeKey({
                        type: NotificationTypes.BUDGET_LIMIT_UPDATED,
                        userId,
                        workspaceId: payload.workspaceId,
                        entityId: payload.budgetLimitId,
                    }),
            });
        },
    );

    eventBus.on<BudgetLimitNotificationPayload>(
        EventTypes.BUDGET_LIMIT_DELETED,
        async (payload) => {
            const recipients =
                await notificationRecipientService.resolveWorkspaceRecipients({
                    workspaceId: payload.workspaceId,
                    actorUserId: payload.actor?.userId,
                    includeActor: false,
                });

            const messageKeys = getNotificationMessageKeys(
                NotificationTypes.BUDGET_LIMIT_DELETED,
            );

            await notificationService.createNotificationsForUsers({
                userIds: recipients,
                workspaceId: payload.workspaceId,
                type: NotificationTypes.BUDGET_LIMIT_DELETED,

                titleKey: messageKeys.titleKey,
                messageKey: messageKeys.messageKey,
                messageParams: {
                    category: payload.category ?? "category",
                },

                metadata: {
                    budgetLimitId: payload.budgetLimitId,
                    category: payload.category,
                    limit: payload.limit,
                    actor: payload.actor,
                },

                dedupeKeyFactory: (userId) =>
                    createWorkspaceDedupeKey({
                        type: NotificationTypes.BUDGET_LIMIT_DELETED,
                        userId,
                        workspaceId: payload.workspaceId,
                        entityId: payload.budgetLimitId,
                    }),
            });
        },
    );

    eventBus.on<BudgetLimitNotificationPayload>(
        EventTypes.BUDGET_LIMIT_WARNING,
        async (payload) => {
            const recipients =
                await notificationRecipientService.resolveWorkspaceRecipients({
                    workspaceId: payload.workspaceId,
                    actorUserId: payload.actor?.userId,
                    includeActor: true,
                });

            const messageKeys = getNotificationMessageKeys(
                NotificationTypes.BUDGET_LIMIT_WARNING,
            );

            await notificationService.createNotificationsForUsers({
                userIds: recipients,
                workspaceId: payload.workspaceId,
                type: NotificationTypes.BUDGET_LIMIT_WARNING,

                titleKey: messageKeys.titleKey,
                messageKey: messageKeys.messageKey,
                messageParams: {
                    category: payload.category ?? "category",
                    usagePercentage: payload.usagePercentage,
                },

                metadata: {
                    category: payload.category,
                    limit: payload.limit,
                    usagePercentage: payload.usagePercentage,
                    actor: payload.actor,
                },

                dedupeKeyFactory: (userId) =>
                    createWorkspaceDedupeKey({
                        type: NotificationTypes.BUDGET_LIMIT_WARNING,
                        userId,
                        workspaceId: payload.workspaceId,
                        category: payload.category,
                        budgetMonth: payload.budgetMonth,
                    }),
            });
        },
    );

    eventBus.on<BudgetLimitNotificationPayload>(
        EventTypes.BUDGET_LIMIT_EXCEEDED,
        async (payload) => {
            const recipients =
                await notificationRecipientService.resolveWorkspaceRecipients({
                    workspaceId: payload.workspaceId,
                    actorUserId: payload.actor?.userId,
                    includeActor: true,
                });

            const messageKeys = getNotificationMessageKeys(
                NotificationTypes.BUDGET_LIMIT_EXCEEDED,
            );

            await notificationService.createNotificationsForUsers({
                userIds: recipients,
                workspaceId: payload.workspaceId,
                type: NotificationTypes.BUDGET_LIMIT_EXCEEDED,

                titleKey: messageKeys.titleKey,
                messageKey: messageKeys.messageKey,
                messageParams: {
                    category: payload.category ?? "category",
                    usagePercentage: payload.usagePercentage,
                },

                metadata: {
                    category: payload.category,
                    limit: payload.limit,
                    usagePercentage: payload.usagePercentage,
                    actor: payload.actor,
                },

                dedupeKeyFactory: (userId) =>
                    createWorkspaceDedupeKey({
                        type: NotificationTypes.BUDGET_LIMIT_EXCEEDED,
                        userId,
                        workspaceId: payload.workspaceId,
                        category: payload.category,
                        budgetMonth: payload.budgetMonth,
                    }),
            });
        },
    );
    eventBus.on<TransactionNotificationPayload>(
        EventTypes.TRANSACTION_CREATED,
        async (payload) => {
            const transactionId = getTransactionId(payload);

            const recipients =
                await notificationRecipientService.resolveWorkspaceRecipients({
                    workspaceId: payload.workspaceId,
                    actorUserId: payload.actor.userId,
                    includeActor: false,
                });

            const messageKeys = getNotificationMessageKeys(
                NotificationTypes.TRANSACTION_CREATED,
            );

            await notificationService.createNotificationsForUsers({
                userIds: recipients,
                workspaceId: payload.workspaceId,
                type: NotificationTypes.TRANSACTION_CREATED,

                titleKey: messageKeys.titleKey,
                messageKey: messageKeys.messageKey,
                messageParams: {
                    actorEmail: payload.actor.email ?? "A user",
                    category: payload.transaction?.category ?? "category",
                    amount: payload.transaction?.input_details?.amount,
                    currency: payload.transaction?.input_details?.currency,
                    transactionType: payload.transaction?.type ?? "transaction",
                    transactionTitle: payload.transaction?.title,
                },

                metadata: {
                    transactionId,
                    transaction: payload.transaction,
                    actor: payload.actor,
                },

                dedupeKeyFactory: (userId) =>
                    createWorkspaceDedupeKey({
                        type: NotificationTypes.TRANSACTION_CREATED,
                        userId,
                        workspaceId: payload.workspaceId,
                        entityId: transactionId,
                    }),
            });
        },
    );

    eventBus.on<TransactionNotificationPayload>(
        EventTypes.TRANSACTION_UPDATED,
        async (payload) => {
            const transactionId = getTransactionId(payload);

            const recipients =
                await notificationRecipientService.resolveWorkspaceRecipients({
                    workspaceId: payload.workspaceId,
                    actorUserId: payload.actor.userId,
                    includeActor: false,
                });

            const messageKeys = getNotificationMessageKeys(
                NotificationTypes.TRANSACTION_UPDATED,
            );

            await notificationService.createNotificationsForUsers({
                userIds: recipients,
                workspaceId: payload.workspaceId,
                type: NotificationTypes.TRANSACTION_UPDATED,

                titleKey: messageKeys.titleKey,
                messageKey: messageKeys.messageKey,
                messageParams: {
                    actorEmail: payload.actor.email ?? "A user",
                    transactionTitle: payload.transaction?.title ?? "transaction",
                    category: payload.transaction?.category,
                    amount: payload.transaction?.input_details?.amount,
                    currency: payload.transaction?.input_details?.currency,
                    transactionType: payload.transaction?.type,
                },

                metadata: {
                    transactionId,
                    transaction: payload.transaction,
                    actor: payload.actor,
                },

                dedupeKeyFactory: (userId) =>
                    createWorkspaceDedupeKey({
                        type: NotificationTypes.TRANSACTION_UPDATED,
                        userId,
                        workspaceId: payload.workspaceId,
                        entityId: transactionId,
                    }),
            });
        },
    );

    eventBus.on<TransactionNotificationPayload>(
        EventTypes.TRANSACTION_DELETED,
        async (payload) => {
            const transactionId = getTransactionId(payload);

            const recipients =
                await notificationRecipientService.resolveWorkspaceRecipients({
                    workspaceId: payload.workspaceId,
                    actorUserId: payload.actor.userId,
                    includeActor: false,
                });

            const messageKeys = getNotificationMessageKeys(
                NotificationTypes.TRANSACTION_DELETED,
            );

            await notificationService.createNotificationsForUsers({
                userIds: recipients,
                workspaceId: payload.workspaceId,
                type: NotificationTypes.TRANSACTION_DELETED,

                titleKey: messageKeys.titleKey,
                messageKey: messageKeys.messageKey,
                messageParams: {
                    actorEmail: payload.actor.email ?? "A user",
                    transactionId,
                },

                metadata: {
                    transactionId,
                    actor: payload.actor,
                },

                dedupeKeyFactory: (userId) =>
                    createWorkspaceDedupeKey({
                        type: NotificationTypes.TRANSACTION_DELETED,
                        userId,
                        workspaceId: payload.workspaceId,
                        entityId: transactionId,
                    }),
            });
        },
    );

    eventBus.on<WorkspaceMemberNotificationPayload>(
        EventTypes.WORKSPACE_MEMBER_JOINED,
        async (payload) => {
            const recipients =
                await notificationRecipientService.resolveWorkspaceRecipients({
                    workspaceId: payload.workspaceId,
                    actorUserId: payload.targetUserId,
                    includeActor: false,
                });

            const messageKeys = getNotificationMessageKeys(
                NotificationTypes.WORKSPACE_MEMBER_JOINED,
            );

            await notificationService.createNotificationsForUsers({
                userIds: recipients,
                workspaceId: payload.workspaceId,
                type: NotificationTypes.WORKSPACE_MEMBER_JOINED,

                titleKey: messageKeys.titleKey,
                messageKey: messageKeys.messageKey,
                messageParams: {
                    targetUserEmail: payload.targetUserEmail ?? "A user",
                },

                metadata: {
                    memberId: payload.memberId,
                    targetUserId: payload.targetUserId,
                    targetUserEmail: payload.targetUserEmail,
                    actor: payload.actor,
                },

                dedupeKeyFactory: (userId) =>
                    createWorkspaceDedupeKey({
                        type: NotificationTypes.WORKSPACE_MEMBER_JOINED,
                        userId,
                        workspaceId: payload.workspaceId,
                        entityId: payload.targetUserId,
                    }),
            });
        },
    );

    eventBus.on<WorkspaceMemberNotificationPayload>(
        EventTypes.WORKSPACE_MEMBER_REMOVED,
        async (payload) => {
            const recipients =
                await notificationRecipientService.resolveWorkspaceRecipients({
                    workspaceId: payload.workspaceId,
                    actorUserId: payload.actor.userId,
                    includeActor: false,
                    allowedRoles: ["OWNER", "EDITOR"],
                });

            const messageKeys = getNotificationMessageKeys(
                NotificationTypes.WORKSPACE_MEMBER_REMOVED,
            );

            await notificationService.createNotificationsForUsers({
                userIds: recipients,
                workspaceId: payload.workspaceId,
                type: NotificationTypes.WORKSPACE_MEMBER_REMOVED,

                titleKey: messageKeys.titleKey,
                messageKey: messageKeys.messageKey,
                messageParams: {
                    targetUserEmail: payload.targetUserEmail ?? "A user",
                },

                metadata: {
                    memberId: payload.memberId,
                    targetUserId: payload.targetUserId,
                    targetUserEmail: payload.targetUserEmail,
                    actor: payload.actor,
                },

                dedupeKeyFactory: (userId) =>
                    createWorkspaceDedupeKey({
                        type: NotificationTypes.WORKSPACE_MEMBER_REMOVED,
                        userId,
                        workspaceId: payload.workspaceId,
                        entityId: payload.targetUserId,
                    }),
            });
        },
    );

    eventBus.on<WorkspaceMemberNotificationPayload>(
        EventTypes.WORKSPACE_MEMBER_ROLE_UPDATED,
        async (payload) => {
            const recipients =
                await notificationRecipientService.resolveWorkspaceRecipients({
                    workspaceId: payload.workspaceId,
                    actorUserId: payload.actor.userId,
                    includeActor: false,
                    allowedRoles: ["OWNER"],
                });

            const finalRecipients = [
                ...new Set([...recipients, payload.targetUserId]),
            ].filter((userId) => userId !== payload.actor.userId);

            const messageKeys = getNotificationMessageKeys(
                NotificationTypes.WORKSPACE_MEMBER_ROLE_UPDATED,
            );

            await notificationService.createNotificationsForUsers({
                userIds: finalRecipients,
                workspaceId: payload.workspaceId,
                type: NotificationTypes.WORKSPACE_MEMBER_ROLE_UPDATED,

                titleKey: messageKeys.titleKey,
                messageKey: messageKeys.messageKey,
                messageParams: {
                    targetUserEmail: payload.targetUserEmail ?? "A user",
                    oldRole: payload.oldRole,
                    newRole: payload.newRole ?? "role",
                },

                metadata: {
                    memberId: payload.memberId,
                    targetUserId: payload.targetUserId,
                    targetUserEmail: payload.targetUserEmail,
                    oldRole: payload.oldRole,
                    newRole: payload.newRole,
                    actor: payload.actor,
                },

                dedupeKeyFactory: (userId) =>
                    createWorkspaceDedupeKey({
                        type: NotificationTypes.WORKSPACE_MEMBER_ROLE_UPDATED,
                        userId,
                        workspaceId: payload.workspaceId,
                        entityId: `${payload.targetUserId}:${payload.newRole}`,
                    }),
            });
        },
    );

    eventBus.on<WorkspaceMemberNotificationPayload>(
        EventTypes.WORKSPACE_MEMBER_LEFT,
        async (payload) => {
            const recipients =
                await notificationRecipientService.resolveWorkspaceRecipients({
                    workspaceId: payload.workspaceId,
                    actorUserId: payload.targetUserId,
                    includeActor: false,
                });

            const messageKeys = getNotificationMessageKeys(
                NotificationTypes.WORKSPACE_MEMBER_LEFT,
            );

            await notificationService.createNotificationsForUsers({
                userIds: recipients,
                workspaceId: payload.workspaceId,
                type: NotificationTypes.WORKSPACE_MEMBER_LEFT,

                titleKey: messageKeys.titleKey,
                messageKey: messageKeys.messageKey,
                messageParams: {
                    targetUserEmail: payload.targetUserEmail ?? "A user",
                },

                metadata: {
                    memberId: payload.memberId,
                    targetUserId: payload.targetUserId,
                    targetUserEmail: payload.targetUserEmail,
                    actor: payload.actor,
                },

                dedupeKeyFactory: (userId) =>
                    createWorkspaceDedupeKey({
                        type: NotificationTypes.WORKSPACE_MEMBER_LEFT,
                        userId,
                        workspaceId: payload.workspaceId,
                        entityId: `${payload.targetUserId}:${new Date()
                            .toISOString()
                            .slice(0, 10)}`,
                    }),
            });
        },
    );

    eventBus.on<WorkspaceInvitationNotificationPayload>(
        EventTypes.WORKSPACE_INVITATION_CREATED,
        async (payload) => {
            if (!payload.invitedUserId) {
                return;
            }

            const messageKeys = getNotificationMessageKeys(
                NotificationTypes.WORKSPACE_INVITATION_CREATED,
            );

            await notificationService.createNotification({
                userId: payload.invitedUserId,
                workspaceId: payload.workspaceId,
                type: NotificationTypes.WORKSPACE_INVITATION_CREATED,

                titleKey: messageKeys.titleKey,
                messageKey: messageKeys.messageKey,
                messageParams: {
                    actorEmail: payload.actor.email ?? "A user",
                    invitedEmail: payload.invitedEmail,
                },

                metadata: {
                    invitationId: payload.invitationId,
                    invitedEmail: payload.invitedEmail,
                    actor: payload.actor,
                },

                dedupeKey: createWorkspaceDedupeKey({
                    type: NotificationTypes.WORKSPACE_INVITATION_CREATED,
                    userId: payload.invitedUserId,
                    workspaceId: payload.workspaceId,
                    entityId: payload.invitationId ?? payload.invitedEmail,
                }),
            });
        },
    );

    eventBus.on<WorkspaceInvitationNotificationPayload>(
        EventTypes.WORKSPACE_INVITATION_ACCEPTED,
        async (payload) => {
            const recipients =
                await notificationRecipientService.resolveWorkspaceRecipients({
                    workspaceId: payload.workspaceId,
                    actorUserId: payload.actor.userId,
                    includeActor: false,
                    allowedRoles: ["OWNER", "EDITOR"],
                });

            const messageKeys = getNotificationMessageKeys(
                NotificationTypes.WORKSPACE_INVITATION_ACCEPTED,
            );

            await notificationService.createNotificationsForUsers({
                userIds: recipients,
                workspaceId: payload.workspaceId,
                type: NotificationTypes.WORKSPACE_INVITATION_ACCEPTED,

                titleKey: messageKeys.titleKey,
                messageKey: messageKeys.messageKey,
                messageParams: {
                    invitedEmail: payload.invitedEmail,
                    invitedUserId: payload.invitedUserId,
                },

                metadata: {
                    invitationId: payload.invitationId,
                    invitedEmail: payload.invitedEmail,
                    invitedUserId: payload.invitedUserId,
                    actor: payload.actor,
                },

                dedupeKeyFactory: (userId) =>
                    createWorkspaceDedupeKey({
                        type: NotificationTypes.WORKSPACE_INVITATION_ACCEPTED,
                        userId,
                        workspaceId: payload.workspaceId,
                        entityId: payload.invitationId ?? payload.invitedEmail,
                    }),
            });
        },
    );

    eventBus.on<WorkspaceInvitationNotificationPayload>(
        EventTypes.WORKSPACE_INVITATION_REJECTED,
        async (payload) => {
            const recipients =
                await notificationRecipientService.resolveWorkspaceRecipients({
                    workspaceId: payload.workspaceId,
                    actorUserId: payload.actor.userId,
                    includeActor: false,
                    allowedRoles: ["OWNER", "EDITOR"],
                });

            const messageKeys = getNotificationMessageKeys(
                NotificationTypes.WORKSPACE_INVITATION_REJECTED,
            );

            await notificationService.createNotificationsForUsers({
                userIds: recipients,
                workspaceId: payload.workspaceId,
                type: NotificationTypes.WORKSPACE_INVITATION_REJECTED,

                titleKey: messageKeys.titleKey,
                messageKey: messageKeys.messageKey,
                messageParams: {
                    invitedEmail: payload.invitedEmail,
                    invitedUserId: payload.invitedUserId,
                },

                metadata: {
                    invitationId: payload.invitationId,
                    invitedEmail: payload.invitedEmail,
                    invitedUserId: payload.invitedUserId,
                    actor: payload.actor,
                },

                dedupeKeyFactory: (userId) =>
                    createWorkspaceDedupeKey({
                        type: NotificationTypes.WORKSPACE_INVITATION_REJECTED,
                        userId,
                        workspaceId: payload.workspaceId,
                        entityId: payload.invitationId ?? payload.invitedEmail,
                    }),
            });
        },
    );
};