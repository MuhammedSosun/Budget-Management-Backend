import { Types } from "mongoose";

export type WorkspaceRole = "OWNER" | "EDITOR" | "VIEWER";

export interface CreateWorkspaceInput {
    name: string;
    description?: string;
    ownerId: Types.ObjectId;
}

export interface WorkspaceListItem {
    _id: Types.ObjectId;
    name: string;
    description?: string;
    isDefault: boolean;
    role: WorkspaceRole;
    ownerId: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}