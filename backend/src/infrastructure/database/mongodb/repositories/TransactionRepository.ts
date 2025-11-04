import { Transaction } from '@domain/entities/Transaction'
import { ITransactionRepository } from '@domain/repositories/ITransactionRepository'
import { Types } from 'mongoose'
import { TransactionMongooseModel } from '../models/TransactionModel'

function safeDate (input: any): Date | null {
  if (!input) return null
  try {
    if (input instanceof Date) {
      return isNaN(input.getTime()) ? null : input
    }
    if (typeof input === 'string' || typeof input === 'number') {
      const d = new Date(input)
      return isNaN(d.getTime()) ? null : d
    }
    return null
  } catch {
    return null
  }
}

function toDomain (doc: any): Transaction {
  const t = doc?.toObject ? doc.toObject() : doc
  const id = (t?._id || t?.id)?.toString?.() ?? String(t?._id ?? t?.id ?? '')
  const date = safeDate(t?.date)
  const createdAt = safeDate(t?.createdAt)
  const updatedAt = safeDate(t?.updatedAt)

  return new Transaction(
    id,
    t?.userId,
    t?.description,
    Number(t?.amount),
    t?.type,
    t?.origin,
    t?.category,
    date, // Date | null
    createdAt, // Date | null
    updatedAt, // Date | null
    t?.card
  )
}

export class TransactionRepository implements ITransactionRepository {
  async create (transaction: Transaction): Promise<Transaction> {
    const data: any = {
      userId: transaction.userId,
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      date: transaction.date ?? null,
      origin: transaction.origin,
      card: transaction.card,
      createdAt: transaction.createdAt ?? new Date(),
      updatedAt: transaction.updatedAt ?? new Date()
    }
    // Se o id passado for válido ObjectId, usa; senão deixa o Mongo gerar
    if (transaction.id && Types.ObjectId.isValid(transaction.id)) {
      data._id = new Types.ObjectId(transaction.id)
    }
    const created = await TransactionMongooseModel.create(data)
    return toDomain(created)
  }

  async findById (id: string): Promise<Transaction | null> {
    if (!Types.ObjectId.isValid(id)) return null
    const doc = await TransactionMongooseModel.findById(id).exec()
    return doc ? toDomain(doc) : null
  }

  async findByUserId (userId: string): Promise<Transaction[]> {
    const docs = await TransactionMongooseModel.find({ userId })
      .sort({ date: -1 })
      .exec()
    return docs.map(toDomain)
  }

  async update (
    id: string,
    partial: Partial<Transaction>
  ): Promise<Transaction | null> {
    if (!Types.ObjectId.isValid(id)) return null

    // Sanitização: não permite mudar id, userId, createdAt
    const {
      id: _drop1,
      userId: _drop2,
      createdAt: _drop3,
      ...rest
    } = partial as any

    if ('date' in rest && typeof rest.date === 'string') {
      const d = safeDate(rest.date)
      rest.date = d ?? null
    }

    if ('updatedAt' in rest && rest.updatedAt) {
      rest.updatedAt = safeDate(rest.updatedAt) ?? new Date()
    } else {
      rest.updatedAt = new Date()
    }

    const doc = await TransactionMongooseModel.findByIdAndUpdate(
      id,
      { $set: rest },
      { new: true }
    ).exec()

    return doc ? toDomain(doc) : null
  }

  async delete (id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false
    const res = await TransactionMongooseModel.deleteOne({ _id: id }).exec()
    return res.deletedCount === 1
  }
}
