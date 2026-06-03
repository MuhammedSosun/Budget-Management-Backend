import { INotificationRepository } from "./notification.repository.interface";
import { CreateNotificationInput } from "./notification.types";

const DEFAULT_NOTIFICATION_RETENTION_DAYS = 90;

export class NotificationService {
    constructor(
        private readonly notificationRepository: INotificationRepository,
    ) { }

    async createNotification(input: Omit<CreateNotificationInput, "expiresAt">) {
        const expiresAt = this.getDefaultExpiresAt();

        if (input.dedupeKey) {
            const existingNotification =
                await this.notificationRepository.findByDedupeKey(input.dedupeKey);

            if (existingNotification) {
                return existingNotification;
            }
        }

        try {
            return await this.notificationRepository.createNotification({
                ...input,
                messageParams: input.messageParams ?? {},
                metadata: input.metadata ?? {},
                expiresAt,
            });
        } catch (error) {
            if (
                input.dedupeKey &&
                typeof error === "object" &&
                error !== null &&
                "code" in error &&
                error.code === 11000
            ) {
                const existingNotification =
                    await this.notificationRepository.findByDedupeKey(input.dedupeKey);

                if (existingNotification) {
                    return existingNotification;
                }
            }

            throw error;
        }
    }

    async createNotificationsForUsers({
        userIds,
        workspaceId,
        type,
        titleKey,
        messageKey,
        messageParams,
        metadata,
        dedupeKeyFactory,
    }: {
        userIds: string[];
        workspaceId?: string;
        type: CreateNotificationInput["type"];
        titleKey: string;
        messageKey: string;
        messageParams?: Record<string, unknown>;
        metadata?: Record<string, unknown>;
        dedupeKeyFactory?: (userId: string) => string;
    }) {
        const uniqueUserIds = [...new Set(userIds)];

        return Promise.all(
            uniqueUserIds.map((userId) =>
                this.createNotification({
                    userId,
                    workspaceId,
                    type,
                    titleKey,
                    messageKey,
                    messageParams,
                    metadata,
                    dedupeKey: dedupeKeyFactory?.(userId),
                }),
            ),
        );
    }

    async findAllByUserId(userId: string, limit: number, offset: number) {
        const [notifications, totalCount] = await Promise.all([
            this.notificationRepository.findByUserId(userId, limit, offset),
            this.notificationRepository.countByUserId(userId),
        ]);

        return {
            notifications,
            totalCount,
        };
    }

    async getUnreadCountByUserId(userId: string) {
        return await this.notificationRepository.countUnreadByUserId(userId);
    }

    async markAsRead(notificationId: string, userId: string) {
        return await this.notificationRepository.markAsRead(notificationId, userId);
    }

    async markAllAsRead(userId: string) {
        return await this.notificationRepository.markAllAsRead(userId);
    }

    async deleteNotification(notificationId: string, userId: string) {
        return await this.notificationRepository.deleteByIdAndUserId(
            notificationId,
            userId,
        );
    }

    private getDefaultExpiresAt() {
        const expiresAt = new Date();

        expiresAt.setDate(
            expiresAt.getDate() + DEFAULT_NOTIFICATION_RETENTION_DAYS,
        );

        return expiresAt;
    }
}