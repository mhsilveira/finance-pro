import { CategoryModel, ICategory } from '../models/CategoryModel'

export class CategoryRepository {
  async findAll (): Promise<ICategory[]> {
    return await CategoryModel.find().sort({ sortOrder: 1, name: 1 }).lean()
  }

  async findByKey (key: string): Promise<ICategory | null> {
    return await CategoryModel.findOne({ key: key.toUpperCase() }).lean()
  }

  async findByName (name: string): Promise<ICategory | null> {
    return await CategoryModel.findOne({ name }).lean()
  }

  async findByType (type: 'income' | 'expense'): Promise<ICategory[]> {
    return await CategoryModel.find({
      $or: [{ type }, { type: 'both' }]
    })
      .sort({ sortOrder: 1, name: 1 })
      .lean()
  }

  async create (category: Omit<ICategory, '_id'>): Promise<ICategory> {
    const doc = new CategoryModel(category)
    return await doc.save()
  }

  async update (
    key: string,
    data: Partial<Omit<ICategory, '_id' | 'key'>>
  ): Promise<ICategory | null> {
    return await CategoryModel.findOneAndUpdate(
      { key: key.toUpperCase() },
      { $set: data },
      { new: true, lean: true }
    )
  }

  async delete (key: string): Promise<boolean> {
    const result = await CategoryModel.deleteOne({ key: key.toUpperCase() })
    return result.deletedCount > 0
  }

