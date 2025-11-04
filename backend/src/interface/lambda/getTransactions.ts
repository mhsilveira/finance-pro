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

    const repo = new TransactionRepository()
    const useCase = new ListTransactions(repo)
    const list = await useCase.execute(userId)

    const body = list.map(t => {
      const dt = toDateOrNull((t as any).date)
      const created = toDateOrNull((t as any).createdAt)
      const updated = toDateOrNull((t as any).updatedAt)

      const monthYear = dt
        ? `${String(dt.getUTCFullYear())}-${String(
            dt.getUTCMonth() + 1
          ).padStart(2, '0')}`
        : null

      // Se quiser manter ISO completo para casos que precisem de hora/min:
      const dateISO = dt ? dt.toISOString() : null

      return {
        id: (t as any).id,
        userId: (t as any).userId,
        description: (t as any).description,
        amount: Number((t as any).amount),
        type: (t as any).type,
        category: (t as any).category,
        date: toDateOnly(dt), // "YYYY-MM-DD" (UTC) padronizado
        monthYear, // "YYYY-MM"
        // dateISO,                    // ISO completo opcional: descomente se quiser expor
        createdAt: toDateOnly(created),
        updatedAt: toDateOnly(updated)
      }
    })

    return json(200, body)
  } catch (err) {
    return serverError(err)
  }
}
