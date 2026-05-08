import { Application } from "express";
import authRoutes from "./auth.routes";
import transactionRoutes from "./transaction.routes";
import userRoutes from "./user.routes";
export const setRoutes = (app: Application) => {
  app.use("/api/auth", authRoutes);
  app.use("/api/transactions", transactionRoutes);
  app.use("/api/users", userRoutes);
};
