import '../../bootstrap'
import { connectMongo } from '@infrastructure/database/mongodb/connection'
import { TransactionRepository } from '@infrastructure/database/mongodb/repositories/TransactionRepository'
import { badRequest, json, serverError } from '@infrastructure/http/httpResponse'
import type { APIGatewayProxyHandlerV2 } from 'aws-lambda'

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    await connectMongo()

    const userId = event.queryStringParameters?.userId
    if (!userId) {
      return badRequest('query param "userId" é obrigatório')
    }

    const monthFrom = event.queryStringParameters?.monthFrom || undefined
    const monthTo = event.queryStringParameters?.monthTo || undefined

    const repo = new TransactionRepository()
    const stats = await repo.getStats(userId, { monthFrom, monthTo })

    return json(200, stats)
  } catch (err) {
    return serverError(err)
  }
}
