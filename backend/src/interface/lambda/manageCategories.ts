import '../../bootstrap'
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { connectMongo } from '@infrastructure/database/mongodb/connection'
import { CategoryRepository } from '@infrastructure/database/mongodb/repositories/CategoryRepository'
import { json } from '@infrastructure/http/httpResponse'

const repo = new CategoryRepository()

export const createHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    await connectMongo()

    const body = JSON.parse(event.body || '{}')
    const { key, name, type, icon, color, keywords, sortOrder } = body

    if (!key || !name || !type) {
      return json(400, { error: 'key, name, and type are required' })
    }

    if (!['income', 'expense', 'both'].includes(type)) {
      return json(400, { error: 'type must be income, expense, or both' })
    }

    const existing = await repo.findByKey(key)
    if (existing) {
      return json(409, { error: `Category with key '${key}' already exists` })
    }

    const category = await repo.create({
      key: key.toUpperCase(),
      name,
      type,
      icon,
      color,
      keywords: keywords || [],
      sortOrder: sortOrder ?? 100
    })
    return json(201, category)
  } catch (error) {
    console.error('Error creating category:', error)
    return json(500, {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export const updateHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    await connectMongo()

    const key = event.pathParameters?.key
    if (!key) {
      return json(400, { error: 'Category key is required' })
    }

    const body = JSON.parse(event.body || '{}')
    const { name, type, icon, color, keywords, sortOrder } = body

    const updateData: any = {}
    if (name) updateData.name = name
    if (type) updateData.type = type
    if (icon !== undefined) updateData.icon = icon
    if (color !== undefined) updateData.color = color
    if (keywords !== undefined) updateData.keywords = keywords
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder

    if (Object.keys(updateData).length === 0) {
      return json(400, { error: 'At least one field must be provided' })
    }

    const updated = await repo.update(key, updateData)
    if (!updated) {
      return json(404, { error: `Category '${key}' not found` })
    }

    return json(200, updated)
  } catch (error) {
    console.error('Error updating category:', error)
    return json(500, {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export const deleteHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    await connectMongo()

    const key = event.pathParameters?.key
    if (!key) {
      return json(400, { error: 'Category key is required' })
    }

    const deleted = await repo.delete(key)
    if (!deleted) {
      return json(404, { error: `Category '${key}' not found` })
    }

    return json(200, { message: `Category '${key}' deleted` })
  } catch (error) {
    console.error('Error deleting category:', error)
    return json(500, {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
