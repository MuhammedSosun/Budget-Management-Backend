import { Types } from "mongoose";
import WorkspaceInvitation, {
  IWorkspaceInvitation,
  WorkspaceInvitationStatus,
} from "../../../models/workspace-invitation.model";
import { BaseRepository } from "../../../repository/mongoose/BaseRepository";
import { IWorkspaceInvitationRepository } from "./workspace-invitation.repository.interface";

export class WorkspaceInvitationRepository
  extends BaseRepository<IWorkspaceInvitation>
  implements IWorkspaceInvitationRepository
{
  constructor() {
    super(WorkspaceInvitation);
  }

  async findPendingByWorkspaceIdAndEmail(
    workspaceId: Types.ObjectId,
    email: string,
  ): Promise<IWorkspaceInvitation | null> {
    return this.model
      .findOne({
        workspaceId,
        email: email.toLowerCase().trim(),
        status: "PENDING",
        expiresAt: { $gt: new Date() },
      })
      .exec();
  }

  async findByToken(token: string): Promise<IWorkspaceInvitation | null> {
    return this.model.findOne({ token }).exec();
  }

  async updateStatusById(
    invitationId: string,
    status: WorkspaceInvitationStatus,
    dateField?: "acceptedAt" | "rejectedAt",
  ): Promise<IWorkspaceInvitation | null> {
    const updateData: Record<string, unknown> = {
      status,
    };

    if (dateField) {
      updateData[dateField] = new Date();
    }

    return this.model
      .findByIdAndUpdate(invitationId, updateData, {
        new: true,
        runValidators: true,
      })
      .exec();
  }

  async expirePendingInvitations(): Promise<void> {
    await this.model
      .updateMany(
        {
          status: "PENDING",
          expiresAt: { $lt: new Date() },
        },
        {
          status: "EXPIRED",
        },
      )
      .exec();
  }

  async findByWorkspaceId(
    workspaceId: Types.ObjectId,
  ): Promise<IWorkspaceInvitation[]> {
    return this.model.find({ workspaceId }).sort({ createdAt: -1 }).exec();
  }

  async findPendingByEmail(email: string): Promise<IWorkspaceInvitation[]> {
    return this.model
      .find({
        email: email.toLowerCase().trim(),
        status: "PENDING",
        expiresAt: { $gt: new Date() },
      })
      .populate("workspaceId", "name description isDefault ownerId")
      .sort({ createdAt: -1 })
      .exec();
  }

  async deleteManyByWorkspaceId(workspaceId: string): Promise<void> {
    await this.model.deleteMany({ workspaceId }).exec();
  }
}
