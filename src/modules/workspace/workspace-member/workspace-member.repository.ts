import { Types } from "mongoose";
import WorkspaceMember, {
    IWorkspaceMember,
} from "../../../models/workspace-member.model";
import { BaseRepository } from "../../../repository/mongoose/BaseRepository";
import { IWorkspaceMemberRepository } from "./workspace-member.repository.interface";
import { WorkspaceRole } from "../workspace.types";

export class WorkspaceMemberRepository
    extends BaseRepository<IWorkspaceMember>
    implements IWorkspaceMemberRepository {
    constructor() {
        super(WorkspaceMember);
    }

    async findByUserIdAndWorkspaceId(
        userId: Types.ObjectId,
        workspaceId: Types.ObjectId,
    ): Promise<IWorkspaceMember | null> {
        return this.model
            .findOne({
                userId,
                workspaceId,
            })
            .exec();
    }

    async findByWorkspaceIdAndUserId(
        workspaceId: Types.ObjectId,
        userId: Types.ObjectId,
    ): Promise<IWorkspaceMember | null> {
        return this.model
            .findOne({
                workspaceId,
                userId,
            })
            .exec();
    }

    async findByUserId(userId: Types.ObjectId): Promise<IWorkspaceMember[]> {
        return this.model
            .find({ userId })
            .populate("workspaceId")
            .sort({ createdAt: -1 })
            .exec();
    }

    async findByWorkspaceId(
        workspaceId: Types.ObjectId,
    ): Promise<IWorkspaceMember[]> {
        return this.model
            .find({ workspaceId })
            .populate("userId", "firstName lastName email avatarUrl")
            .sort({ createdAt: 1 })
            .exec();
    }

    async updateRoleById(
        memberId: string,
        role: Exclude<WorkspaceRole, "OWNER">,
    ): Promise<IWorkspaceMember | null> {
        return this.model
            .findByIdAndUpdate(
                memberId,
                { role },
                {
                    new: true,
                    runValidators: true,
                },
            )
            .populate("userId", "firstName lastName email avatarUrl")
            .exec();
    }
}