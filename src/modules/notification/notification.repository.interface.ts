import { UpdateWriteOpResult } from "mongoose";
import { IBaseRepository } from "../../repository/IBaseRepository";
import { INotification } from "../../models/notification.model";
import { CreateNotificationInput } from "./notification.types";



export interface INotificationRepository
    extends IBaseRepository<INotification> {
    createNotification(input: CreateNotificationInput): Promise<INotification>;

    findByUserId(
        userId: string,
        limit: number,
        offset: number,
    ): Promise<INotification[]>;

    countByUserId(userId: string): Promise<number>;

    countUnreadByUserId(userId: string): Promise<number>;

    markAsRead(
        notificationId: string,
        userId: string,
    ): Promise<INotification | null>;

    markAllAsRead(userId: string): Promise<UpdateWriteOpResult>;

    deleteByIdAndUserId(
        notificationId: string,
        userId: string,
    ): Promise<INotification | null>;
    findByDedupeKey(dedupeKey: string): Promise<INotification | null>;
}