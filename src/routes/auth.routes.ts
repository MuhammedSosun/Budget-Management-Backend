import { Router } from 'express';
import { register, login, findAll, deleteUserById, updateUser, refresh, logout } from '../modules/auth/auth.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refreshToken', refresh)
router.post('/logout', authMiddleware, logout);
router.get('/findAll', authMiddleware, findAll);
router.delete('/delete/:id', authMiddleware, deleteUserById);
router.put('/update/:id', authMiddleware, updateUser);
export default router;
