require('dotenv').config()
const mongoose = require('mongoose')

const CategorySchema = new mongoose.Schema({
  key: String,
  name: String,
  type: String,
  icon: String,
  color: String
})

const Category = mongoose.model('Category', CategorySchema)

async function resetCategories () {
  try {
    const mongoUri =
      process.env.MONGODB_URI || 'mongodb://localhost:27017/financial_control'
    console.log('Conectando ao MongoDB...')
    await mongoose.connect(mongoUri)
    console.log('Conectado!')

    // Deletar todas as categorias
    console.log('Deletando categorias existentes...')
    await Category.deleteMany({})
    console.log('Categorias deletadas!')

    // Inserir novas categorias
    console.log('Inserindo categorias padrão...')
    const defaultCategories = [
      {
        key: 'INCOME',
        name: 'Salário',
        type: 'income',
        icon: '💰',
        color: '#10b981'
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
      },
      {
        key: 'PETS',
        name: 'Pets',
        type: 'expense',
        icon: '🐕',
        color: '#14b8a6'
      }
    ]

    await Category.insertMany(defaultCategories)
    console.log(
      `✅ ${defaultCategories.length} categorias inseridas com sucesso!`
    )

    // Listar categorias
    const categories = await Category.find({}).sort({ name: 1 })
    console.log('\nCategorias no banco:')
    categories.forEach(cat => {
      console.log(`  ${cat.icon} ${cat.name} (${cat.key}) - ${cat.type}`)
    })

    await mongoose.connection.close()
    console.log('\nConexão fechada. Pronto!')
    process.exit(0)
  } catch (error) {
    console.error('Erro:', error)
    process.exit(1)
  }
}

resetCategories()
