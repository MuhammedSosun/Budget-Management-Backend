import { randomBytes } from "crypto";
import { Types } from "mongoose";
import { AppError } from "../../../exceptions/AppError";
import { WorkspaceRole } from "../../../models/workspace-member.model";
import { IUserRepository } from "../../user/user.repository.interface";
import { IWorkspaceMemberRepository } from "../workspace-member/workspace-member.repository.interface";
import { IWorkspaceInvitationRepository } from "./workspace-invitation.repository.interface";

interface CreateWorkspaceInvitationParams {
    workspaceId: Types.ObjectId;
    invitedByUserId: Types.ObjectId;
    email: string;
    role: Exclude<WorkspaceRole, "OWNER">;
}

interface AcceptWorkspaceInvitationParams {
    token: string;
    userId: Types.ObjectId;
    userEmail: string;
}

interface RejectWorkspaceInvitationParams {
    token: string;
    userEmail: string;
}

export class WorkspaceInvitationService {
    constructor(
        private readonly workspaceInvitationRepository: IWorkspaceInvitationRepository,
        private readonly workspaceMemberRepository: IWorkspaceMemberRepository,
        private readonly userRepository: IUserRepository,
    ) { }

    async createWorkspaceInvitation({
        workspaceId,
        invitedByUserId,
        email,
        role,
    }: CreateWorkspaceInvitationParams) {
        const normalizedEmail = email.toLowerCase().trim();

        const invitedUser = await this.userRepository.findByEmail(normalizedEmail);

        if (!invitedUser) {
            throw new AppError("Bu e-posta adresine sahip kullanıcı bulunamadı.", 404);
        }

        const invitedUserId = invitedUser._id as Types.ObjectId;

        if (invitedUserId.toString() === invitedByUserId.toString()) {
            throw new AppError("Kendinize davet gönderemezsiniz.", 400);
        }

        const existingMember =
            await this.workspaceMemberRepository.findByWorkspaceIdAndUserId(
                workspaceId,
                invitedUserId,
            );

        if (existingMember) {
            throw new AppError("Bu kullanıcı zaten workspace üyesi.", 409);
        }

        const existingPendingInvitation =
            await this.workspaceInvitationRepository.findPendingByWorkspaceIdAndEmail(
                workspaceId,
                normalizedEmail,
            );

        if (existingPendingInvitation) {
            throw new AppError("Bu kullanıcı için zaten bekleyen bir davet var.", 409);
        }

        const token = randomBytes(32).toString("hex");

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const invitation = await this.workspaceInvitationRepository.create({
            workspaceId,
            email: normalizedEmail,
            role,
            invitedBy: invitedByUserId,
            token,
            status: "PENDING",
            expiresAt,
        });

        return {
            id: invitation._id.toString(),
            workspaceId: invitation.workspaceId.toString(),
            email: invitation.email,
            role: invitation.role,
            invitedBy: invitation.invitedBy.toString(),
            token: invitation.token,
            status: invitation.status,
            expiresAt: invitation.expiresAt,
            createdAt: invitation.createdAt,
            updatedAt: invitation.updatedAt,
        };
    }

