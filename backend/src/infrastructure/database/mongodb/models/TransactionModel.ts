import mongoose, { Schema, model, models } from 'mongoose'

const TransactionSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    description: { type: String, required: true, trim: true },
    amount: { type: mongoose.Schema.Types.Decimal128, required: true },
    currency: { type: String, default: 'BRL' },
    type: { type: String, required: true, enum: ['income', 'expense'] },
    origin: { type: String, enum: ['CREDIT_CARD', 'CASH'], default: null },
    card: { type: String, default: null },
    bank: { type: String, default: null },
    categoryId: { type: String, default: null, index: true },
    categoryName: { type: String, required: true },
    date: { type: Date, required: true },
    monthYear: { type: String, required: true, index: true },
    deletedAt: { type: Date, default: null },
    idempotencyKey: { type: String, default: null, index: true }
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    collection: 'transactions'
  }
)

TransactionSchema.index(
  { userId: 1, idempotencyKey: 1 },
  { unique: true, partialFilterExpression: { idempotencyKey: { $type: 'string' } } }
)

TransactionSchema.method('toDomain', function () {
  const amountStr = this.amount ? this.amount.toString() : '0'
  return {
    id: this._id.toString(),
    userId: this.userId,
    description: this.description,
    amount: parseFloat(amountStr),
    currency: this.currency,
    type: this.type,
    origin: this.origin,
    card: this.card,
    bank: this.bank,
    categoryId: this.categoryId,
    categoryName: this.categoryName,
    date: this.date,
    monthYear: this.monthYear,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    deletedAt: this.deletedAt
  }
})

export const TransactionMongooseModel =
  models.Transaction || model('Transaction', TransactionSchema)
