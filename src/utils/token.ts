import jwt from "jsonwebtoken";


export interface TokenPayload {
    userId: string,
    username: string,

}


export const generateAccessToken = (payload: TokenPayload) => {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
        expiresIn: '15m',
    })
};

export const generateRefreshToken = (payload: { userId: string }) => {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
        expiresIn: '7d',
    })
}

export const verifyAccessToken = (token: string) => {
    try {
        return jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as TokenPayload
    } catch (error) {
        return null;
    }
}

export const verfiyRefreshToken = (token: string) => {
    try {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { userId: string };
    } catch (error) {
        return null;
    }
}

