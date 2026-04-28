import express, { Application } from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { setRoutes } from './routes';
import cookieParser from "cookie-parser";
import dotenv from "dotenv"
import { connectDB } from './db/mongo';
import { notFoundHandler } from './middlewares/errors/not-found.middleware';
import { errorHandler } from './middlewares/errors/error.middleware';
import { idempotencyMiddleware } from './middlewares/Auth/idempotency.middleware';
import path from 'path';

dotenv.config();
const app: Application = express();

connectDB();

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 429, message: "Çok fazla istek gönderdiniz, lütfen biraz dinlenin." }
});

const strictLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 429, message: "Çok hızlı işlem yapıyorsunuz, lütfen biraz bekleyin." }
});

app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, '../public')));
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-idempotency-key']
}));

app.use('/api', idempotencyMiddleware);
app.use('/api/', generalLimiter);
app.use('/api/auth', strictLimiter);
app.use('/api/transactions', strictLimiter);

setRoutes(app);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});