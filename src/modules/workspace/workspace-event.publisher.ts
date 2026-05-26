import { sendWorkspaceEvent } from "../../utils/sse";

interface BaseWorkspaceEventParams {
    workspaceId: string;
    actorUserId: string;
}

interface PublishWorkspaceUpdatedEventParams extends BaseWorkspaceEventParams {
    workspace?: unknown;
}

interface PublishWorkspaceDeletedEventParams extends BaseWorkspaceEventParams {
    workspace?: unknown;
}

interface PublishMemberUpdatedEventParams extends BaseWorkspaceEventParams {
    member?: unknown;
    targetUserId?: string;
}

interface PublishMemberRemovedEventParams extends BaseWorkspaceEventParams {
    removedUserId: string;
    member?: unknown;
}

interface PublishMemberJoinedEventParams extends BaseWorkspaceEventParams {
    joinedUserId: string;
    member?: unknown;
}

interface PublishInvitationEventParams extends BaseWorkspaceEventParams {
    invitation?: unknown;
    targetUserId?: string;
}

export const publishWorkspaceUpdatedEvent = ({
    workspaceId,
    actorUserId,
    workspace,
}: PublishWorkspaceUpdatedEventParams) => {
    sendWorkspaceEvent({
        type: "workspace:updated",
        workspaceId,
        actorUserId,
        data: workspace,
    });
};

export const publishWorkspaceDeletedEvent = ({
    workspaceId,
    actorUserId,
    workspace,
}: PublishWorkspaceDeletedEventParams) => {
    sendWorkspaceEvent({
        type: "workspace:deleted",
        workspaceId,
        actorUserId,
        data: workspace,
    });
};

export const publishMemberUpdatedEvent = ({
    workspaceId,
    actorUserId,
    targetUserId,
    member,
}: PublishMemberUpdatedEventParams) => {
    sendWorkspaceEvent({
        type: "member:updated",
        workspaceId,
        actorUserId,
        targetUserId,
        data: member,
    });
};

export const publishMemberRemovedEvent = ({
    workspaceId,
    actorUserId,
    removedUserId,
    member,
}: PublishMemberRemovedEventParams) => {
    sendWorkspaceEvent({
        type: "member:removed",
        workspaceId,
        actorUserId,
        targetUserId: removedUserId,
        data: member,
    });
};

export const publishMemberJoinedEvent = ({
    workspaceId,
    actorUserId,
    joinedUserId,
    member,
}: PublishMemberJoinedEventParams) => {
    sendWorkspaceEvent({
        type: "member:joined",
        workspaceId,
        actorUserId,
        targetUserId: joinedUserId,
        data: member,
    });
};

export const publishInvitationCreatedEvent = ({
    workspaceId,
    actorUserId,
    invitation,
    targetUserId,
}: PublishInvitationEventParams) => {
    sendWorkspaceEvent({
        type: "invitation:created",
        workspaceId,
        actorUserId,
        targetUserId,
        data: invitation,
    });
};

export const publishInvitationAcceptedEvent = ({
    workspaceId,
    actorUserId,
    invitation,
    targetUserId,
}: PublishInvitationEventParams) => {
    sendWorkspaceEvent({
        type: "invitation:accepted",
        workspaceId,
        actorUserId,
        targetUserId,
        data: invitation,
    });
};

export const publishInvitationRejectedEvent = ({
    workspaceId,
    actorUserId,
    invitation,
    targetUserId,
}: PublishInvitationEventParams) => {
    sendWorkspaceEvent({
        type: "invitation:rejected",
        workspaceId,
        actorUserId,
        targetUserId,
        data: invitation,
    });
};