import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/token";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    let token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    console.log("gelen çerezler", req.cookies)

    if (!token && req.cookies) {
        token = req.cookies.refreshToken;
        console.log(token, "gelen token")
    }
    if (!token) {
        console.log(token, "token bulunamadı ss")
        return res.status(403).json({ message: "Yetkisiz Erişim, Token bulunamadı" });
    }

    const decoded = verifyAccessToken(token);

    if (!decoded) {
        return res.status(403).json({ message: "Geçersiz veya süresi dolmuş token." });
    }

    req.user = decoded;
    next();
}