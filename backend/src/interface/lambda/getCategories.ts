import '../../bootstrap'
import { APIGatewayProxyHandlerV2 } from 'aws-lambda'
import { connectMongo } from '@infrastructure/database/mongodb/connection'
import { CategoryRepository } from '@infrastructure/database/mongodb/repositories/CategoryRepository'
import { json, serverError } from '@infrastructure/http/httpResponse'

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    await connectMongo()

    const categoryRepo = new CategoryRepository()

    // Seed default categories if empty
    await categoryRepo.seedDefaultCategories()

    const type = event.queryStringParameters?.type as
      | 'income'
      | 'expense'
      | undefined

    const categories = type
      ? await categoryRepo.findByType(type)
      : await categoryRepo.findAll()

    return json(200, categories)
  } catch (error: any) {
    console.error('Error fetching categories:', error)
    return serverError(error)
  }
}
