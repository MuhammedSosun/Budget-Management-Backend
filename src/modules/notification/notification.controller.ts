import { NextFunction, Request, Response } from "express";
import getPagination from "../../utils/pageable";
import { NotificationRepository } from "./notification.repository";
import { NotificationService } from "./notification.service";
import { AppError } from "../../exceptions/AppError";
import { ErrorCode } from "../../exceptions/ErrorCodes";

const notificationRepository = new NotificationRepository();

const notificationService = new NotificationService(notificationRepository);

export const findAllNotifications = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const userId = req.user.userId as string;

        const paginationParams = {
            page: req.query.page as string,
            size: (req.query.pageSize as string) || (req.query.size as string),
        };

        const { limit, offset, page, size } = getPagination(paginationParams);

        const { notifications, totalCount } =
            await notificationService.findAllByUserId(userId, limit, offset);

        res.status(200).json({
            message: "Bildirimler listelendi",
            data: {
                content: notifications,
                currentPage: page,
                pageSize: size,
                totalElements: totalCount,
                totalPages: Math.ceil(totalCount / size),
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getUnreadNotificationCount = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const userId = req.user.userId as string;

        const unreadCount =
            await notificationService.getUnreadCountByUserId(userId);

        res.status(200).json({
            message: "Okunmamış bildirim sayısı bulundu",
            data: {
                unreadCount,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const markNotificationAsRead = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const userId = req.user.userId as string;
        const notificationId = req.params.id as string;

        const notification = await notificationService.markAsRead(
            notificationId,
            userId,
        );

        if (!notification) {
            throw new AppError(ErrorCode.NOTIFICATION_NOT_FOUND, 404);
        }

        res.status(200).json({
            message: "Bildirim okundu olarak işaretlendi",
            data: notification,
        });
    } catch (error) {
        next(error);
    }
};

export const markAllNotificationsAsRead = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const userId = req.user.userId as string;

        const result = await notificationService.markAllAsRead(userId);

        res.status(200).json({
            message: "Tüm bildirimler okundu olarak işaretlendi",
            data: {
                modifiedCount: result.modifiedCount,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const deleteNotification = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const userId = req.user.userId as string;
        const notificationId = req.params.id as string;

        const deletedNotification = await notificationService.deleteNotification(
            notificationId,
            userId,
        );

        if (!deletedNotification) {
            throw new AppError(ErrorCode.NOTIFICATION_NOT_FOUND, 404);
        }

        res.status(200).json({
            message: "Bildirim silindi",
            data: {
                id: deletedNotification._id.toString(),
            },
        });
    } catch (error) {
        next(error);
    }
};