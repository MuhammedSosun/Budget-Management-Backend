import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";

import { WorkspaceRepository } from "./workspace.repository";
import { WorkspaceService } from "./workspace.service";
import { WorkspaceMemberRepository } from "./workspace-member/workspace-member.repository";
import { WorkspaceMemberService } from "./workspace-member/workspace-member.service";

import { WorkspaceInvitationRepository } from "./workspace-invitation/workspace-invitation.repository";
import { WorkspaceInvitationService } from "./workspace-invitation/workspace-invitation.service";
import { TransactionRepository } from "../transaction/transaction.repository";
import { UserRepository } from "../user/user.repository";
import {
    publishWorkspaceUpdatedEvent,
    publishWorkspaceDeletedEvent,
    publishMemberUpdatedEvent,
    publishMemberRemovedEvent,
    publishMemberJoinedEvent,
    publishInvitationCreatedEvent,
    publishInvitationAcceptedEvent,
    publishInvitationRejectedEvent,
} from "./workspace-event.publisher";

import {
    createWorkspaceSchema,
    createWorkspaceInvitationSchema,
    updateWorkspaceMemberRoleSchema,
    updateWorkspaceSchema,
} from "./workspace.validation";
import { AppError } from "../../exceptions/AppError";
import { ErrorCode } from "../../exceptions/ErrorCodes";
import { BudgetLimitRepository } from "../budget-limit/budget-limit.repository";
import { BudgetUsageService } from "../budget-limit/budget-usage.service";


const workspaceRepository = new WorkspaceRepository();
const workspaceMemberRepository = new WorkspaceMemberRepository();
const userRepository = new UserRepository();
const workspaceInvitationRepository = new WorkspaceInvitationRepository();
const transactionRepository = new TransactionRepository();
const budgetLimitRepository = new BudgetLimitRepository();
const budgetUsageService = new BudgetUsageService(
    budgetLimitRepository,
    transactionRepository
);
const workspaceService = new WorkspaceService(
    workspaceRepository,
    workspaceMemberRepository,
    workspaceInvitationRepository,
    transactionRepository,
    budgetLimitRepository,
    budgetUsageService

);

const workspaceMemberService = new WorkspaceMemberService(
    workspaceMemberRepository,
);

const workspaceInvitationService = new WorkspaceInvitationService(
    workspaceInvitationRepository,
    workspaceMemberRepository,
    userRepository,
);

export const getMyWorkspaces = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const userId = new Types.ObjectId(req.user.userId);

        const workspaces = await workspaceService.getMyWorkspaces(userId);

        return res.status(200).json({
            message: "Workspace listesi başarıyla getirildi.",
            data: workspaces,
        });
    } catch (error) {
        next(error);
    }
};

export const createWorkspace = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const parsedBody = createWorkspaceSchema.parse(req.body);
        const userId = new Types.ObjectId(req.user.userId);

        const workspace = await workspaceService.createWorkspace({
            userId,
            name: parsedBody.name,
            description: parsedBody.description,
        });

        return res.status(201).json({
            message: "Workspace başarıyla oluşturuldu.",
            data: workspace,
        });
    } catch (error) {
        next(error);
    }
};

