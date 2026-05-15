import { Document, model, Schema, Types } from "mongoose";

export interface IWorkspace extends Document {
    name: string;
    ownerId: Types.ObjectId;
    description?: string;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;

}

const workspaceSchema = new Schema<IWorkspace>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 80,
        },
        ownerId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        description: {
            type: String,
            trim: true,
            maxlength: 200,
            default: "",
        },
        isDefault: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);
workspaceSchema.index(
    { ownerId: 1, isDefault: 1 },
    {
        unique: true,
        partialFilterExpression: { isDefault: true },
    },
);
export default model<IWorkspace>("Workspace", workspaceSchema);
