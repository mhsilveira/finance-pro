import mongoose, { Schema, model, models } from 'mongoose'

const TransactionSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    description: { type: String, required: true, trim: true },
    amount: { type: mongoose.Schema.Types.Decimal128, required: true }, // Decimal128
    currency: { type: String, default: 'BRL' },
    type: { type: String, required: true, enum: ['income', 'expense'] },
    origin: { type: String, enum: ['CREDIT_CARD', 'CASH'], default: null },
    card: { type: String, default: null },
    bank: { type: String, default: null },
    categoryId: { type: String, default: null, index: true }, // referencia leve
    categoryName: { type: String, required: true }, // denormalizado
    date: { type: Date, required: true },
    monthYear: { type: String, required: true, index: true }, // 'YYYY-MM'
    deletedAt: { type: Date, default: null }
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    collection: 'transactions'
  }
)

// método helper para domain object (converte Decimal128 pra number/string)
TransactionSchema.method('toDomain', function () {
  const amountStr = this.amount ? this.amount.toString() : '0'
  return {
    id: this._id.toString(),
    userId: this.userId,
    description: this.description,
    amount: parseFloat(amountStr), // pra front usar Intl.NumberFormat direto
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
