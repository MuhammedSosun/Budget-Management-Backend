import { Document, model, Schema, Types } from "mongoose";
import { WorkspaceRole } from "./workspace-member.model";

export type WorkspaceInvitationStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "EXPIRED";

export interface IWorkspaceInvitation extends Document {
  workspaceId: Types.ObjectId;
  email: string;
  role: Exclude<WorkspaceRole, "OWNER">;
  invitedBy: Types.ObjectId;
  token: string;
  status: WorkspaceInvitationStatus;
  expiresAt: Date;
  acceptedAt?: Date | null;
  rejectedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const workspaceInvitationSchema = new Schema<IWorkspaceInvitation>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    role: {
      type: String,
      enum: ["EDITOR", "VIEWER"],
      required: true,
    },

    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED", "EXPIRED"],
      default: "PENDING",
      index: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    acceptedAt: {
      type: Date,
      default: null,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

workspaceInvitationSchema.index(
  {
    workspaceId: 1,
    email: 1,
    status: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      status: "PENDING",
    },
  },
);

export default model<IWorkspaceInvitation>(
  "WorkspaceInvitation",
  workspaceInvitationSchema,
);
