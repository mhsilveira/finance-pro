import { Transaction } from '@domain/entities/Transaction'
import { ITransactionRepository } from '@domain/repositories/ITransactionRepository'
import { generateIdempotencyKey } from '@shared/utils/idempotencyKey'
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
    const idempotencyKey = generateIdempotencyKey(
      transaction.date,
      transaction.description,
      transaction.amount
    )

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
      bank: (transaction as any).bank ?? null,
      idempotencyKey
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

  async getStats (userId: string, filters?: { monthFrom?: string; monthTo?: string }): Promise<{
    totalCount: number
    income: number
    expense: number
    byCategory: Array<{ category: string; total: number; count: number }>
  }> {
    const match: any = { userId, deletedAt: null }

    if (filters?.monthFrom || filters?.monthTo) {
      match.monthYear = {}
      if (filters.monthFrom) match.monthYear.$gte = filters.monthFrom
      if (filters.monthTo) match.monthYear.$lte = filters.monthTo
    }

    const [summaryResult, categoryResult] = await Promise.all([
      TransactionMongooseModel.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            totalCount: { $sum: 1 },
            income: {
              $sum: {
                $cond: [{ $eq: ['$type', 'income'] }, { $toDouble: '$amount' }, 0]
              }
            },
            expense: {
              $sum: {
                $cond: [{ $eq: ['$type', 'expense'] }, { $toDouble: '$amount' }, 0]
              }
            }
          }
        }
      ]).exec(),
      TransactionMongooseModel.aggregate([
        { $match: { ...match, type: 'expense' } },
        {
          $group: {
            _id: '$categoryName',
            total: { $sum: { $toDouble: '$amount' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { total: -1 } }
      ]).exec()
    ])

    const summary = summaryResult[0] || { totalCount: 0, income: 0, expense: 0 }

    return {
      totalCount: summary.totalCount,
      income: summary.income,
      expense: summary.expense,
      byCategory: categoryResult.map((c: any) => ({
        category: c._id || 'Outros',
        total: c.total,
        count: c.count
      }))
    }
  }

  async bulkUpdateCategories (updates: Array<{ id: string; category: string }>): Promise<number> {
    if (updates.length === 0) return 0

    const ops = updates.map(({ id, category }) => ({
      updateOne: {
        filter: { _id: new Types.ObjectId(id) },
        update: {
          $set: {
            categoryId: category,
            categoryName: category,
            updatedAt: new Date()
          }
        }
      }
    }))

    const result = await TransactionMongooseModel.bulkWrite(ops, { ordered: false })
    return result.modifiedCount
  }

  async delete (id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false
    const res = await TransactionMongooseModel.deleteOne({ _id: id }).exec()
    return res.deletedCount === 1
  }
}
