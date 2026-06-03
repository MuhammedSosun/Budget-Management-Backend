import { Document, Schema, model, Types } from "mongoose";
import { NotificationType, NotificationTypes } from "../modules/notification/notification.types";

export interface INotification extends Document {
    _id: Types.ObjectId;

    userId: Types.ObjectId;
    workspaceId?: Types.ObjectId;

    type: NotificationType;



    titleKey: string;
    messageKey: string;
    messageParams: Record<string, unknown>;

    isRead: boolean;
    readAt?: Date;

    metadata?: Record<string, unknown>;
    dedupeKey?: string;
    expiresAt: Date;

    createdAt: Date;
    updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        workspaceId: {
            type: Schema.Types.ObjectId,
            ref: "Workspace",
            required: false,
            index: true,
        },

        type: {
            type: String,
            enum: Object.values(NotificationTypes),
            required: true,
            index: true,
        },
        titleKey: {
            type: String,
            required: true,
            trim: true,
        },

        messageKey: {
            type: String,
            required: true,
            trim: true,
        },

        messageParams: {
            type: Schema.Types.Mixed,
            default: {},
        },
        isRead: {
            type: Boolean,
            default: false,
            index: true,
        },

        readAt: {
            type: Date,
            required: false,
        },

        metadata: {
            type: Schema.Types.Mixed,
            required: false,
            default: {},
        },
        dedupeKey: {
            type: String,
            required: false,
            unique: true,
            sparse: true,
            index: true,
        },

        expiresAt: {
            type: Date,
            required: true,

        },
    },
    {
        timestamps: true,
    },
);

notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

notificationSchema.index({
    userId: 1,
    isRead: 1,
    createdAt: -1,
});

export const NotificationModel = model<INotification>(
    "Notification",
    notificationSchema,
);