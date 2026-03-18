import '../../bootstrap'
import { CategorizeTransactions } from '@domain/use-cases/CategorizeTransactions'
import { OllamaService } from '@infrastructure/ai/OllamaService'
import { connectMongo } from '@infrastructure/database/mongodb/connection'
import { CategoryRepository } from '@infrastructure/database/mongodb/repositories/CategoryRepository'
import {
  badRequest,
  json,
  serverError
} from '@infrastructure/http/httpResponse'
import type { APIGatewayProxyHandlerV2 } from 'aws-lambda'

export const handler: APIGatewayProxyHandlerV2 = async event => {
  try {
    await connectMongo()

    const body = event.body ? JSON.parse(event.body as string) : {}
    const { descriptions } = body

    if (!Array.isArray(descriptions) || descriptions.length === 0) {
      return badRequest('descriptions deve ser um array não vazio')
    }
    if (descriptions.length > 200) {
      return badRequest('Máximo de 200 descrições por requisição')
    }

    const categoryRepo = new CategoryRepository()
    const allCategories = await categoryRepo.findAll()
    const categoryNames = allCategories.map((c: any) => c.name || c.value || c)

    const aiService = new OllamaService()
    const useCase = new CategorizeTransactions(aiService, categoryNames)
    const results = await useCase.execute(descriptions)

    return json(200, { results })
  } catch (err) {
    return serverError(err)
  }
}
