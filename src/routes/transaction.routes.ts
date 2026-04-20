import { Router } from "express";
import { createTransaction, deleteTransaction, findAllTransactions, findTransactionById, totalExpense, totalIncome, updateTransaction } from "../modules/transaction/transaction.controller";
import { validate } from "../middlewares/validations/validate.middleware";
import { TransactionSchema } from "../modules/transaction/transaciton.validation";
import { authMiddleware } from "../middlewares/Auth/AuthMiddleware";

const router = Router();

router.post('/create', authMiddleware, validate(TransactionSchema), createTransaction);
router.get('/get-all', authMiddleware, findAllTransactions);
router.delete('/delete/:id', authMiddleware, deleteTransaction);
router.put('/update/:id', authMiddleware, validate(TransactionSchema), updateTransaction);
router.get('/get/:id', authMiddleware, findTransactionById);
router.get('/total-income', authMiddleware, totalIncome);
router.get('/total-expense', authMiddleware, totalExpense);





export default router;