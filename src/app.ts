import express, { Application } from 'express';
import cors from 'cors';
import { setRoutes } from './routes';
import cookieParser from "cookie-parser";
import dotenv from "dotenv"
import { connectDB } from './db/mongo';

const app: Application = express();

dotenv.config();

connectDB();


app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.get('/', (req, res) => {
  res.send('Bütçe Takip API Hazır!');
});


setRoutes(app);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
