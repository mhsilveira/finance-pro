import mongoose, { Schema } from 'mongoose'

export interface ICategoryCorrection {
  _id?: string
  userId: string
  descriptionPattern: string
  category: string
  createdAt?: Date
  updatedAt?: Date
}

const CategoryCorrectionSchema = new Schema<ICategoryCorrection>(
  {
    userId: {
      type: String,
      required: true,
      trim: true
    },
    descriptionPattern: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true,
    collection: 'category_corrections'
  }
)

CategoryCorrectionSchema.index(
  { userId: 1, descriptionPattern: 1 },
  { unique: true }
)

export const CategoryCorrectionModel = mongoose.model<ICategoryCorrection>(
  'CategoryCorrection',
  CategoryCorrectionSchema
)
