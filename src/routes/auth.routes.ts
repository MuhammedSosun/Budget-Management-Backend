import { Router } from 'express';
import { register, login, findAll, deleteUserById, updateUser } from '../modules/auth/auth.controller';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/findAll', findAll);
router.delete('/delete/:id', deleteUserById);
router.put('/update/:id', updateUser);

export default router;
