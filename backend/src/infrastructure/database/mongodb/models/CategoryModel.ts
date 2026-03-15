import mongoose, { Schema } from 'mongoose'

export interface ICategory {
  _id?: string
  key: string
  name: string
  type: 'income' | 'expense' | 'both'
  icon?: string
  color?: string
  keywords?: string[]
  sortOrder?: number
  createdAt?: Date
  updatedAt?: Date
}

const CategorySchema = new Schema<ICategory>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['income', 'expense', 'both'],
      required: true
    },
    icon: {
      type: String,
      trim: true
    },
    color: {
      type: String,
      trim: true
    },
    keywords: {
      type: [String],
      default: []
    },
    sortOrder: {
      type: Number,
      default: 100
    }
  },
  {
    timestamps: true,
    collection: 'categories'
  }
)

export const CategoryModel = mongoose.model<ICategory>(
  'Category',
  CategorySchema
)
