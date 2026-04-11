
import { NextFunction, Request, Response } from "express";
import { TransactionService } from "./transaction.service";
import { TransactionRepository } from "./transaction.repository";

const transactionRepo = new TransactionRepository();
const transactionService = new TransactionService(transactionRepo);

export const createTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const transactionData = { ...req.body, userId: req.user.userId }
        const result = await transactionService.createTransaction(transactionData);
        res.status(201).json({
            message: "İşlem başarıyla oluşturuldu",
            data: result,
        })
    }
    catch (error) {
        next(error)
    }
}

export const findAllTransactions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.userId;
        const result = await transactionService.findAllByUserId(userId);
        res.status(200).json({
            message: "İşlemler listelendi",
            data: result,
        })
    } catch (error) {
        next(error)
    }
}

export const deleteTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const transactionId = req.params.id as string;
        const userId = req.user.userId;
        const result = await transactionService.deleteTransaction(transactionId, userId);
        res.status(200).json({
            message: "İşlem silindi",
            data: result,
        })
    } catch (error) {
        next(error)
    }
}

export const updateTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.userId;
        const result = await transactionService.updateTransaction(userId, req.body);
        res.status(200).json({
            message: "İşlem güncellendi",
            data: result,
        })
    } catch (error) {
        next(error)
    }
}

export const findTransactionById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.userId;
        const result = await transactionService.findTransactionById(userId);
        res.status(200).json({
            message: "İşlem bulundu",
            data: result,
        })
    } catch (error) {
        next(error)
    }
}