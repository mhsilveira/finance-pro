import '../../bootstrap'
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { connectMongo } from '@infrastructure/database/mongodb/connection'
import { TransactionRepository } from '@infrastructure/database/mongodb/repositories/TransactionRepository'
import { ReprocessCategories } from '@domain/use-cases/ReprocessCategories'
import { json } from '@infrastructure/http/httpResponse'

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    await connectMongo()

    // Get userId from query params
    const userId = event.queryStringParameters?.userId
    if (!userId) {
      return json(400, { error: 'userId is required' })
    }

    // Initialize use case
    const transactionRepository = new TransactionRepository()
    const reprocessUseCase = new ReprocessCategories(transactionRepository)

    // Execute reprocessing
    const result = await reprocessUseCase.execute(userId)

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
