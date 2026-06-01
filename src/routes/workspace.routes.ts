import { Router } from "express";
import { authMiddleware } from "../middlewares/Auth/AuthMiddleware";
import {
  createWorkspace,
  getMyWorkspaces,
  getWorkspaceMembers,
  updateWorkspaceMemberRole,
  removeWorkspaceMember,
  createWorkspaceInvitation,
  acceptWorkspaceInvitation,
  rejectWorkspaceInvitation,
  getWorkspaceInvitations,
  getMyPendingWorkspaceInvitations,
  deleteWorkspace,
  updateWorkspace,
  leaveWorkspace,
} from "../modules/workspace/workspace.controller";
import { requireWorkspaceRole } from "../middlewares/workspace/requireWorkspaceRole.middleware";
import transactionRoutes from "./transaction.routes";
import { validate } from "../middlewares/validations/validate.middleware";
import {
  updateWorkspaceMemberRoleSchema,
  updateWorkspaceSchema,
} from "../modules/workspace/workspace.validation";

const router = Router();

router.get("/", authMiddleware, getMyWorkspaces);

router.post("/", authMiddleware, createWorkspace);

router.get("/invitations/my", authMiddleware, getMyPendingWorkspaceInvitations);

router.post(
  "/invitations/:token/accept",
  authMiddleware,
  acceptWorkspaceInvitation,
);

router.post(
  "/invitations/:token/reject",
  authMiddleware,
  rejectWorkspaceInvitation,
);

router.use("/:workspaceId/transactions", transactionRoutes);

router.get(
  "/:workspaceId/check-owner",
  authMiddleware,
  requireWorkspaceRole(["OWNER"]),
  (req, res) => {
    return res.status(200).json({
      message: "Bu workspace üzerinde OWNER yetkiniz var.",
    });
  },
);

router.get(
  "/:workspaceId/members",
  authMiddleware,
  requireWorkspaceRole(["OWNER", "EDITOR", "VIEWER"]),
  getWorkspaceMembers,
);

router.patch(
  "/:workspaceId/members/:memberId",
  authMiddleware,
  requireWorkspaceRole(["OWNER"]),
  validate(updateWorkspaceMemberRoleSchema),
  updateWorkspaceMemberRole,
);

router.delete(
  "/:workspaceId/members/:memberId",
  authMiddleware,
  requireWorkspaceRole(["OWNER"]),
  removeWorkspaceMember,
);

router.post(
  "/:workspaceId/invitations",
  authMiddleware,
  requireWorkspaceRole(["OWNER"]),
  createWorkspaceInvitation,
);

router.get(
  "/:workspaceId/invitations",
  authMiddleware,
  requireWorkspaceRole(["OWNER"]),
  getWorkspaceInvitations,
);
router.delete(
  "/:workspaceId",
  authMiddleware,
  requireWorkspaceRole(["OWNER"]),
  deleteWorkspace,
);

router.patch(
  "/:workspaceId",
  authMiddleware,
  requireWorkspaceRole(["OWNER"]),
  validate(updateWorkspaceSchema),
  updateWorkspace,
);

router.delete("/:workspaceId/leave", authMiddleware, leaveWorkspace);

export default router;
