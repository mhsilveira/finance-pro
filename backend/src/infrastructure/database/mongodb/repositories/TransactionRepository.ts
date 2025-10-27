import { Transaction } from "@domain/entities/Transaction";
import { ITransactionRepository } from "@domain/repositories/ITransactionRepository";
import { Types } from "mongoose";
import { TransactionMongooseModel } from "../models/TransactionModel";

function toDomain(doc: any): Transaction {
    const t = doc.toObject ? doc.toObject() : doc;
    return new Transaction(
        (t._id || t.id).toString(),
        t.userId,
        t.description,
        t.amount,
        t.type,
        t.origin,
        t.category,
        new Date(t.date),
        new Date(t.createdAt),
        new Date(t.updatedAt),
        t.card,
    );
}

export class TransactionRepository implements ITransactionRepository {
    async create(transaction: Transaction): Promise<Transaction> {
        const data: any = {
            userId: transaction.userId,
            description: transaction.description,
            amount: transaction.amount,
            type: transaction.type,
            category: transaction.category,
            date: transaction.date,
            origin: transaction.origin,
            card: transaction.card,
            createdAt: transaction.createdAt,
            updatedAt: transaction.updatedAt,
        };
        // Se o id passado for válido ObjectId, usa; senão deixa o Mongo gerar
        if (transaction.id && Types.ObjectId.isValid(transaction.id)) {
            data._id = new Types.ObjectId(transaction.id);
        }
        const created = await TransactionMongooseModel.create(data);
        return toDomain(created);
    }

    async findById(id: string): Promise<Transaction | null> {
        if (!Types.ObjectId.isValid(id)) return null;
        const doc = await TransactionMongooseModel.findById(id).exec();
        return doc ? toDomain(doc) : null;
    }

    async findByUserId(userId: string): Promise<Transaction[]> {
        const docs = await TransactionMongooseModel.find({ userId }).sort({ date: -1 }).exec();
        return docs.map(toDomain);
    }

    async update(id: string, partial: Partial<Transaction>): Promise<Transaction | null> {
        if (!Types.ObjectId.isValid(id)) return null;

        // Sanitização: não permite mudar id, userId, createdAt
        const { id: _drop1, userId: _drop2, createdAt: _drop3, ...rest } = partial as any;

        if ("date" in rest && typeof rest.date === "string") {
            rest.date = new Date(rest.date);
        }

        const doc = await TransactionMongooseModel.findByIdAndUpdate(id, { $set: rest }, { new: true }).exec();

        return doc ? toDomain(doc) : null;
    }

    async delete(id: string): Promise<boolean> {
        if (!Types.ObjectId.isValid(id)) return false;
        const res = await TransactionMongooseModel.deleteOne({ _id: id }).exec();
        return res.deletedCount === 1;
    }
}