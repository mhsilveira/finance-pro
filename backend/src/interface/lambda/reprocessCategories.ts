import '../../bootstrap'
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { connectMongo } from '@infrastructure/database/mongodb/connection'
import { TransactionRepository } from '@infrastructure/database/mongodb/repositories/TransactionRepository'
import { CategoryCorrectionRepository } from '@infrastructure/database/mongodb/repositories/CategoryCorrectionRepository'
import { CategoryRepository } from '@infrastructure/database/mongodb/repositories/CategoryRepository'
import { ReprocessCategories } from '@domain/use-cases/ReprocessCategories'
import { json } from '@infrastructure/http/httpResponse'

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    await connectMongo()

    const userId = event.queryStringParameters?.userId
    if (!userId) {
      return json(400, { error: 'userId is required' })
    }

    const transactionRepository = new TransactionRepository()
    const correctionRepository = new CategoryCorrectionRepository()
    const categoryRepository = new CategoryRepository()
    const reprocessUseCase = new ReprocessCategories(transactionRepository)

    const [corrections, categories] = await Promise.all([
      correctionRepository.findByUserId(userId),
      categoryRepository.findAll()
    ])

    const categoryRules = categories.map(c => ({
      name: c.name,
      keywords: c.keywords || [],
      sortOrder: c.sortOrder ?? 100
    }))

    const result = await reprocessUseCase.execute(userId, corrections, categoryRules)

    return json(200, {
      message: 'Categories reprocessed successfully',
      ...result
    })
  } catch (error) {
    console.error('Error reprocessing categories:', error)
    return json(500, {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
