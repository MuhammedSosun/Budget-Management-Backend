import { Types } from "mongoose";
import { AppError } from "../../../exceptions/AppError";
import { ErrorCode } from "../../../exceptions/ErrorCodes";
import { WorkspaceRole } from "../../../models/workspace-member.model";
import { IWorkspaceMemberRepository } from "./workspace-member.repository.interface";

interface UpdateWorkspaceMemberRoleParams {
    workspaceId: Types.ObjectId;
    memberId: string;
    role: Exclude<WorkspaceRole, "OWNER">;
}

interface RemoveWorkspaceMemberParams {
    workspaceId: Types.ObjectId;
    memberId: string;
    requestUserId: Types.ObjectId;
}

export class WorkspaceMemberService {
    constructor(
        private readonly workspaceMemberRepository: IWorkspaceMemberRepository,
    ) { }

    async getWorkspaceMembers(workspaceId: Types.ObjectId) {
        const members = await this.workspaceMemberRepository.findByWorkspaceId(
            workspaceId,
        );

        return members.map((member) => {
            const user = member.userId as any;

            if (!user?._id) {
                throw new AppError(ErrorCode.WORKSPACE_MEMBER_USER_NOT_FOUND, 404);
            }

            return {
                id: member._id.toString(),
                workspaceId: member.workspaceId.toString(),
                user: {
                    id: user._id.toString(),
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    avatarUrl: user.avatarUrl || "",
                },
                role: member.role,
                invitedBy: member.invitedBy?.toString(),
                createdAt: member.createdAt,
                updatedAt: member.updatedAt,
            };
        });
    }

    async updateWorkspaceMemberRole({
        workspaceId,
        memberId,
        role,
    }: UpdateWorkspaceMemberRoleParams) {
        const member = await this.workspaceMemberRepository.findById(memberId);

        if (!member) {
            throw new AppError(ErrorCode.WORKSPACE_MEMBER_NOT_FOUND, 404);
        }

        if (member.workspaceId.toString() !== workspaceId.toString()) {
            throw new AppError(ErrorCode.WORKSPACE_MEMBER_NOT_IN_WORKSPACE, 400);
        }

        if (member.role === "OWNER") {
            throw new AppError(ErrorCode.OWNER_ROLE_CANNOT_BE_CHANGED, 400);
        }

        const updatedMember = await this.workspaceMemberRepository.updateRoleById(
            memberId,
            role,
        );

        if (!updatedMember) {
            throw new AppError(ErrorCode.WORKSPACE_MEMBER_ROLE_UPDATE_FAILED, 500);
        }

        const user = updatedMember.userId as any;

        if (!user?._id) {
            throw new AppError(ErrorCode.WORKSPACE_MEMBER_USER_NOT_FOUND, 404);
        }

        return {
            id: updatedMember._id.toString(),
            workspaceId: updatedMember.workspaceId.toString(),
            user: {
                id: user._id.toString(),
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                avatarUrl: user.avatarUrl || "",
            },
            role: updatedMember.role,
            invitedBy: updatedMember.invitedBy?.toString(),
            createdAt: updatedMember.createdAt,
            updatedAt: updatedMember.updatedAt,
        };
    }

    async removeWorkspaceMember({
        workspaceId,
        memberId,
        requestUserId,
    }: RemoveWorkspaceMemberParams) {
        const member = await this.workspaceMemberRepository.findById(memberId);

        if (!member) {
            throw new AppError(ErrorCode.WORKSPACE_MEMBER_NOT_FOUND, 404);
        }

        if (member.workspaceId.toString() !== workspaceId.toString()) {
            throw new AppError(ErrorCode.WORKSPACE_MEMBER_NOT_IN_WORKSPACE, 400);
        }

        if (member.role === "OWNER") {
            throw new AppError(ErrorCode.OWNER_CANNOT_BE_REMOVED, 400);
        }

        if (member.userId.toString() === requestUserId.toString()) {
            throw new AppError(
                ErrorCode.CANNOT_REMOVE_YOURSELF_FROM_WORKSPACE,
                400,
            );
        }

        await this.workspaceMemberRepository.delete(memberId);

        return {
            id: member._id.toString(),
            workspaceId: member.workspaceId.toString(),
            userId: member.userId.toString(),
            role: member.role,
        };
    }
}