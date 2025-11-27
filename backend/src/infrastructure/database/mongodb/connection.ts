import mongoose from 'mongoose'

let isConnected = false

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
  return mongoose
}
