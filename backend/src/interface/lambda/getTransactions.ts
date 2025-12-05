// src/interface/lambda/getTransactions.ts
import '../../bootstrap'
import { ListTransactions } from '@domain/use-cases/ListTransactions'
import { connectMongo } from '@infrastructure/database/mongodb/connection'
import { TransactionRepository } from '@infrastructure/database/mongodb/repositories/TransactionRepository'
import {
  badRequest,
  json,
  serverError
} from '@infrastructure/http/httpResponse'
import type { APIGatewayProxyHandlerV2 } from 'aws-lambda'

function toDateOrNull (d: unknown): Date | null {
  if (!d) return null
  try {
    if (d instanceof Date) return isNaN(d.getTime()) ? null : d
    if (typeof d === 'string' || typeof d === 'number') {
      const dt = new Date(d as any)
      return isNaN(dt.getTime()) ? null : dt
    }
    return null
  } catch {
    return null
  }
}

// yyyy-mm-dd (UTC)
function toDateOnly (dt: Date | null): string | null {
  if (!dt) return null
  const y = dt.getUTCFullYear()
  const m = String(dt.getUTCMonth() + 1).padStart(2, '0')
  const d = String(dt.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export const handler: APIGatewayProxyHandlerV2 = async event => {
  try {
    await connectMongo()

    const userId = event.queryStringParameters?.userId
    if (!userId) {
      return badRequest('query param "userId" é obrigatório')
    }

    // Pagination parameters
    const page = parseInt(event.queryStringParameters?.page || '1', 10)
    const limit = parseInt(event.queryStringParameters?.limit || '50', 10)
    const skip = (page - 1) * limit

    const repo = new TransactionRepository()

    // Get total count
    const total = await repo.countByUserId(userId)

    // Get paginated transactions
    const useCase = new ListTransactions(repo)
    const list = await useCase.execute(userId, { limit, skip })
    console.log('Transactions found:', list.length, 'of', total)

    const body = list.map(t => {
      const dt = toDateOrNull((t as any).date)

      const monthYear = dt
        ? `${String(dt.getUTCFullYear())}-${String(
            dt.getUTCMonth() + 1
          ).padStart(2, '0')}`
        : null

      return {
        id: (t as any).id,
        userId: (t as any).userId,
        description: (t as any).description,
        amount: Number((t as any).amount),
        type: (t as any).type,
        origin: (t as any).origin,
        card: (t as any).card,
        category: (t as any).categoryName,
        date: toDateOnly(dt),
        monthYear
      }
    })

    return json(200, {
      data: body,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total
      }
    })
  } catch (err) {
    return serverError(err)
  }
}
