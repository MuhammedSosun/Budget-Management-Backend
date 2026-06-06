import { Router } from "express";
import { authMiddleware } from "../middlewares/Auth/AuthMiddleware";
import { requireWorkspaceRole } from "../middlewares/workspace/requireWorkspaceRole.middleware";
import { generateMonthlyAIReview } from "../modules/ai-review/ai-review.controller";

const router = Router({ mergeParams: true });

router.post(
    "/monthly",
    authMiddleware,
    requireWorkspaceRole(["OWNER", "EDITOR", "VIEWER"]),
    generateMonthlyAIReview,
);

export default router;