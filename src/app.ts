import express, { Application } from 'express';
import cors from 'cors';
import './db/mongo';
import { setRoutes } from './routes';
const app: Application = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Bütçe Takip API Hazır!');
});

setRoutes(app);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
