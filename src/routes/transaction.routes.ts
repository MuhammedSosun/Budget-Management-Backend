import { Router } from "express";
import {
  createTransaction,
  deleteTransaction,
  findAllTransactions,
  findTransactionById,
  getCategoryStats,
  getTrendStats,
  totalExpense,
  totalIncome,
  updateTransaction,
} from "../modules/transaction/transaction.controller";
import { validate } from "../middlewares/validations/validate.middleware";
import { TransactionSchema } from "../modules/transaction/transaciton.validation";
import { authMiddleware } from "../middlewares/Auth/AuthMiddleware";
import { requireWorkspaceRole } from "../middlewares/workspace/requireWorkspaceRole.middleware";

const router = Router({ mergeParams: true });

router.get(
  "/",
  authMiddleware,
  requireWorkspaceRole(["OWNER", "EDITOR", "VIEWER"]),
  findAllTransactions,
);

router.post(
  "/",
  authMiddleware,
  requireWorkspaceRole(["OWNER", "EDITOR"]),
  validate(TransactionSchema),
  createTransaction,
);

router.get(
  "/total-income",
  authMiddleware,
  requireWorkspaceRole(["OWNER", "EDITOR", "VIEWER"]),
  totalIncome,
);

router.get(
  "/total-expense",
  authMiddleware,
  requireWorkspaceRole(["OWNER", "EDITOR", "VIEWER"]),
  totalExpense,
);

router.get(
  "/category-stats",
  authMiddleware,
  requireWorkspaceRole(["OWNER", "EDITOR", "VIEWER"]),
  getCategoryStats,
);

router.get(
  "/trend-stats",
  authMiddleware,
  requireWorkspaceRole(["OWNER", "EDITOR", "VIEWER"]),
  getTrendStats,
);

router.get(
  "/:id",
  authMiddleware,
  requireWorkspaceRole(["OWNER", "EDITOR", "VIEWER"]),
  findTransactionById,
);

router.put(
  "/:id",
  authMiddleware,
  requireWorkspaceRole(["OWNER", "EDITOR"]),
  validate(TransactionSchema),
  updateTransaction,
);

router.delete(
  "/:id",
  authMiddleware,
  requireWorkspaceRole(["OWNER", "EDITOR"]),
  deleteTransaction,
);

export default router;
