import { model, models, Schema } from "mongoose";

const TransactionSchema = new Schema(
    {
        userId: { type: String, required: true, index: true },
        description: { type: String, required: true, trim: true },
        amount: { type: Number, required: true, min: 0.01 },
        type: { type: String, required: true, enum: ["income", "expense"] },
        category: { type: String, required: true, trim: true },
        date: { type: Date, required: true },
    },
    {
        timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
        collection: "transactions",
    },
);

TransactionSchema.method("toDomain", function () {
    return {
        id: this._id.toString(),
        userId: this.userId,
        description: this.description,
        amount: this.amount,
        type: this.type,
        category: this.category,
        date: this.date,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
    };
});

export const TransactionMongooseModel = models.Transaction || model("Transaction", TransactionSchema);
