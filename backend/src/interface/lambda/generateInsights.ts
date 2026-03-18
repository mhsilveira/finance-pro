import '../../bootstrap'
import { GenerateSpendingInsights } from '@domain/use-cases/GenerateSpendingInsights'
import { OllamaService } from '@infrastructure/ai/OllamaService'
import { connectMongo } from '@infrastructure/database/mongodb/connection'
import { TransactionRepository } from '@infrastructure/database/mongodb/repositories/TransactionRepository'
import {
  badRequest,
  json,
  serverError
} from '@infrastructure/http/httpResponse'
import type { APIGatewayProxyHandlerV2 } from 'aws-lambda'

export const handler: APIGatewayProxyHandlerV2 = async event => {
  try {
    await connectMongo()

    const userId = event.queryStringParameters?.userId
    const month = event.queryStringParameters?.month

    if (!userId) {
      return badRequest('query param "userId" é obrigatório')
    }
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return badRequest('query param "month" é obrigatório (formato: YYYY-MM)')
    }

    const aiService = new OllamaService()
    const transactionRepo = new TransactionRepository()
    const useCase = new GenerateSpendingInsights(aiService, transactionRepo)
    const insights = await useCase.execute(userId, month)

    return json(200, insights)
  } catch (err) {
    return serverError(err)
  }
}
