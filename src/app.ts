import express, { Application } from "express";
import rateLimit from "express-rate-limit";
import cors from "cors";
import { setRoutes } from "./routes";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { connectDB } from "./db/mongo";
import { notFoundHandler } from "./middlewares/errors/not-found.middleware";
import { errorHandler } from "./middlewares/errors/error.middleware";
import { idempotencyMiddleware } from "./middlewares/Auth/idempotency.middleware";
import path from "path";

dotenv.config();

const app: Application = express();

connectDB();

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Çok fazla istek gönderdiniz, lütfen biraz dinlenin.",
  },
});

const strictLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: process.env.NODE_ENV === "development" ? 1000 : 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Çok hızlı işlem yapıyorsunuz, lütfen biraz bekleyin.",
  },
});
const refreshLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
});
const allowedOrigins = ["http://localhost:5173", "http://dev.butcemx.com:5173"];

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

app.use("/api", idempotencyMiddleware);
app.use("/api", generalLimiter);
app.use("/api/auth/login", strictLimiter);
app.use("/api/auth/register", strictLimiter);
app.use("/api/auth/refresh-token", refreshLimiter);

setRoutes(app);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
