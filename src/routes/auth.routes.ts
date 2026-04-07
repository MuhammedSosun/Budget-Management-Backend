import { Router } from 'express';
import { register, login, findAll, deleteUserById, updateUser, refresh, logout } from '../modules/auth/auth.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validations/validate.middleware';
import { RegisterSchema } from '../middlewares/validations/auth.validation';

const router = Router();

router.post('/register', validate(RegisterSchema), register);
router.post('/login', login);
router.post('/refreshToken', refresh)
router.post('/logout', logout);
router.get('/findAll', authMiddleware, findAll);
router.delete('/delete/:id', authMiddleware, deleteUserById);
router.put('/update/:id', validate(RegisterSchema), authMiddleware, updateUser);
export default router;
