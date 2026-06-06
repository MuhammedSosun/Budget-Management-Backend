import dotenv from "dotenv";
import express, { Application, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import cors from "cors";
import { setRoutes } from "./routes";
import cookieParser from "cookie-parser";
import { connectDB } from "./db/mongo";
import { notFoundHandler } from "./middlewares/errors/not-found.middleware";
import { errorHandler } from "./middlewares/errors/error.middleware";
import { idempotencyMiddleware } from "./middlewares/Auth/idempotency.middleware";
import path from "path";
import { ErrorCode } from "./exceptions/ErrorCodes";
import { registerNotificationEventHandlers } from "./modules/notification/notification.event-handlers";
import { registerBudgetLimitEventHandlers } from "./modules/budget-limit/budget-limit.event-handlers";
dotenv.config();

const app: Application = express();

connectDB();

const createRateLimitHandler = (code: string) => {
  return (_req: Request, res: Response) => {
    return res.status(429).json({
      success: false,
      code,
      message: code,
      statusCode: 429,
    });
  };
};

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler(ErrorCode.RATE_LIMIT_EXCEEDED),
});

const mailLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: process.env.NODE_ENV === "development" ? 1000 : 1,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler(ErrorCode.RATE_LIMIT_EMAIL_RESEND),
});

const strictLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: process.env.NODE_ENV === "development" ? 1000 : 15,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler(ErrorCode.RATE_LIMIT_TOO_FAST),
});

const refreshLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler(ErrorCode.RATE_LIMIT_REFRESH),
});
const aiReviewLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: process.env.NODE_ENV === "development" ? 20 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler(ErrorCode.RATE_LIMIT_AI_REVIEW),
});
const allowedOrigins = [
  "http://localhost:5173",
  "http://dev.butcemx.com:5173",
  "http://172.20.10.8:5173",
];

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-idempotency-key"],
  }),
);

app.use(express.static(path.join(process.cwd(), "public")));

app.get("/", (req, res) => {
  const acceptLang = req.headers["accept-language"] || "";

  if (acceptLang.includes("en")) {
    res.redirect("/en/");
  } else {
    res.redirect("/tr/");
  }
});

app.use("/api", generalLimiter);

app.use("/api/auth/login", strictLimiter);
app.use("/api/auth/register", strictLimiter);
app.use("/api/auth/refresh-token", refreshLimiter);
app.use("/api/auth/verify-email", strictLimiter);
app.use("/api/auth/resend-verification", mailLimiter);

app.use(
  "/api/workspaces/:workspaceId/ai-review/monthly",
  aiReviewLimiter,
);

app.use("/api", idempotencyMiddleware);

setRoutes(app);

registerBudgetLimitEventHandlers();
registerNotificationEventHandlers();
setRoutes(app);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
