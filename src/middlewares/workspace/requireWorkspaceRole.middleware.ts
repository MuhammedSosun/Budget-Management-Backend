import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { WorkspaceRole } from "../../models/workspace-member.model";
import { WorkspaceMemberRepository } from "../../modules/workspace/workspace-member/workspace-member.repository";
import { AppError } from "../../exceptions/AppError";

const workspaceMemberRepository = new WorkspaceMemberRepository();

export const requireWorkspaceRole = (allowedRoles: WorkspaceRole[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId;
            const workspaceId = req.params.workspaceId;

            if (!userId) {
                throw new AppError("Kullanıcı bilgisi bulunamadı.", 401);
            }

            if (!Types.ObjectId.isValid(userId)) {
                throw new AppError("Geçersiz kullanıcı id.", 401);
            }

            if (!workspaceId) {
                throw new AppError("Workspace bilgisi zorunludur.", 400);
            }

            if (!Types.ObjectId.isValid(workspaceId as string)) {
                throw new AppError("Geçersiz workspace id.", 400);
            }

            const membership =
                await workspaceMemberRepository.findByUserIdAndWorkspaceId(
                    new Types.ObjectId(userId),
                    new Types.ObjectId(workspaceId as string),
                );

            if (!membership) {
                throw new AppError("Bu workspace'e erişim yetkiniz yok.", 403);
            }

            if (!allowedRoles.includes(membership.role)) {
                throw new AppError("Bu işlem için yetkiniz yok.", 403);
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};