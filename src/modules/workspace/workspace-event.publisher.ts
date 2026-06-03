import { sendWorkspaceEvent } from "../../utils/sse";
import { eventBus } from "../../shared/event-bus/eventBus";
import { EventTypes } from "../../shared/events/eventTypes";
interface BaseWorkspaceEventParams {
  workspaceId: string;
  actorUserId: string;
  actorEmail?: string;
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
  targetUserEmail?: string;
  oldRole?: string;
  newRole?: string;
}

interface PublishMemberRemovedEventParams extends BaseWorkspaceEventParams {
  removedUserId: string;
  removedUserEmail?: string;
  member?: unknown;
}

interface PublishMemberJoinedEventParams extends BaseWorkspaceEventParams {
  joinedUserId: string;
  joinedUserEmail?: string;
  member?: unknown;
}

interface PublishInvitationEventParams extends BaseWorkspaceEventParams {
  invitation?: unknown;
  targetUserId?: string;
  invitedEmail?: string;
}
interface PublishMemberLeftEventParams extends BaseWorkspaceEventParams {
  leftUserId: string;
  leftUserEmail?: string;
  member?: unknown;
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
  actorEmail,
  targetUserId,
  targetUserEmail,
  oldRole,
  newRole,
  member,
}: PublishMemberUpdatedEventParams) => {
  sendWorkspaceEvent({
    type: "member:updated",
    workspaceId,
    actorUserId,
    targetUserId,
    data: member,
  });

  if (!targetUserId) {
    return;
  }

  eventBus.emit(EventTypes.WORKSPACE_MEMBER_ROLE_UPDATED, {
    workspaceId,
    memberId: (member as any)?.id,
    targetUserId,
    targetUserEmail,
    oldRole,
    newRole,
    actor: {
      userId: actorUserId,
      email: actorEmail,
    },
  });
};

export const publishMemberRemovedEvent = ({
  workspaceId,
  actorUserId,
  actorEmail,
  removedUserId,
  removedUserEmail,
  member,
}: PublishMemberRemovedEventParams) => {
  sendWorkspaceEvent({
    type: "member:removed",
    workspaceId,
    actorUserId,
    targetUserId: removedUserId,
    data: member,
  });

  eventBus.emit(EventTypes.WORKSPACE_MEMBER_REMOVED, {
    workspaceId,
    memberId: (member as any)?.id,
    targetUserId: removedUserId,
    targetUserEmail: removedUserEmail,
    actor: {
      userId: actorUserId,
      email: actorEmail,
    },
  });
};

export const publishMemberJoinedEvent = ({
  workspaceId,
  actorUserId,
  actorEmail,
  joinedUserId,
  joinedUserEmail,
  member,
}: PublishMemberJoinedEventParams) => {
  sendWorkspaceEvent({
    type: "member:joined",
    workspaceId,
    actorUserId,
    targetUserId: joinedUserId,
    data: member,
  });

  eventBus.emit(EventTypes.WORKSPACE_MEMBER_JOINED, {
    workspaceId,
    memberId: (member as any)?.id,
    targetUserId: joinedUserId,
    targetUserEmail: joinedUserEmail,
    actor: {
      userId: actorUserId,
      email: actorEmail,
    },
  });
};
export const publishInvitationCreatedEvent = ({
  workspaceId,
  actorUserId,
  actorEmail,
  invitation,
  targetUserId,
  invitedEmail,
}: PublishInvitationEventParams) => {
  sendWorkspaceEvent({
    type: "invitation:created",
    workspaceId,
    actorUserId,
    targetUserId,
    data: invitation,
  });

  eventBus.emit(EventTypes.WORKSPACE_INVITATION_CREATED, {
    workspaceId,
    invitationId: (invitation as any)?.id,
    invitedEmail: invitedEmail ?? (invitation as any)?.email,
    invitedUserId: targetUserId,
    actor: {
      userId: actorUserId,
      email: actorEmail,
    },
  });
};

export const publishInvitationAcceptedEvent = ({
  workspaceId,
  actorUserId,
  actorEmail,
  invitation,
  targetUserId,
  invitedEmail,
}: PublishInvitationEventParams) => {
  sendWorkspaceEvent({
    type: "invitation:accepted",
    workspaceId,
    actorUserId,
    targetUserId,
    data: invitation,
  });

  eventBus.emit(EventTypes.WORKSPACE_INVITATION_ACCEPTED, {
    workspaceId,
    invitationId: (invitation as any)?.id,
    invitedEmail: invitedEmail ?? (invitation as any)?.email,
    invitedUserId: targetUserId,
    actor: {
      userId: actorUserId,
      email: actorEmail,
    },
  });
};

export const publishInvitationRejectedEvent = ({
  workspaceId,
  actorUserId,
  actorEmail,
  invitation,
  targetUserId,
  invitedEmail,
}: PublishInvitationEventParams) => {
  sendWorkspaceEvent({
    type: "invitation:rejected",
    workspaceId,
    actorUserId,
    targetUserId,
    data: invitation,
  });

  eventBus.emit(EventTypes.WORKSPACE_INVITATION_REJECTED, {
    workspaceId,
    invitationId: (invitation as any)?.id,
    invitedEmail: invitedEmail ?? (invitation as any)?.email,
    invitedUserId: targetUserId,
    actor: {
      userId: actorUserId,
      email: actorEmail,
    },
  });
};
export const publishMemberLeftEvent = ({
  workspaceId,
  actorUserId,
  actorEmail,
  leftUserId,
  leftUserEmail,
  member,
}: PublishMemberLeftEventParams) => {
  sendWorkspaceEvent({
    type: "member:left",
    workspaceId,
    actorUserId,
    targetUserId: leftUserId,
    data: member,
  });

  eventBus.emit(EventTypes.WORKSPACE_MEMBER_LEFT, {
    workspaceId,
    memberId: (member as any)?.id,
    targetUserId: leftUserId,
    targetUserEmail: leftUserEmail,
    actor: {
      userId: actorUserId,
      email: actorEmail,
    },
  });
};