  async seedDefaultCategories (): Promise<void> {
    const count = await CategoryModel.countDocuments()
    if (count > 0) {
      await this.migrateKeywords()
      return
    }

    const defaultCategories: Omit<ICategory, '_id'>[] = [
      {
        key: 'INCOME',
        name: 'Salário',
        type: 'income',
        icon: '💰',
        color: '#10b981',
        keywords: [],
        sortOrder: 1
      },
      {
        key: 'SUBSCRIPTIONS',
        name: 'Assinaturas',
        type: 'expense',
        icon: '📺',
        color: '#ec4899',
        keywords: [
          'NETFLIX',
          'SPOTIFY',
          'PRIME VIDEO',
          'AMAZON PRIME',
          'HBO',
          'DISNEY',
          'YOUTUBE PREMIUM',
          'APPLE.COM',
          'APPLE MUSIC',
          'DEEZER',
          'GLOBOPLAY',
          'PARAMOUNT',
          'CRUNCHYROLL',
          'STAR+',
          'ICLOUD',
          'GOOGLE ONE',
          'DROPBOX',
          'CHATGPT',
          'OPENAI'
        ],
        sortOrder: 11
      },
      {
        key: 'TRANSPORT',
        name: 'Transporte',
        type: 'expense',
        icon: '🚗',
        color: '#06b6d4',
        keywords: [
          'UBER',
          '99',
          '99POP',
          'TAXI',
          'POSTO',
          'IPIRANGA',
          'SHELL',
          'AUTO',
          'COMBUSTIVEL',
          'GASOLINA',
          'ETANOL',
          'PEDAGIO',
          'PEDÁGIO',
          'ESTACIONAMENTO',
          'ONIBUS',
          'METRO',
          'BUS',
          'RECARGA BOM',
          'BILHETE UNICO'
        ],
        sortOrder: 12
      },
      {
        key: 'FOOD',
        name: 'Alimentação',
        type: 'expense',
        icon: '🍔',
        color: '#f59e0b',
        keywords: [
          'IFOOD',
          'RAPPI',
          'EATS',
          'MP * NOVAPOINT',
          'NOVAPOINT',
          'MC DONALDS',
          'MCDONALDS',
          'BURGER KING',
          'BURGUER',
          'PADARIA',
          'MERCADO',
          'ATACADAO',
          'ATACADÃO',
          'ASSAI',
          'ASSAÍ',
          'CARREFOUR',
          'PAO DE ACUCAR',
          'PÃO DE AÇÚCAR',
          'EXTRA',
          'BIG',
          'RESTAURANTE',
          'LANCHONETE',
          'PIZZARIA',
          'PIZZA',
          'CAFE',
          'CAFÉ',
          'LANCHES',
          'FOOD',
          'SUPERMERC',
          'HORTIFRUTI',
          'NATURAL DA TERRA',
          'SAMS CLUB',
          "SAM'S CLUB",
          'COSTCO',
          'MAKRO',
          'REDE',
          'MATEUS'
        ],
        sortOrder: 13
      },
      {
        key: 'SHOPPING',
        name: 'Compras',
        type: 'expense',
        icon: '🛍️',
        color: '#f43f5e',
        keywords: [
          'SHOPEE',
          'ALIEXPRESS',
          'MERCADO LIVRE',
          'MERCADOLIVRE',
          'MAGALU',
          'MAGAZINE LUIZA',
          'AMAZON',
          'AMERICANAS',
          'CASAS BAHIA',
          'KABUM',
          'PONTO FRIO',
          'SUBMARINO',
          'WISH',
          'TEMU'
        ],
        sortOrder: 14
      },
      {
        key: 'ENTERTAINMENT',
        name: 'Lazer',
        type: 'expense',
        icon: '🎮',
        color: '#a855f7',
        keywords: [
          'CINEMA',
          'INGRESSO',
          'TEATRO',
          'SHOW',
          'PARQUE',
          'MUSEU',
          'EVENTO',
          'BOLICHE',
          'ESCAPE',
          'KARAOKE'
        ],
        sortOrder: 15
      },
      {
        key: 'BILLS',
        name: 'Contas',
        type: 'expense',
        icon: '💡',
        color: '#f97316',
        keywords: [
          'ENERGIA',
          'LUZ',
          'CELPE',
          'CEMIG',
          'CPFL',
          'ENEL',
          'AGUA',
          'ÁGUA',
          'SANEAMENTO',
          'SABESP',
          'COMPESA',
          'INTERNET',
          'TELEFONE',
          'TIM',
          'VIVO',
          'CLARO',
          'OI',
          'SKY',
          'NET',
          'CONDOMINIO',
          'CONDOMÍNIO',
          'IPTU',
          'GAS NATURAL',
          'COMGAS'
        ],
        sortOrder: 16
      },
      {
        key: 'HEALTH',
        name: 'Saúde',
        type: 'expense',
        icon: '⚕️',
        color: '#14b8a6',
        keywords: [
          'FARMACIA',
          'FARMÁCIA',
          'DROGARIA',
          'DROGA',
          'HOSPITAL',
          'CLINICA',
          'CLÍNICA',
          'LABORATORIO',
          'LABORATÓRIO',
          'CONSULTA',
          'MEDICO',
          'MÉDICO',
          'DENTAL',
          'ODONTO',
          'UNIMED',
          'AMIL',
          'SULAMERICA',
          'HAPVIDA',
          'BRADESCO SAUDE',
          'RAIA',
          'PANVEL',
          'PAGUE MENOS',
          'DROGASIL',
          'PACHECO'
        ],
        sortOrder: 17
      },
      {
        key: 'EDUCATION',
        name: 'Educação',
        type: 'expense',
        icon: '📚',
        color: '#6366f1',
        keywords: [
          'ESCOLA',
          'FACULDADE',
          'UNIVERSIDADE',
          'CURSO',
          'UDEMY',
          'COURSERA',
          'ALURA',
          'ROCKETSEAT',
          'LIVRO',
          'LIVRARIA',
          'EDUCACAO',
          'EDUCAÇÃO',
          'MATRICULA',
          'MENSALIDADE'
        ],
        sortOrder: 18
      },
      {
        key: 'CLOTHING',
        name: 'Vestuário',
        type: 'expense',
        icon: '👔',
        color: '#d946ef',
        keywords: [
          'RENNER',
          'RIACHUELO',
          'C&A',
          'ZARA',
          'SHEIN',
          'NIKE',
          'ADIDAS',
          'ROUPA',
          'CALCADO',
          'CALÇADO',
          'SAPATO',
          'TENIS',
          'TÊNIS',
          'MODA',
          'CENTAURO',
          'NETSHOES'
        ],
        sortOrder: 19
      },
      {
        key: 'GENERAL',
        name: 'Gastos Gerais',
        type: 'both',
        icon: '📦',
        color: '#64748b',
        keywords: [],
        sortOrder: 90
      },
      {
        key: 'OTHER',
        name: 'Outros',
        type: 'both',
        icon: '🔖',
        color: '#78716c',
        keywords: [],
        sortOrder: 98
      },
      {
        key: 'TO_CATEGORIZE',
        name: 'A Categorizar',
        type: 'expense',
        icon: '🏷️',
        color: '#9ca3af',
        keywords: [],
        sortOrder: 99
      },
      {
        key: 'PETS',
        name: 'Pets',
        type: 'expense',
        icon: '🐕',
        color: '#9ca3af',
        keywords: ['PETZ', 'PETLOVE', 'PET'],
        sortOrder: 30
      }
    ]

    await CategoryModel.insertMany(defaultCategories)
  }

