import '../../bootstrap'
import { GetTransaction } from '@domain/use-cases/GetTransaction'
import { connectMongo } from '@infrastructure/database/mongodb/connection'
import { TransactionRepository } from '@infrastructure/database/mongodb/repositories/TransactionRepository'
import { json, notFound, serverError } from '@infrastructure/http/httpResponse'
import type { APIGatewayProxyHandlerV2 } from 'aws-lambda'

export const handler: APIGatewayProxyHandlerV2 = async event => {
  try {
    await connectMongo()

    const id = event.pathParameters?.id as string
    const repo = new TransactionRepository()
    const useCase = new GetTransaction(repo)
    const found = await useCase.execute(id)

    if (!found) return notFound('Transaction not found')

    const safeISO = (v: any) =>
      v
        ? typeof v === 'string'
          ? new Date(v).toISOString()
          : v.toISOString()
        : null

    return json(200, {
      id: found.id,
      userId: found.userId,
      description: found.description,
      amount: found.amount,
      type: found.type,
      origin: found.origin,
      card: found.card,
      category: found.category,
      date: safeISO(found.date),
      createdAt: safeISO(found.createdAt),
      updatedAt: safeISO(found.updatedAt)
    })
  } catch (err) {
    return serverError(err)
  }
}
