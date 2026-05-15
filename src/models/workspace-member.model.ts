import { Document, model, Schema, Types } from "mongoose";

export type WorkspaceRole = "OWNER" | "EDITOR" | "VIEWER";


export interface IWorkspaceMember extends Document {
    workspaceId: Types.ObjectId;
    userId: Types.ObjectId;
    role: WorkspaceRole;
    invitedBy?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const workspaceMemberSchema = new Schema<IWorkspaceMember>(
    {
        workspaceId: {
            type: Schema.Types.ObjectId,
            ref: "Workspace",
            required: true,
            index: true,
        },

        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        role: {
            type: String,
            enum: ["OWNER", "EDITOR", "VIEWER"],
            required: true,
        },

        invitedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);
workspaceMemberSchema.index(
    { workspaceId: 1, userId: 1 },
    { unique: true },
);

export default model<IWorkspaceMember>(
    "WorkspaceMember",
    workspaceMemberSchema,
);