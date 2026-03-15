import mongoose from 'mongoose'
import { TransactionMongooseModel } from './models/TransactionModel'
import { CategoryModel } from './models/CategoryModel'

let isConnected = false
let indexesSynced = false

export async function connectMongo (): Promise<typeof mongoose> {
  if (isConnected) return mongoose

  const uri = process.env.MONGODB_URI

  if (!uri) {
    throw new Error('MONGODB_URI não definida no ambiente')
  }

  mongoose.set('strictQuery', true)

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    maxPoolSize: 10
  } as any)

  isConnected = true
  console.log('[MongoDB] Conectado')

  // Sync indexes once (creates new indexes like the idempotency unique constraint)
  if (!indexesSynced) {
    try {
      await TransactionMongooseModel.syncIndexes()
      await CategoryModel.syncIndexes()
      indexesSynced = true
      console.log('[MongoDB] Indexes synced successfully')
    } catch (err) {
      console.error('[MongoDB] Index sync FAILED:', err)
    }
  }

  return mongoose
}
