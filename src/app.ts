import express, { Application } from 'express';
import cors from 'cors';
import { setRoutes } from './routes';
import cookieParser from "cookie-parser";
import dotenv from "dotenv"
import { connectDB } from './db/mongo';
import { notFoundHandler } from './middlewares/errors/not-found.middleware';
import { errorHandler } from './middlewares/errors/error.middleware';
import path from 'path';
dotenv.config();
const app: Application = express();

app.use(express.static(path.join(__dirname, '../public')));
connectDB();


app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());

setRoutes(app);
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
