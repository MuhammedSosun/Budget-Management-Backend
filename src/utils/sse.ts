import { Response } from "express";

type WorkspaceClient = {
  userId: string;
  res: Response;
};

type WorkspaceEventType =
  | "transaction:created"
  | "transaction:updated"
  | "transaction:deleted"
  | "workspace:updated"
  | "workspace:deleted"
  | "member:updated"
  | "member:removed"
  | "member:joined"
  | "member:left"
  | "invitation:created"
  | "invitation:accepted"
  | "invitation:rejected";

export interface WorkspaceEventPayload {
  type: WorkspaceEventType;
  workspaceId: string;
  actorUserId?: string;
  targetUserId?: string;
  data?: unknown;
  occurredAt?: string;
}

const workspaceClients = new Map<string, WorkspaceClient[]>();

export const addWorkspaceClient = (
  workspaceId: string,
  userId: string,
  res: Response,
) => {
  const clients = workspaceClients.get(workspaceId) || [];

  clients.push({ userId, res });

  workspaceClients.set(workspaceId, clients);
};

export const removeWorkspaceClient = (workspaceId: string, res: Response) => {
  const clients = workspaceClients.get(workspaceId) || [];

  const filteredClients = clients.filter((client) => client.res !== res);

  if (filteredClients.length === 0) {
    workspaceClients.delete(workspaceId);
    return;
  }

  workspaceClients.set(workspaceId, filteredClients);
};

export const sendWorkspaceEvent = (payload: WorkspaceEventPayload) => {
  const clients = workspaceClients.get(payload.workspaceId) || [];

  clients.forEach((client) => {
    try {
      client.res.write(`event: ${payload.type}\n`);
      client.res.write(
        `data: ${JSON.stringify({
          ...payload,
          occurredAt: payload.occurredAt || new Date().toISOString(),
        })}\n\n`,
      );
    } catch {
      removeWorkspaceClient(payload.workspaceId, client.res);
    }
  });
};
