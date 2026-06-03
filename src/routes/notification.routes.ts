import { Router } from "express";
import {
    deleteNotification,
    findAllNotifications,
    getUnreadNotificationCount,
    markAllNotificationsAsRead,
    markNotificationAsRead,
} from "../modules/notification/notification.controller";
import { authMiddleware } from "../middlewares/Auth/AuthMiddleware";

const router = Router();

router.get(
    "/",
    authMiddleware,
    findAllNotifications,
);

router.get(
    "/unread-count",
    authMiddleware,
    getUnreadNotificationCount,
);

router.patch(
    "/read-all",
    authMiddleware,
    markAllNotificationsAsRead,
);

router.patch(
    "/:id/read",
    authMiddleware,
    markNotificationAsRead,
);

router.delete(
    "/:id",
    authMiddleware,
    deleteNotification,
);

export default router;