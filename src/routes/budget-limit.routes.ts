import { Router } from "express";
import { authMiddleware } from "../middlewares/Auth/AuthMiddleware";
import { requireWorkspaceRole } from "../middlewares/workspace/requireWorkspaceRole.middleware";
import { validate } from "../middlewares/validations/validate.middleware";
import {
  createBudgetLimit,
  deleteBudgetLimit,
  getBudgetLimitById,
  getBudgetLimits,
  updateBudgetLimit,
  getBudgetLimitUsageById,
  getBudgetLimitsSummary,
  getBudgetLimitsUsage,
} from "../modules/budget-limit/budget-limit.controller";
import {
  createBudgetLimitSchema,
  updateBudgetLimitSchema,
} from "../modules/budget-limit/budget-limit.validation";

const router = Router({ mergeParams: true });

router.get(
  "/",
  authMiddleware,
  requireWorkspaceRole(["OWNER", "EDITOR", "VIEWER"]),
  getBudgetLimits,
);

router.post(
  "/",
  authMiddleware,
  requireWorkspaceRole(["OWNER", "EDITOR"]),
  validate(createBudgetLimitSchema),
  createBudgetLimit,
);
router.get(
  "/usage",
  authMiddleware,
  requireWorkspaceRole(["OWNER", "EDITOR", "VIEWER"]),
  getBudgetLimitsUsage,
);
router.get(
  "/summary",
  authMiddleware,
  requireWorkspaceRole(["OWNER", "EDITOR", "VIEWER"]),
  getBudgetLimitsSummary,
);

router.get(
  "/:budgetLimitId/usage",
  authMiddleware,
  requireWorkspaceRole(["OWNER", "EDITOR", "VIEWER"]),
  getBudgetLimitUsageById,
);
router.get(
  "/:budgetLimitId",
  authMiddleware,
  requireWorkspaceRole(["OWNER", "EDITOR", "VIEWER"]),
  getBudgetLimitById,
);

router.patch(
  "/:budgetLimitId",
  authMiddleware,
  requireWorkspaceRole(["OWNER", "EDITOR"]),
  validate(updateBudgetLimitSchema),
  updateBudgetLimit,
);

router.delete(
  "/:budgetLimitId",
  authMiddleware,
  requireWorkspaceRole(["OWNER", "EDITOR"]),
  deleteBudgetLimit,
);

export default router;
