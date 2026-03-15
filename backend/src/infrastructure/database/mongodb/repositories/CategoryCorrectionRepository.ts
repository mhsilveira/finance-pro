import { CategoryCorrectionModel, ICategoryCorrection } from '../models/CategoryCorrectionModel'

export class CategoryCorrectionRepository {
  async findByUserId (userId: string): Promise<ICategoryCorrection[]> {
    return await CategoryCorrectionModel.find({ userId })
      .sort({ updatedAt: -1 })
      .lean()
  }

  async upsert (
    userId: string,
    descriptionPattern: string,
    category: string
  ): Promise<ICategoryCorrection> {
    return await CategoryCorrectionModel.findOneAndUpdate(
      { userId, descriptionPattern },
      { userId, descriptionPattern, category },
      { upsert: true, new: true, lean: true }
    ) as ICategoryCorrection
  }

  async delete (id: string): Promise<boolean> {
    const result = await CategoryCorrectionModel.deleteOne({ _id: id })
    return result.deletedCount > 0
  }
}
