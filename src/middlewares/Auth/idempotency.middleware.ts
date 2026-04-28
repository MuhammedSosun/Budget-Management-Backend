import { Request, Response, NextFunction } from 'express';


const idempotencyStore = new Map<string, any>();

export const idempotencyMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const key = req.headers['x-idempotency-key'] as string;

    if (!key || (req.method !== 'POST' && req.method !== 'PUT')) {
        return next();
    }

    if (idempotencyStore.has(key)) {
        console.log(`[Idempotency] Tekrarlanan istek yakalandı: ${key}`);
        return res.status(200).json(idempotencyStore.get(key));
    }

    const originalJson = res.json;
    res.json = function (body): Response {
        idempotencyStore.set(key, body);
        return originalJson.call(this, body);
    };

    next();
};