import { Types } from "mongoose";
import {
    IWorkspaceMember,
    WorkspaceRole,
} from "../../../models/workspace-member.model";
import { IBaseRepository } from "../../../repository/IBaseRepository";

export interface IWorkspaceMemberRepository
    extends IBaseRepository<IWorkspaceMember> {
    findByUserIdAndWorkspaceId(
        userId: Types.ObjectId,
        workspaceId: Types.ObjectId,
    ): Promise<IWorkspaceMember | null>;

    findByUserId(userId: Types.ObjectId): Promise<IWorkspaceMember[]>;

    findByWorkspaceIdAndUserId(
        workspaceId: Types.ObjectId,
        userId: Types.ObjectId,
    ): Promise<IWorkspaceMember | null>;

    findByWorkspaceId(workspaceId: Types.ObjectId): Promise<IWorkspaceMember[]>;

    updateRoleById(
        memberId: string,
        role: Exclude<WorkspaceRole, "OWNER">,
    ): Promise<IWorkspaceMember | null>;
}