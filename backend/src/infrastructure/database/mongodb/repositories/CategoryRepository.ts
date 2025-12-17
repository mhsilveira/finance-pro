import { CategoryModel, ICategory } from '../models/CategoryModel'

export class CategoryRepository {
  async findAll(): Promise<ICategory[]> {
    return await CategoryModel.find().sort({ name: 1 }).lean()
  }

  async findByKey(key: string): Promise<ICategory | null> {
    return await CategoryModel.findOne({ key: key.toUpperCase() }).lean()
  }

  async findByName(name: string): Promise<ICategory | null> {
    return await CategoryModel.findOne({ name }).lean()
  }

  async findByType(type: 'income' | 'expense'): Promise<ICategory[]> {
    return await CategoryModel.find({
      $or: [{ type }, { type: 'both' }]
    })
      .sort({ name: 1 })
      .lean()
  }

  async create(category: Omit<ICategory, '_id'>): Promise<ICategory> {
    const doc = new CategoryModel(category)
    return await doc.save()
  }

  async seedDefaultCategories(): Promise<void> {
    const count = await CategoryModel.countDocuments()
    if (count > 0) return // Já tem categorias

    const defaultCategories: Omit<ICategory, '_id'>[] = [
      {
        key: 'INCOME',
        name: 'Salário',
        type: 'income',
        icon: '💰',
        color: '#10b981'
      },
      {
        key: 'FREELANCE',
        name: 'Freelance',
        type: 'income',
        icon: '💼',
        color: '#3b82f6'
      },
      {
        key: 'INVESTMENT',
        name: 'Investimentos',
        type: 'income',
        icon: '📈',
        color: '#8b5cf6'
      },
      {
        key: 'RENT',
        name: 'Aluguel',
        type: 'expense',
        icon: '🏠',
        color: '#ef4444'
      },
      {
        key: 'FOOD',
        name: 'Alimentação',
        type: 'expense',
        icon: '🍔',
        color: '#f59e0b'
      },
      {
        key: 'TRANSPORT',
        name: 'Transporte',
        type: 'expense',
        icon: '🚗',
        color: '#06b6d4'
      },
      {
        key: 'SUBSCRIPTIONS',
        name: 'Assinaturas',
        type: 'expense',
        icon: '📺',
        color: '#ec4899'
      },
      {
        key: 'BILLS',
        name: 'Contas',
        type: 'expense',
        icon: '💡',
        color: '#f97316'
      },
      {
        key: 'HEALTH',
        name: 'Saúde',
        type: 'expense',
        icon: '⚕️',
        color: '#14b8a6'
      },
      {
        key: 'EDUCATION',
        name: 'Educação',
        type: 'expense',
        icon: '📚',
        color: '#6366f1'
      },
      {
        key: 'ENTERTAINMENT',
        name: 'Lazer',
        type: 'expense',
        icon: '🎮',
        color: '#a855f7'
      },
      {
        key: 'SHOPPING',
        name: 'Compras',
        type: 'expense',
        icon: '🛍️',
        color: '#f43f5e'
      },
      {
        key: 'CLOTHING',
        name: 'Vestuário',
        type: 'expense',
        icon: '👔',
        color: '#d946ef'
      },
      {
        key: 'GENERAL',
        name: 'Gastos Gerais',
        type: 'both',
        icon: '📦',
        color: '#64748b'
      },
      {
        key: 'OTHER',
        name: 'Outros',
        type: 'both',
        icon: '🔖',
        color: '#78716c'
      },
      {
        key: 'TO_CATEGORIZE',
        name: 'A Categorizar',
        type: 'expense',
        icon: '🏷️',
        color: '#9ca3af'
      }
    ]

    await CategoryModel.insertMany(defaultCategories)
  }
}
