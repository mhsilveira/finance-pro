import '../../bootstrap'
import { connectMongo } from '@infrastructure/database/mongodb/connection'
import { TransactionMongooseModel } from '@infrastructure/database/mongodb/models/TransactionModel'
import { json, badRequest, serverError } from '@infrastructure/http/httpResponse'
import type { APIGatewayProxyHandlerV2 } from 'aws-lambda'

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    await connectMongo()

    const userId = event.queryStringParameters?.userId
    if (!userId) {
      return badRequest('userId is required')
    }

    const result = await TransactionMongooseModel.deleteMany({ userId })

    return json(200, {
      message: `Deleted ${result.deletedCount} transactions`,
      deletedCount: result.deletedCount
    })
  } catch (err) {
    return serverError(err)
  }
}
