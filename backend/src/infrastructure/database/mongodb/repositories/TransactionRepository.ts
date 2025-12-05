import { Transaction } from '@domain/entities/Transaction'
import { ITransactionRepository } from '@domain/repositories/ITransactionRepository'
import mongoose, { Types } from 'mongoose'
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

function toMonthYearFromDate (d?: Date | null): string | null {
  const date = safeDate(d)
  if (!date) return null
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

function decimalFromNumber (v: number): mongoose.Types.Decimal128 {
  const s = Number(v).toFixed(2)
  return mongoose.Types.Decimal128.fromString(s)
}

function amountFromDoc (t: any): number {
  // t.amount pode ser Decimal128, string, number
  if (t == null) return 0
  const val = t.amount
  if (val == null) return 0
  if (typeof val === 'number') return val
  if (typeof val === 'string') return parseFloat(val)
  // mongoose Decimal128 has toString()
  if (typeof val.toString === 'function') {
    const s = val.toString()
    return parseFloat(s)
  }
  return Number(val)
}

function toDomain (doc: any): Transaction {
  const t = doc?.toObject ? doc.toObject() : doc
  const id = (t?._id || t?.id)?.toString?.() ?? String(t?._id ?? t?.id ?? '')
  const date = safeDate(t?.date)
  const createdAt = safeDate(t?.createdAt)
  const updatedAt = safeDate(t?.updatedAt)
  const category = t.categoryName || t.category // Use categoryName do banco

  return new Transaction(
    id,
    t?.userId,
    t?.description,
    amountFromDoc(t),
    t?.type,
    t?.origin,
    category, // category name (não key)
    date, // Date | null
    createdAt, // Date | null
    updatedAt, // Date | null
    t?.card
  )
}

export class TransactionRepository implements ITransactionRepository {
  async create (transaction: Transaction): Promise<Transaction> {
    const monthYear = toMonthYearFromDate(transaction.date)

    const data: any = {
      userId: transaction.userId,
      description: transaction.description,
      // convert to Decimal128
      amount: decimalFromNumber(transaction.amount as number),
      currency: (transaction as any).currency ?? 'BRL',
      type: transaction.type,
      origin: (transaction as any).origin ?? null,
      card: transaction.card ?? null,
      // store both key and name if provided; if not, keep key as name
      categoryId: transaction.category ?? null,
      categoryName:
        (transaction as any).categoryName ?? transaction.category ?? null,
      date: transaction.date ?? null,
      monthYear: monthYear,
      createdAt: transaction.createdAt ?? new Date(),
      updatedAt: transaction.updatedAt ?? new Date(),
      deletedAt: (transaction as any).deletedAt ?? null,
      accountId: (transaction as any).accountId ?? 'default-wallet',
      bank: (transaction as any).bank ?? null
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

  async findByUserId (userId: string, options?: { limit?: number; skip?: number }): Promise<Transaction[]> {
    const query = TransactionMongooseModel.find({
      userId,
      deletedAt: null
    })
      .sort({ date: -1 })

    if (options?.limit) {
      query.limit(options.limit)
    }
    if (options?.skip) {
      query.skip(options.skip)
    }

    const docs = await query.exec()
    return docs.map(toDomain)
  }

  async countByUserId (userId: string): Promise<number> {
    return await TransactionMongooseModel.countDocuments({
      userId,
      deletedAt: null
    }).exec()
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

    // handle date normalization
    if ('date' in rest && rest.date) {
      const d = safeDate(rest.date)
      rest.date = d ?? null
      // recompute monthYear when date is changed
      rest.monthYear = toMonthYearFromDate(d) ?? rest.monthYear
    }

    // handle amount -> Decimal128
    if ('amount' in rest && rest.amount !== undefined && rest.amount !== null) {
      // normalize if string
      const amt =
        typeof rest.amount === 'string'
          ? Number(String(rest.amount).replace(',', '.'))
          : Number(rest.amount)
      rest.amount = decimalFromNumber(amt)
    }

    if ('updatedAt' in rest && rest.updatedAt) {
      rest.updatedAt = safeDate(rest.updatedAt) ?? new Date()
    } else {
      rest.updatedAt = new Date()
    }

    // if categoryName provided keep it; if only category (key) provided, set categoryName = key (UI / use-case may set better)
    if ('category' in rest && rest.category && !rest.categoryName) {
      rest.categoryId = rest.category
      rest.categoryName = rest.category
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
