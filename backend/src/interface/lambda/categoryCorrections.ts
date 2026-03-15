import '../../bootstrap'
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { connectMongo } from '@infrastructure/database/mongodb/connection'
import { CategoryCorrectionRepository } from '@infrastructure/database/mongodb/repositories/CategoryCorrectionRepository'
import { json } from '@infrastructure/http/httpResponse'

const repo = new CategoryCorrectionRepository()

export const getHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    await connectMongo()

    const userId = event.queryStringParameters?.userId
    if (!userId) {
      return json(400, { error: 'userId is required' })
    }

    const corrections = await repo.findByUserId(userId)
    return json(200, corrections)
  } catch (error) {
    console.error('Error fetching category corrections:', error)
    return json(500, {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export const postHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    await connectMongo()

    const body = JSON.parse(event.body || '{}')
    const { userId, descriptionPattern, category } = body

    if (!userId || !descriptionPattern || !category) {
      return json(400, {
        error: 'userId, descriptionPattern, and category are required'
      })
    }

    const correction = await repo.upsert(userId, descriptionPattern, category)
    return json(201, correction)
  } catch (error) {
    console.error('Error saving category correction:', error)
    return json(500, {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
