import { Types } from "mongoose";
import { IWorkspaceRepository } from "./workspace.repository.interface";
import { IWorkspaceMemberRepository } from "./workspace-member/workspace-member.repository.interface";
import { IWorkspaceInvitationRepository } from "./workspace-invitation/workspace-invitation.repository.interface";
import { AppError } from "../../exceptions/AppError";
import { ErrorCode } from "../../exceptions/ErrorCodes";
import { ITransactionRepository } from "../transaction/transaction.repository.interface";
import { IBudgetLimitRepository } from "../budget-limit/budget-limit.repository.interface";
import { BudgetUsageService } from "../budget-limit/budget-usage.service";

interface CreateDefaultWorkspaceParams {
  userId: Types.ObjectId;
  firstName: string;
}

interface CreateWorkspaceParams {
  userId: Types.ObjectId;
  name: string;
  description?: string;
}

interface DeleteWorkspaceParams {
  workspaceId: string;
  userId: string;
}
interface UpdateWorkspaceParams {
  workspaceId: string;
  userId: string;
  name?: string;
  description?: string;
}

interface LeaveWorkspaceParams {
  workspaceId: string;
  userId: string;
}

export class WorkspaceService {
  constructor(
    private readonly workspaceRepository: IWorkspaceRepository,
    private readonly workspaceMemberRepository: IWorkspaceMemberRepository,
    private readonly workspaceInvitationRepository: IWorkspaceInvitationRepository,
    private readonly transactionRepository: ITransactionRepository,
    private readonly budgetLimitRepository: IBudgetLimitRepository,
    private readonly budgetUsageService: BudgetUsageService,
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

    if (!workspace?._id) {
      throw new AppError(ErrorCode.DEFAULT_WORKSPACE_CREATE_FAILED, 500);
    }

    const ownerMembership = await this.workspaceMemberRepository.create({
      workspaceId: workspace._id as Types.ObjectId,
      userId,
      role: "OWNER",
      invitedBy: undefined,
    });

    if (!ownerMembership?._id) {
      throw new AppError(ErrorCode.WORKSPACE_OWNER_MEMBER_CREATE_FAILED, 500);
    }

    return workspace;
  }

  async getMyWorkspaces(userId: Types.ObjectId) {
    const memberships =
      await this.workspaceMemberRepository.findByUserId(userId);

    return memberships
      .filter((membership) => Boolean(membership.workspaceId))
      .map((membership) => {
        const workspace = membership.workspaceId as any;

        if (!workspace?._id) {
          throw new AppError(ErrorCode.WORKSPACE_NOT_FOUND, 404);
        }

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

    if (!workspace?._id) {
      throw new AppError(ErrorCode.WORKSPACE_CREATE_FAILED, 500);
    }

    const ownerMembership = await this.workspaceMemberRepository.create({
      workspaceId: workspace._id as Types.ObjectId,
      userId,
      role: "OWNER",
      invitedBy: undefined,
    });

    if (!ownerMembership?._id) {
      throw new AppError(ErrorCode.WORKSPACE_OWNER_MEMBER_CREATE_FAILED, 500);
    }

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
  async deleteWorkspace({ workspaceId, userId }: DeleteWorkspaceParams) {
    const workspace = await this.workspaceRepository.findById(workspaceId);

    if (!workspace) {
      throw new AppError(ErrorCode.WORKSPACE_NOT_FOUND, 404);
    }



    const ownerMembership = await this.workspaceMemberRepository.findOne({
      workspaceId,
      userId,
      role: "OWNER",
    });

    if (!ownerMembership) {
      throw new AppError(ErrorCode.FORBIDDEN, 403);
    }

    await this.transactionRepository.deleteManyByWorkspaceId(workspaceId);

    await this.budgetLimitRepository.deleteManyByWorkspaceId(workspaceId);

    await this.workspaceInvitationRepository.deleteManyByWorkspaceId(
      workspaceId,
    );

    await this.workspaceMemberRepository.deleteManyByWorkspaceId(workspaceId);

    await this.workspaceRepository.delete(workspaceId);

    return {
      id: workspaceId,
    };
  }
  async updateWorkspace({
    workspaceId,
    userId,
    name,
    description,
  }: UpdateWorkspaceParams) {
    const workspace = await this.workspaceRepository.findById(workspaceId);

    if (!workspace) {
      throw new AppError(ErrorCode.WORKSPACE_NOT_FOUND, 404);
    }

    const ownerMembership = await this.workspaceMemberRepository.findOne({
      workspaceId,
      userId,
      role: "OWNER",
    });

    if (!ownerMembership) {
      throw new AppError(ErrorCode.FORBIDDEN, 403);
    }

    const updateData: {
      name?: string;
      description?: string;
    } = {};

    if (name !== undefined) {
      updateData.name = name;
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    const updatedWorkspace = await this.workspaceRepository.update(
      workspaceId,
      updateData,
    );

    if (!updatedWorkspace) {
      throw new AppError(ErrorCode.WORKSPACE_UPDATE_FAILED, 500);
    }

    return {
      id: updatedWorkspace._id.toString(),
      name: updatedWorkspace.name,
      description: updatedWorkspace.description,
      isDefault: updatedWorkspace.isDefault,
      ownerId: updatedWorkspace.ownerId.toString(),
      createdAt: updatedWorkspace.createdAt,
      updatedAt: updatedWorkspace.updatedAt,
    };
  }
  async leaveWorkspace({ workspaceId, userId }: LeaveWorkspaceParams) {
    const workspace = await this.workspaceRepository.findById(workspaceId);

    if (!workspace) {
      throw new AppError(ErrorCode.WORKSPACE_NOT_FOUND, 404);
    }

    if (workspace.isDefault) {
      throw new AppError(ErrorCode.DEFAULT_WORKSPACE_CANNOT_BE_LEFT, 400);
    }

    const membership =
      await this.workspaceMemberRepository.findByWorkspaceIdAndUserId(
        new Types.ObjectId(workspaceId),
        new Types.ObjectId(userId),
      );

    if (!membership) {
      throw new AppError(ErrorCode.WORKSPACE_MEMBER_NOT_FOUND, 404);
    }

    if (membership.role === "OWNER") {
      throw new AppError(ErrorCode.WORKSPACE_OWNER_CANNOT_LEAVE, 400);
    }

    await this.workspaceMemberRepository.delete(membership._id.toString());

    return {
      workspaceId,
      memberId: membership._id.toString(),
    };
  }
}
