import { Model, Document } from "mongoose";
import { IBaseRepository } from "../IBaseRepository";

export abstract class BaseRepository<T extends Document> implements IBaseRepository<T> {
    constructor(protected readonly model: Model<T>) { }

    async create(data: Partial<T>): Promise<T> {
        return await this.model.create(data);
    }

    async findAll(): Promise<T[]> {
        return await this.model.find().exec();
    }

    async findById(id: string): Promise<T | null> {
        return await this.model.findById(id).exec();
    }

    async update(id: string, data: Partial<T>): Promise<T | null> {
        return await this.model.findByIdAndUpdate(id, data, { returnDocument: 'after' }).exec();
    }

    async delete(id: string): Promise<T | null> {
        return await this.model.findByIdAndDelete(id).exec();
    }
}