export const getWorkspaceMembers = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const result = await workspaceMemberService.getWorkspaceMembers(
            new Types.ObjectId(req.params.workspaceId as string),
        );

        return res.status(200).json({
            message: "Workspace üyeleri listelendi",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const updateWorkspaceMemberRole = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const parsedBody = updateWorkspaceMemberRoleSchema.parse(req.body);
        const workspaceId = req.params.workspaceId as string;

        const result = await workspaceMemberService.updateWorkspaceMemberRole({
            workspaceId: new Types.ObjectId(workspaceId),
            memberId: req.params.memberId as string,
            role: parsedBody.role,
        });

        publishMemberUpdatedEvent({
            workspaceId,
            actorUserId: req.user.userId,
            targetUserId: result.user.id,
            member: result,
        });

        return res.status(200).json({
            message: "Workspace üye rolü güncellendi",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const removeWorkspaceMember = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const workspaceId = req.params.workspaceId as string;

        const result = await workspaceMemberService.removeWorkspaceMember({
            workspaceId: new Types.ObjectId(workspaceId),
            memberId: req.params.memberId as string,
            requestUserId: new Types.ObjectId(req.user.userId),
        });

        publishMemberRemovedEvent({
            workspaceId,
            actorUserId: req.user.userId,
            removedUserId: result.userId,
            member: result,
        });

        return res.status(200).json({
            message: "Workspace üyesi başarıyla çıkarıldı",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const createWorkspaceInvitation = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const parsedBody = createWorkspaceInvitationSchema.parse(req.body);
        const workspaceId = req.params.workspaceId as string;

        const result = await workspaceInvitationService.createWorkspaceInvitation({
            workspaceId: new Types.ObjectId(workspaceId),
            invitedByUserId: new Types.ObjectId(req.user.userId),
            email: parsedBody.email,
            role: parsedBody.role,
        });

        publishInvitationCreatedEvent({
            workspaceId,
            actorUserId: req.user.userId,
            invitation: result,
        });

        return res.status(201).json({
            message: "Workspace daveti oluşturuldu",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const acceptWorkspaceInvitation = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const result = await workspaceInvitationService.acceptWorkspaceInvitation({
            token: req.params.token as string,
            userId: new Types.ObjectId(req.user.userId),
            userEmail: req.user.email,
        });

        publishInvitationAcceptedEvent({
            workspaceId: result.workspaceId,
            actorUserId: req.user.userId,
            targetUserId: req.user.userId,
            invitation: result,
        });

        publishMemberJoinedEvent({
            workspaceId: result.workspaceId,
            actorUserId: req.user.userId,
            joinedUserId: req.user.userId,
            member: result,
        });

        return res.status(200).json({
            message: "Workspace daveti kabul edildi",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const rejectWorkspaceInvitation = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const result = await workspaceInvitationService.rejectWorkspaceInvitation({
            token: req.params.token as string,
            userEmail: req.user.email,
        });

        publishInvitationRejectedEvent({
            workspaceId: result.workspaceId,
            actorUserId: req.user.userId,
            targetUserId: req.user.userId,
            invitation: result,
        });

        return res.status(200).json({
            message: "Workspace daveti reddedildi",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const getWorkspaceInvitations = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const result = await workspaceInvitationService.getWorkspaceInvitations(
            new Types.ObjectId(req.params.workspaceId as string),
        );

        return res.status(200).json({
            message: "Workspace davetleri listelendi",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const getMyPendingWorkspaceInvitations = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const result = await workspaceInvitationService.getMyPendingInvitations(
            req.user.email,
        );

        return res.status(200).json({
            message: "Bekleyen workspace davetleri listelendi",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteWorkspace = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const workspaceId = req.params.workspaceId as string;

        if (!req.user?.userId) {
            throw new AppError(ErrorCode.USER_NOT_FOUND, 404);
        }

        const result = await workspaceService.deleteWorkspace({
            workspaceId,
            userId: req.user.userId,
        });

        publishWorkspaceDeletedEvent({
            workspaceId,
            actorUserId: req.user.userId,
            workspace: result,
        });

        return res.status(200).json({
            message: "Workspace başarıyla silindi.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const updateWorkspace = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const parsedBody = updateWorkspaceSchema.parse(req.body);
        const workspaceId = req.params.workspaceId as string;

        const result = await workspaceService.updateWorkspace({
            workspaceId,
            userId: req.user.userId,
            name: parsedBody.name,
            description: parsedBody.description,
        });

        publishWorkspaceUpdatedEvent({
            workspaceId,
            actorUserId: req.user.userId,
            workspace: result,
        });

        return res.status(200).json({
            message: "Workspace başarıyla güncellendi.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const leaveWorkspace = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const result = await workspaceService.leaveWorkspace({
            workspaceId: req.params.workspaceId as string,
            userId: req.user.userId,
        });

        return res.status(200).json({
            message: "Workspace'ten başarıyla ayrıldınız.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};