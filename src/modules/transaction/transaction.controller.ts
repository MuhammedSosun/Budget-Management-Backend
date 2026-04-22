
import { NextFunction, Request, Response } from "express";
import { TransactionService } from "./transaction.service";
import { TransactionRepository } from "./transaction.repository";
import getPagination from "../../utils/pageable";

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
        const paginationParams = {
            page: req.query.page as string,
            size: req.query.pageSize as string || req.query.size as string
        };
        const { limit, offset, page, size } = getPagination(paginationParams);
        const { transactions, totalCount } = await transactionService.findAllByUserId(
            req.user.userId,
            limit,
            offset,
            req.query
        );
        res.status(200).json({
            message: "İşlemler listelendi",
            data: {
                content: transactions,
                currentPage: page,
                pageSize: size,
                totalElements: totalCount,
                totalPages: Math.ceil(totalCount / size)
            }
        });
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
        const transactionId = req.params.id as string;
        const transactionData = { ...req.body, userId: req.user.userId };
        const result = await transactionService.updateTransaction(transactionId, transactionData);
        res.status(200).json({
            message: "İşlem güncellendi",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const findTransactionById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const transactionId = req.params.id as string;
        const result = await transactionService.findTransactionById(transactionId);
        res.status(200).json({
            message: "İşlem bulundu",
            data: result,
        })
    } catch (error) {
        next(error)
    }
}

export const totalIncome = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.userId;
        const result = await transactionService.totalIncome(userId);
        res.status(200).json({
            message: "Toplam gelir bulundu",
            data: result,
        })
    } catch (error) {
        next(error)
    }
}

export const totalExpense = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.userId;
        const result = await transactionService.totalExpense(userId);
        res.status(200).json({
            message: "Toplam gider bulundu",
            data: result,
        })
    } catch (error) {
        next(error)
    }
}

export const getCategoryStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.userId;
        const result = await transactionService.getCategoryStats(userId);
        res.status(200).json({
            message: "Kategori istatistikleri bulundu",
            data: result,
        })
    } catch (error) {
        next(error)
    }
}
export const getTrendStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.userId;
        const period = (req.query.period as 'weekly' | 'monthly') || 'weekly';

        const result = await transactionService.getTrendStats(userId, period);

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}