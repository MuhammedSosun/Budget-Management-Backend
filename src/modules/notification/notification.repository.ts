import { Types, UpdateWriteOpResult } from "mongoose";
import { BaseRepository } from "../../repository/mongoose/BaseRepository";
import {
    INotification,
    NotificationModel,
} from "../../models/notification.model";
import { INotificationRepository } from "./notification.repository.interface";
import { CreateNotificationInput } from "./notification.types";

export class NotificationRepository
    extends BaseRepository<INotification>
    implements INotificationRepository {
    constructor() {
        super(NotificationModel);
    }

    async createNotification(
        input: CreateNotificationInput,
    ): Promise<INotification> {
        return await this.model.create({
            userId: new Types.ObjectId(input.userId),
            workspaceId: input.workspaceId
                ? new Types.ObjectId(input.workspaceId)
                : undefined,
            type: input.type,
            titleKey: input.titleKey,
            messageKey: input.messageKey,
            messageParams: input.messageParams ?? {},
            metadata: input.metadata ?? {},
            expiresAt: input.expiresAt,
            dedupeKey: input.dedupeKey,
        });
    }

    async findByUserId(
        userId: string,
        limit: number,
        offset: number,
    ): Promise<INotification[]> {
        return await this.model
            .find({
                userId: new Types.ObjectId(userId),
            })
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(limit)
            .exec();
    }

    async countUnreadByUserId(userId: string): Promise<number> {
        return await this.model
            .countDocuments({
                userId: new Types.ObjectId(userId),
                isRead: false,
            })
            .exec();
    }

    async markAsRead(
        notificationId: string,
        userId: string,
    ): Promise<INotification | null> {
        return await this.model
            .findOneAndUpdate(
                {
                    _id: new Types.ObjectId(notificationId),
                    userId: new Types.ObjectId(userId),
                },
                {
                    $set: {
                        isRead: true,
                        readAt: new Date(),
                    },
                },
                {
                    returnDocument: "after",
                },
            )
            .exec();
    }

    async markAllAsRead(userId: string): Promise<UpdateWriteOpResult> {
        return await this.model
            .updateMany(
                {
                    userId: new Types.ObjectId(userId),
                    isRead: false,
                },
                {
                    $set: {
                        isRead: true,
                        readAt: new Date(),
                    },
                },
            )
            .exec();
    }

    async deleteByIdAndUserId(
        notificationId: string,
        userId: string,
    ): Promise<INotification | null> {
        return await this.model
            .findOneAndDelete({
                _id: new Types.ObjectId(notificationId),
                userId: new Types.ObjectId(userId),
            })
            .exec();
    }
    async countByUserId(userId: string): Promise<number> {
        return await this.model
            .countDocuments({
                userId: new Types.ObjectId(userId),
            })
            .exec();
    }
    async findByDedupeKey(dedupeKey: string): Promise<INotification | null> {
        return await this.model.findOne({ dedupeKey }).exec();
    }
}

export const notificationRepository = new NotificationRepository();