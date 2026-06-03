import { Types } from "mongoose";
import { WorkspaceMemberRepository } from "../workspace/workspace-member/workspace-member.repository";
import { WorkspaceRole } from "../workspace/workspace.types";

type ResolveWorkspaceRecipientsParams = {
    workspaceId: string;
    actorUserId?: string;
    includeActor?: boolean;
    allowedRoles?: WorkspaceRole[];
};

export class NotificationRecipientService {
    constructor(
        private readonly workspaceMemberRepository: WorkspaceMemberRepository,
    ) { }

    async resolveWorkspaceRecipients({
        workspaceId,
        actorUserId,
        includeActor = false,
        allowedRoles = ["OWNER", "EDITOR", "VIEWER"],
    }: ResolveWorkspaceRecipientsParams): Promise<string[]> {
        const members = await this.workspaceMemberRepository.findByWorkspaceId(
            new Types.ObjectId(workspaceId),
        );

        const recipientIds = members
            .filter((member) => allowedRoles.includes(member.role))
            .map((member) => this.extractUserId(member.userId))
            .filter((userId): userId is string => Boolean(userId))
            .filter((userId) => {
                if (includeActor) return true;
                return userId !== actorUserId;
            });

        return [...new Set(recipientIds)];
    }

    private extractUserId(userId: unknown): string | null {
        if (!userId) return null;

        if (userId instanceof Types.ObjectId) {
            return userId.toString();
        }

        if (
            typeof userId === "object" &&
            userId !== null &&
            "_id" in userId
        ) {
            const id = (userId as { _id?: unknown })._id;

            if (id instanceof Types.ObjectId) {
                return id.toString();
            }

            if (typeof id === "string") {
                return id;
            }
        }

        if (typeof userId === "string") {
            return userId;
        }

        return null;
    }
}