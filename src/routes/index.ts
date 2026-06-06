import { Application } from "express";
import authRoutes from "./auth.routes";
//import transactionRoutes from "./transaction.routes";
import userRoutes from "./user.routes";
import workspaceRoutes from "./workspace.routes";
import workspaceEventRoutes from "./workspace-events.routes";
import budgetLimitRoutes from "./budget-limit.routes";
import notificationRoutes from "./notification.routes";
import analyticsRoutes from "./analytics.routes"
import aiReviewRoutes from "./ai-review.routes"

export const setRoutes = (app: Application) => {
  app.use("/api/auth", authRoutes);
  //app.use("/api/transactions", transactionRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/workspaces", workspaceRoutes);
  app.use("/api/workspace-events", workspaceEventRoutes);
  app.use("/api/workspaces/:workspaceId/budget-limits", budgetLimitRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/workspaces/:workspaceId/analytics", analyticsRoutes);
  app.use("/api/workspaces/:workspaceId/ai-review", aiReviewRoutes);
};
