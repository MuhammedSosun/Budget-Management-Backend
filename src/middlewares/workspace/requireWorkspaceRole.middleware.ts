import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { WorkspaceRole } from "../../models/workspace-member.model";
import { WorkspaceMemberRepository } from "../../modules/workspace/workspace-member/workspace-member.repository";
import { AppError } from "../../exceptions/AppError";
import { ErrorCode } from "../../exceptions/ErrorCodes";

const workspaceMemberRepository = new WorkspaceMemberRepository();

export const requireWorkspaceRole = (allowedRoles: WorkspaceRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      const workspaceId = req.params.workspaceId;

      if (!userId) {
        throw new AppError(ErrorCode.UNAUTHORIZED, 401);
      }

      if (!Types.ObjectId.isValid(userId)) {
        throw new AppError(ErrorCode.INVALID_OR_EXPIRED_TOKEN, 401);
      }

      if (!workspaceId) {
        throw new AppError(ErrorCode.WORKSPACE_NOT_FOUND, 400);
      }

      if (!Types.ObjectId.isValid(workspaceId as string)) {
        throw new AppError(ErrorCode.WORKSPACE_NOT_FOUND, 400);
      }

      const membership =
        await workspaceMemberRepository.findByUserIdAndWorkspaceId(
          new Types.ObjectId(userId),
          new Types.ObjectId(workspaceId as string),
        );

      if (!membership) {
        throw new AppError(ErrorCode.WORKSPACE_ACCESS_DENIED, 403);
      }

      if (!allowedRoles.includes(membership.role)) {
        throw new AppError(ErrorCode.FORBIDDEN, 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
