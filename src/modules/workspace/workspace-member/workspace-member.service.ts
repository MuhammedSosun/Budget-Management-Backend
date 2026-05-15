import { Types } from "mongoose";
import { AppError } from "../../../exceptions/AppError";
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
            throw new AppError("Workspace üyesi bulunamadı.", 404);
        }

        if (member.workspaceId.toString() !== workspaceId.toString()) {
            throw new AppError("Bu üye belirtilen workspace'e ait değil.", 400);
        }

        if (member.role === "OWNER") {
            throw new AppError("OWNER kullanıcısının rolü değiştirilemez.", 400);
        }

        const updatedMember = await this.workspaceMemberRepository.updateRoleById(
            memberId,
            role,
        );

        if (!updatedMember) {
            throw new AppError("Üye rolü güncellenemedi.", 500);
        }

        const user = updatedMember.userId as any;

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
            throw new AppError("Workspace üyesi bulunamadı.", 404);
        }

        if (member.workspaceId.toString() !== workspaceId.toString()) {
            throw new AppError("Bu üye belirtilen workspace'e ait değil.", 400);
        }

        if (member.role === "OWNER") {
            throw new AppError("OWNER workspace'ten çıkarılamaz.", 400);
        }

        if (member.userId.toString() === requestUserId.toString()) {
            throw new AppError("Kendinizi workspace'ten çıkaramazsınız.", 400);
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