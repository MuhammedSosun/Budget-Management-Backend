import { Application } from 'express';
import authRoutes from './auth.routes';
export const setRoutes = (app: Application) => {
  app.use('/api/auth', authRoutes);
};
