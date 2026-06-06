import { Router } from "express";
import { authMiddleware } from "../middlewares/Auth/AuthMiddleware";
import { requireWorkspaceRole } from "../middlewares/workspace/requireWorkspaceRole.middleware";
import { getCategoryBreakdown, getMemberSpending, getMonthComparison, getMonthlyReport, getMonthlySummary } from "../modules/analytics/analytics.controller";

const router = Router({ mergeParams: true });

router.get(
    "/monthly-summary",
    authMiddleware,
    requireWorkspaceRole(["OWNER", "EDITOR", "VIEWER"]),
    getMonthlySummary,
);
router.get(
    "/member-spending",
    authMiddleware,
    requireWorkspaceRole(["OWNER", "EDITOR", "VIEWER"]),
    getMemberSpending,
);
router.get(
    "/category-breakdown",
    authMiddleware,
    requireWorkspaceRole(["OWNER", "EDITOR", "VIEWER"]),
    getCategoryBreakdown,
);
router.get(
    "/month-comparison",
    authMiddleware,
    requireWorkspaceRole(["OWNER", "EDITOR", "VIEWER"]),
    getMonthComparison,
);
router.get(
    "/monthly-report",
    authMiddleware,
    requireWorkspaceRole(["OWNER", "EDITOR", "VIEWER"]),
    getMonthlyReport,
);
export default router;