import { Router } from "express";
import { createTransaction, deleteTransaction, findAllTransactions, findTransactionById, updateTransaction } from "../modules/transaction/transaction.controller";
import { validate } from "../middlewares/validations/validate.middleware";
import { TransactionSchema } from "../modules/transaction/transaciton.validation";
import { authMiddleware } from "../middlewares/Auth/AuthMiddleware";

const router = Router();

router.post('/create', authMiddleware, validate(TransactionSchema), createTransaction);
router.get('/getall', authMiddleware, findAllTransactions);
router.delete('/delete/:id', authMiddleware, deleteTransaction);
router.put('/update/:id', authMiddleware, validate(TransactionSchema), updateTransaction);
router.get('/get/:id', authMiddleware, findTransactionById);





export default router;