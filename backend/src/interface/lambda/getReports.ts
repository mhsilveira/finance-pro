import '../../bootstrap'
import { connectMongo } from '@infrastructure/database/mongodb/connection'
import { TransactionMongooseModel } from '@infrastructure/database/mongodb/models/TransactionModel'
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
    if (!userId) {
      return badRequest('query param "userId" é obrigatório')
    }

    const monthlyTrends = await TransactionMongooseModel.aggregate([
      { $match: { userId } },
      {
        $addFields: {
          dateObj: {
            $cond: [
              { $ne: [{ $type: '$date' }, 'date'] },
              { $toDate: '$date' },
              '$date'
            ]
          }
        }
      },
      {
        $addFields: {
          y: { $year: { date: '$dateObj', timezone: 'UTC' } },
          m: { $month: { date: '$dateObj', timezone: 'UTC' } }
        }
      },
      {
        $group: {
          _id: { y: '$y', m: '$m' },
          income: {
            $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] }
          },
          expense: {
            $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          monthYear: {
            $concat: [
              { $toString: '$_id.y' },
              '-',
              {
                $cond: [
                  { $lte: ['$_id.m', 9] },
                  { $concat: ['0', { $toString: '$_id.m' }] },
                  { $toString: '$_id.m' }
                ]
              }
            ]
          },
          income: 1,
          expense: 1,
          balance: { $subtract: ['$income', '$expense'] }
        }
      },
      { $sort: { monthYear: 1 } }
    ]).exec()

    const categoryBreakdown = await TransactionMongooseModel.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: { type: '$type', category: '$category' },
          amount: { $sum: '$amount' }
        }
      },
      {
        $project: {
          _id: 0,
          type: '$_id.type',
          category: '$_id.category',
          amount: 1
        }
      },
      { $sort: { type: 1, amount: -1 } }
    ]).exec()

    const avgDoc = await TransactionMongooseModel.aggregate([
      { $match: { userId, type: 'expense' } },
      {
        $addFields: {
          dateObj: {
            $cond: [
              { $ne: [{ $type: '$date' }, 'date'] },
              { $toDate: '$date' },
              '$date'
            ]
          }
        }
      },
      {
        $addFields: {
          y: { $year: { date: '$dateObj', timezone: 'UTC' } },
          m: { $month: { date: '$dateObj', timezone: 'UTC' } }
        }
      },
      {
        $group: {
          _id: { y: '$y', m: '$m' },
          expense: { $sum: '$amount' }
        }
      },
      {
        $addFields: {
          daysInMonth: {
            $let: {
              vars: { y: '$_id.y', m: '$_id.m' },
              in: {
                $switch: {
                  branches: [
                    {
                      case: { $in: ['$$m', [1, 3, 5, 7, 8, 10, 12]] },
                      then: 31
                    },
                    { case: { $in: ['$$m', [4, 6, 9, 11]] }, then: 30 },
                    {
                      case: { $eq: ['$$m', 2] },
                      then: {
                        $cond: [
                          {
                            $or: [
                              {
                                $and: [
                                  { $eq: [{ $mod: ['$$y', 4] }, 0] },
                                  { $ne: [{ $mod: ['$$y', 100] }, 0] }
                                ]
                              },
                              { $eq: [{ $mod: ['$$y', 400] }, 0] }
                            ]
                          },
                          29,
                          28
                        ]
                      }
                    }
                  ],
                  default: 30
                }
              }
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          avgDailySpending: { $divide: ['$expense', '$daysInMonth'] }
        }
      },
      {
        $group: {
          _id: null,
          averageDailySpending: { $avg: '$avgDailySpending' }
        }
      },
      { $project: { _id: 0, averageDailySpending: 1 } }
    ]).exec()

    const averageDailySpending = avgDoc?.[0]?.averageDailySpending ?? 0

    return json(200, {
      monthlyTrends,
      categoryBreakdown,
      averageDailySpending
    })
  } catch (err) {
    return serverError(err)
  }
}
