import '../../bootstrap'
import { createTransactionSchema } from '@application/validators/transactionSchemas'
import { connectMongo } from '@infrastructure/database/mongodb/connection'
import { TransactionMongooseModel } from '@infrastructure/database/mongodb/models/TransactionModel'
import { CategoryRepository } from '@infrastructure/database/mongodb/repositories/CategoryRepository'
import { json, badRequest, serverError } from '@infrastructure/http/httpResponse'
import { generateIdempotencyKey } from '@shared/utils/idempotencyKey'
import type { APIGatewayProxyHandlerV2 } from 'aws-lambda'
import mongoose from 'mongoose'

function normalizeAmount (val: number | string): number {
  if (typeof val === 'number') return Number(val)
  const s = String(val).replace(',', '.').trim()
  return Number(parseFloat(s))
}

function toMonthYear (d: Date): string {
  const year = d.getUTCFullYear()
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    await connectMongo()

    const body = event.body ? JSON.parse(event.body) : {}
    const { transactions } = body

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return badRequest('transactions must be a non-empty array')
    }

    if (transactions.length > 500) {
      return badRequest('Maximum 500 transactions per batch')
    }

    const categoryRepo = new CategoryRepository()
    await categoryRepo.seedDefaultCategories()
    const allCategories = await categoryRepo.findAll()

    const categoryByKey = new Map<string, string>()
    const categoryByName = new Map<string, string>()
    for (const cat of allCategories) {
      categoryByKey.set(cat.key.toUpperCase(), cat.name)
      categoryByName.set(cat.name, cat.name)
    }

    function resolveCategoryName (input: string): string | null {
      return categoryByKey.get(input.toUpperCase()) ?? categoryByName.get(input) ?? null
    }

    const docs: any[] = []
    const errors: Array<{ index: number; error: string }> = []

    for (let i = 0; i < transactions.length; i++) {
      const item = transactions[i]

      const parsed = createTransactionSchema.safeParse(item)
      if (!parsed.success) {
        errors.push({
          index: i,
          error: parsed.error.errors.map(e => e.message).join(', ')
        })
        continue
      }

      const { userId, description, amount, type, category, date, card, origin } = parsed.data

      const categoryName = resolveCategoryName(category)
      if (!categoryName) {
        errors.push({ index: i, error: `Categoria inválida: ${category}` })
        continue
      }

      const amountNumber = normalizeAmount(amount)
      const dateObj = new Date(date)

      docs.push({
        userId,
        description,
        amount: mongoose.Types.Decimal128.fromString(amountNumber.toFixed(2)),
        currency: 'BRL',
        type,
        origin: origin ?? null,
        card: card ?? null,
        categoryId: category,
        categoryName,
        date: dateObj,
        monthYear: toMonthYear(dateObj),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        accountId: 'default-wallet',
        bank: null,
        idempotencyKey: generateIdempotencyKey(dateObj, description, amountNumber)
      })
    }

    let success = 0
    let duplicates = 0

    if (docs.length > 0) {
      try {
        const result = await TransactionMongooseModel.insertMany(docs, { ordered: false })
        success = result.length
      } catch (err: any) {
        if (err.code === 11000 || err.name === 'MongoBulkWriteError' || err.name === 'BulkWriteError') {
          success = err.insertedCount ?? err.insertedDocs?.length ?? err.result?.nInserted ?? 0

          const writeErrors = err.writeErrors ?? err.errors ?? []
          for (const we of writeErrors) {
            const code = we.code ?? we.err?.code
            const msg = we.errmsg ?? we.message ?? we.err?.message ?? ''
            const isDuplicate = code === 11000 || String(msg).includes('E11000') || String(msg).includes('duplicate key')
            if (isDuplicate) {
              duplicates++
            } else {
              errors.push({
                index: we.index ?? -1,
                error: msg || 'Unknown bulk write error'
              })
            }
          }
        } else {
          throw err
        }
      }
    }

    return json(201, {
      message: `Batch complete: ${success} created, ${duplicates} duplicates skipped, ${errors.length} failed`,
      success,
      duplicates,
      failed: errors.length,
      errors
    })
  } catch (err: any) {
    return serverError(err)
  }
}
