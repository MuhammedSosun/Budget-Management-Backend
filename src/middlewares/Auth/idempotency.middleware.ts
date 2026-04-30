import { Request, Response, NextFunction } from "express";

type IdempotencyResponseBody = unknown;

const idempotencyStore = new Map<string, IdempotencyResponseBody>();

export const idempotencyMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const key = req.headers["x-idempotency-key"] as string | undefined;

  if (!key || (req.method !== "POST" && req.method !== "PUT")) {
    return next();
  }

  if (idempotencyStore.has(key)) {
    return res.status(200).json(idempotencyStore.get(key));
  }

  const originalJson = res.json.bind(res);

  res.json = function (body: IdempotencyResponseBody): Response {
    idempotencyStore.set(key, body);
    return originalJson(body);
  };

  return next();
};
