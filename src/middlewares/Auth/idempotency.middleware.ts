import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { ErrorCode } from "../../exceptions/ErrorCodes";

type IdempotencyRecord = {
  fingerprint: string;
  statusCode: number;
  body: unknown;
  expiresAt: number;
};

const idempotencyStore = new Map<string, IdempotencyRecord>();

const TTL_MS = 60 * 1000;

const createFingerprint = (req: Request) => {
  const raw = JSON.stringify({
    method: req.method,
    url: req.originalUrl,
    body: req.body,
  });

  return crypto.createHash("sha256").update(raw).digest("hex");
};

export const idempotencyMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const key = req.headers["x-idempotency-key"] as string | undefined;

  if (!key || (req.method !== "POST" && req.method !== "PUT")) {
    return next();
  }

  const fingerprint = createFingerprint(req);
  const cached = idempotencyStore.get(key);

  if (cached) {
    if (Date.now() > cached.expiresAt) {
      idempotencyStore.delete(key);
      return next();
    }

    if (cached.fingerprint !== fingerprint) {
      return res.status(409).json({
        success: false,
        code: ErrorCode.IDEMPOTENCY_KEY_CONFLICT,
        message: ErrorCode.IDEMPOTENCY_KEY_CONFLICT,
        statusCode: 409,
      });
    }

    return res.status(cached.statusCode).json(cached.body);
  }

  const originalJson = res.json.bind(res);

  res.json = function (body: unknown): Response {
    const shouldCache =
      res.statusCode >= 200 &&
      res.statusCode < 300;

    if (shouldCache) {
      idempotencyStore.set(key, {
        fingerprint,
        statusCode: res.statusCode,
        body,
        expiresAt: Date.now() + TTL_MS,
      });

      setTimeout(() => {
        idempotencyStore.delete(key);
      }, TTL_MS);
    }

    return originalJson(body);
  };

  return next();
};