import { Types } from "mongoose";
import { IWorkspaceRepository } from "./workspace.repository.interface";
import { IWorkspaceMemberRepository } from "./workspace-member/workspace-member.repository.interface";

interface CreateDefaultWorkspaceParams {
    userId: Types.ObjectId;
    firstName: string;
}

interface CreateWorkspaceParams {
    userId: Types.ObjectId;
    name: string;
    description?: string;
}

export class WorkspaceService {
    constructor(
        private readonly workspaceRepository: IWorkspaceRepository,
        private readonly workspaceMemberRepository: IWorkspaceMemberRepository,
    ) { }

    async createDefaultWorkspaceForUser({
        userId,
        firstName,
    }: CreateDefaultWorkspaceParams) {
        const existingDefaultWorkspace =
            await this.workspaceRepository.findDefaultWorkspaceByOwnerId(userId);

        if (existingDefaultWorkspace) {
            return existingDefaultWorkspace;
        }

        const workspace = await this.workspaceRepository.create({
            name: `${firstName}'in Kişisel Bütçesi`,
            ownerId: userId,
            description: "Varsayılan kişisel workspace",
            isDefault: true,
        });

        await this.workspaceMemberRepository.create({
            workspaceId: workspace._id as Types.ObjectId,
            userId,
            role: "OWNER",
            invitedBy: undefined,
        });

        return workspace;
    }

    async getMyWorkspaces(userId: Types.ObjectId) {
        const memberships = await this.workspaceMemberRepository.findByUserId(userId);

        return memberships.map((membership) => {
            const workspace = membership.workspaceId as any;

            return {
                id: workspace._id.toString(),
                name: workspace.name,
                description: workspace.description,
                isDefault: workspace.isDefault,
                ownerId: workspace.ownerId.toString(),
                role: membership.role,
                createdAt: workspace.createdAt,
                updatedAt: workspace.updatedAt,
            };
        });
    }

    async createWorkspace({ userId, name, description }: CreateWorkspaceParams) {
        const workspace = await this.workspaceRepository.create({
            name,
            ownerId: userId,
            description: description || "",
            isDefault: false,
        });

        await this.workspaceMemberRepository.create({
            workspaceId: workspace._id as Types.ObjectId,
            userId,
            role: "OWNER",
            invitedBy: undefined,
        });

        return {
            id: workspace._id.toString(),
            name: workspace.name,
            description: workspace.description,
            isDefault: workspace.isDefault,
            ownerId: workspace.ownerId.toString(),
            role: "OWNER",
            createdAt: workspace.createdAt,
            updatedAt: workspace.updatedAt,
        };
    }
}