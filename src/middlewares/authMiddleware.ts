import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/token";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(403).json({ message: "Yetkisiz Erişim, Token bulunamadı" });
    }
    const token = authHeader.split(" ")[1];

    const decoded = verifyAccessToken(token);

    if (!decoded) {
        return res.status(403).json({ message: "Geçersiz veya süresi dolmuş token." });
    }

    (req as any).user = decoded;

    next();
}