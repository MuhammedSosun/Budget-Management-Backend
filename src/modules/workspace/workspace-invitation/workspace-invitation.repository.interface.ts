import { Types } from "mongoose";
import {
  IWorkspaceInvitation,
  WorkspaceInvitationStatus,
} from "../../../models/workspace-invitation.model";
import { IBaseRepository } from "../../../repository/IBaseRepository";

export interface IWorkspaceInvitationRepository extends IBaseRepository<IWorkspaceInvitation> {
  findPendingByWorkspaceIdAndEmail(
    workspaceId: Types.ObjectId,
    email: string,
  ): Promise<IWorkspaceInvitation | null>;

  findByToken(token: string): Promise<IWorkspaceInvitation | null>;

  updateStatusById(
    invitationId: string,
    status: WorkspaceInvitationStatus,
    dateField?: "acceptedAt" | "rejectedAt",
  ): Promise<IWorkspaceInvitation | null>;

  expirePendingInvitations(): Promise<void>;

  findByWorkspaceId(
    workspaceId: Types.ObjectId,
  ): Promise<IWorkspaceInvitation[]>;

  findPendingByEmail(email: string): Promise<IWorkspaceInvitation[]>;
  deleteManyByWorkspaceId(workspaceId: string): Promise<void>;
}