  private async migrateKeywords (): Promise<void> {
    const withKeywords = await CategoryModel.findOne({
      keywords: { $exists: true, $ne: [] }
    }).lean()

    if (withKeywords) return

    const keywordMap: Record<
      string,
      { keywords: string[]; sortOrder: number }
    > = {
      SUBSCRIPTIONS: {
        keywords: [
          'NETFLIX',
          'SPOTIFY',
          'PRIME VIDEO',
          'AMAZON PRIME',
          'HBO',
          'DISNEY',
          'YOUTUBE',
          'APPLE.COM',
          'APPLE MUSIC',
          ' APPLE',
          'DEEZER',
          'GLOBOPLAY',
          'PARAMOUNT',
          'CRUNCHYROLL',
          'STAR+',
          'ICLOUD',
          'GOOGLE ONE',
          'DROPBOX',
          'CHATGPT',
          'OPENAI'
        ],
        sortOrder: 11
      },
      TRANSPORT: {
        keywords: [
          'UBER',
          '99',
          '99POP',
          'TAXI',
          'POSTO',
          'IPIRANGA',
          'SHELL',
          'AUTO',
          'COMBUSTIVEL',
          'GASOLINA',
          'ETANOL',
          'PEDAGIO',
          'PEDÁGIO',
          'ESTACIONAMENTO',
          'ONIBUS',
          'METRO',
          'BUS',
          'RECARGA BOM',
          'BILHETE UNICO'
        ],
        sortOrder: 12
      },
      FOOD: {
        keywords: [
          'IFOOD',
          'RAPPI',
          'EATS',
          'MC DONALDS',
          'MCDONALDS',
          'BURGER KING',
          'BURGUER',
          'PADARIA',
          'MERCADO',
          'ATACADAO',
          'ATACADÃO',
          'ASSAI',
          'ASSAÍ',
          'CARREFOUR',
          'PAO DE ACUCAR',
          'PÃO DE AÇÚCAR',
          'EXTRA',
          'BIG',
          'RESTAURANTE',
          'LANCHONETE',
          'PIZZARIA',
          'PIZZA',
          'CAFE',
          'CAFÉ',
          'LANCHES',
          'FOOD',
          'SUPERMERC',
          'HORTIFRUTI',
          'NATURAL DA TERRA',
          'SAMS CLUB',
          "SAM'S CLUB",
          'COSTCO',
          'MAKRO',
          'REDE',
          'MATEUS'
        ],
        sortOrder: 13
      },
      SHOPPING: {
        keywords: [
          'SHOPEE',
          'ALIEXPRESS',
          'MERCADO LIVRE',
          'MERCADOLIVRE',
          'MAGALU',
          'MAGAZINE LUIZA',
          'AMAZON',
          'AMERICANAS',
          'CASAS BAHIA',
          'KABUM',
          'PONTO FRIO',
          'SUBMARINO',
          'WISH',
          'TEMU'
        ],
        sortOrder: 14
      },
      ENTERTAINMENT: {
        keywords: [
          'CINEMA',
          'INGRESSO',
          'TEATRO',
          'SHOW',
          'PARQUE',
          'MUSEU',
          'EVENTO',
          'BOLICHE',
          'ESCAPE',
          'KARAOKE'
        ],
        sortOrder: 15
      },
      BILLS: {
        keywords: [
          'ENERGIA',
          'LUZ',
          'CELPE',
          'CEMIG',
          'CPFL',
          'ENEL',
          'AGUA',
          'ÁGUA',
          'SANEAMENTO',
          'SABESP',
          'COMPESA',
          'INTERNET',
          'TELEFONE',
          'TIM',
          'VIVO',
          'CLARO',
          'OI',
          'SKY',
          'NET',
          'CONDOMINIO',
          'CONDOMÍNIO',
          'IPTU',
          'GAS NATURAL',
          'COMGAS'
        ],
        sortOrder: 16
      },
      HEALTH: {
        keywords: [
          'FARMACIA',
          'FARMÁCIA',
          'DROGARIA',
          'DROGA',
          'HOSPITAL',
          'CLINICA',
          'CLÍNICA',
          'LABORATORIO',
          'LABORATÓRIO',
          'CONSULTA',
          'MEDICO',
          'MÉDICO',
          'DENTAL',
          'ODONTO',
          'UNIMED',
          'AMIL',
          'SULAMERICA',
          'HAPVIDA',
          'BRADESCO SAUDE',
          'RAIA',
          'PANVEL',
          'PAGUE MENOS',
          'DROGASIL',
          'PACHECO'
        ],
        sortOrder: 17
      },
      EDUCATION: {
        keywords: [
          'ESCOLA',
          'FACULDADE',
          'UNIVERSIDADE',
          'CURSO',
          'UDEMY',
          'COURSERA',
          'ALURA',
          'ROCKETSEAT',
          'LIVRO',
          'LIVRARIA',
          'EDUCACAO',
          'EDUCAÇÃO',
          'MATRICULA',
          'MENSALIDADE'
        ],
        sortOrder: 18
      },
      CLOTHING: {
        keywords: [
          'RENNER',
          'RIACHUELO',
          'C&A',
          'ZARA',
          'SHEIN',
          'NIKE',
          'ADIDAS',
          'ROUPA',
          'CALCADO',
          'CALÇADO',
          'SAPATO',
          'TENIS',
          'TÊNIS',
          'MODA',
          'CENTAURO',
          'NETSHOES'
        ],
        sortOrder: 19
      },
      INCOME: { keywords: [], sortOrder: 1 },
      GENERAL: { keywords: [], sortOrder: 90 },
      OTHER: { keywords: [], sortOrder: 98 },
      TO_CATEGORIZE: { keywords: [], sortOrder: 99 }
    }

    const ops = Object.entries(keywordMap).map(([key, data]) =>
      CategoryModel.updateOne(
        { key },
        { $set: { keywords: data.keywords, sortOrder: data.sortOrder } }
      )
    )

    await Promise.all(ops)
    console.log('[CategoryRepository] Migrated keywords to existing categories')
  }
}
