import { Router } from "express";
import { authMiddleware } from "../middlewares/Auth/AuthMiddleware";
import { requireWorkspaceRole } from "../middlewares/workspace/requireWorkspaceRole.middleware";
import {
    addWorkspaceClient,
    removeWorkspaceClient,
} from "../utils/sse";

const router = Router();

router.get(
    "/:workspaceId/events",
    authMiddleware,
    requireWorkspaceRole(["OWNER", "EDITOR", "VIEWER"]),
    (req, res) => {
        const { workspaceId } = req.params;
        const userId = req.user.userId;

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.setHeader("X-Accel-Buffering", "no");

        res.flushHeaders?.();

        res.write("event: connected\n");
        res.write(
            `data: ${JSON.stringify({
                message: "Workspace event stream connected",
                workspaceId,
            })}\n\n`,
        );

        addWorkspaceClient(workspaceId as string, userId, res);

        const heartbeat = setInterval(() => {
            res.write(": heartbeat\n\n");
        }, 30000);

        req.on("close", () => {
            clearInterval(heartbeat);
            removeWorkspaceClient(workspaceId as string, res);
        });
    },
);

export default router;