    async acceptWorkspaceInvitation({
        token,
        userId,
        userEmail,
    }: AcceptWorkspaceInvitationParams) {
        const invitation = await this.workspaceInvitationRepository.findByToken(token);

        if (!invitation) {
            throw new AppError("Davet bulunamadı.", 404);
        }

        if (invitation.status !== "PENDING") {
            throw new AppError("Bu davet artık geçerli değil.", 400);
        }

        if (invitation.expiresAt.getTime() < Date.now()) {
            await this.workspaceInvitationRepository.updateStatusById(
                invitation._id.toString(),
                "EXPIRED",
            );

            throw new AppError("Davetin süresi dolmuş.", 410);
        }

        const normalizedUserEmail = userEmail.toLowerCase().trim();

        if (invitation.email !== normalizedUserEmail) {
            throw new AppError("Bu davet bu kullanıcıya ait değil.", 403);
        }

        const existingMember =
            await this.workspaceMemberRepository.findByWorkspaceIdAndUserId(
                invitation.workspaceId as Types.ObjectId,
                userId,
            );

        if (existingMember) {
            await this.workspaceInvitationRepository.updateStatusById(
                invitation._id.toString(),
                "ACCEPTED",
                "acceptedAt",
            );

            return {
                message: "Kullanıcı zaten workspace üyesi.",
                workspaceId: invitation.workspaceId.toString(),
                role: existingMember.role,
            };
        }

        const member = await this.workspaceMemberRepository.create({
            workspaceId: invitation.workspaceId as Types.ObjectId,
            userId,
            role: invitation.role,
            invitedBy: invitation.invitedBy as Types.ObjectId,
        });

        await this.workspaceInvitationRepository.updateStatusById(
            invitation._id.toString(),
            "ACCEPTED",
            "acceptedAt",
        );

        return {
            id: member._id.toString(),
            workspaceId: member.workspaceId.toString(),
            userId: member.userId.toString(),
            role: member.role,
            invitedBy: member.invitedBy?.toString(),
            createdAt: member.createdAt,
            updatedAt: member.updatedAt,
        };
    }

    async rejectWorkspaceInvitation({
        token,
        userEmail,
    }: RejectWorkspaceInvitationParams) {
        const invitation = await this.workspaceInvitationRepository.findByToken(token);

        if (!invitation) {
            throw new AppError("Davet bulunamadı.", 404);
        }

        if (invitation.status !== "PENDING") {
            throw new AppError("Bu davet artık geçerli değil.", 400);
        }

        if (invitation.expiresAt.getTime() < Date.now()) {
            await this.workspaceInvitationRepository.updateStatusById(
                invitation._id.toString(),
                "EXPIRED",
            );

            throw new AppError("Davetin süresi dolmuş.", 410);
        }

        const normalizedUserEmail = userEmail.toLowerCase().trim();

        if (invitation.email !== normalizedUserEmail) {
            throw new AppError("Bu davet bu kullanıcıya ait değil.", 403);
        }

        const updatedInvitation =
            await this.workspaceInvitationRepository.updateStatusById(
                invitation._id.toString(),
                "REJECTED",
                "rejectedAt",
            );

        if (!updatedInvitation) {
            throw new AppError("Davet reddedilemedi.", 500);
        }

        return {
            id: updatedInvitation._id.toString(),
            workspaceId: updatedInvitation.workspaceId.toString(),
            email: updatedInvitation.email,
            role: updatedInvitation.role,
            status: updatedInvitation.status,
            rejectedAt: updatedInvitation.rejectedAt,
        };
    }

    async getWorkspaceInvitations(workspaceId: Types.ObjectId) {
        const invitations =
            await this.workspaceInvitationRepository.findByWorkspaceId(workspaceId);

        return invitations.map((invitation) => ({
            id: invitation._id.toString(),
            workspaceId: invitation.workspaceId.toString(),
            email: invitation.email,
            role: invitation.role,
            status: invitation.status,
            invitedBy: invitation.invitedBy.toString(),
            expiresAt: invitation.expiresAt,
            acceptedAt: invitation.acceptedAt,
            rejectedAt: invitation.rejectedAt,
            createdAt: invitation.createdAt,
            updatedAt: invitation.updatedAt,
        }));
    }

    async getMyPendingInvitations(userEmail: string) {
        const invitations =
            await this.workspaceInvitationRepository.findPendingByEmail(userEmail);

        return invitations.map((invitation) => {
            const workspace = invitation.workspaceId as any;

            return {
                id: invitation._id.toString(),
                workspace: {
                    id: workspace._id.toString(),
                    name: workspace.name,
                    description: workspace.description,
                    isDefault: workspace.isDefault,
                    ownerId: workspace.ownerId.toString(),
                },
                email: invitation.email,
                role: invitation.role,
                status: invitation.status,
                invitedBy: invitation.invitedBy.toString(),
                expiresAt: invitation.expiresAt,
                createdAt: invitation.createdAt,
                updatedAt: invitation.updatedAt,
                token: invitation.token,
            };
        });
    }
}