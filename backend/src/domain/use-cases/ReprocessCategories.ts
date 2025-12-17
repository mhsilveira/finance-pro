import type { ITransactionRepository } from '../repositories/ITransactionRepository'

interface ReprocessResult {
  total: number
  updated: number
  unchanged: number
}

export class ReprocessCategories {
  constructor (
    private readonly transactionRepository: ITransactionRepository
  ) {}

  async execute (userId: string): Promise<ReprocessResult> {
    const transactions = await this.transactionRepository.findByUserId(userId)

    let updated = 0
    let unchanged = 0

    for (const transaction of transactions) {
      const predictedCategory = this.predictCategory(transaction.description || '')

      if (predictedCategory !== transaction.category) {
        transaction.category = predictedCategory
        await this.transactionRepository.update(transaction.id, {
          category: predictedCategory
        })
        updated++
      } else {
        unchanged++
      }
    }

    return {
      total: transactions.length,
      updated,
      unchanged
    }
  }

  /**
   * Predicts the category of a transaction based on its description
   * This is a simplified version matching the frontend logic
   */
  private predictCategory (description: string): string {
    if (!description || description.trim().length === 0) {
      return 'Outros'
    }

    const normalized = description
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')

    // Transporte
    if (
      /UBER|99|TAXI|POSTO|IPIRANGA|SHELL|AUTO|COMBUSTIVEL|GASOLINA|ETANOL|PEDAGIO|ESTACIONAMENTO|ONIBUS|METRO|BUS/.test(
        normalized
      )
    ) {
      return 'Transporte'
    }

    // Alimentação
    if (
      /IFOOD|RAPPI|EATS|MC ?DONALDS|BURGUER|BURGER KING|PADARIA|MERCADO|ATACADAO|ASSAI|CARREFOUR|PAO DE ACUCAR|EXTRA|BIG|RESTAURANTE|LANCHONETE|PIZZARIA|PIZZA|CAFE|BAR|LANCHES|FOOD|SUPERMERC/.test(
        normalized
      )
    ) {
      return 'Alimentação'
    }

    // Lazer
    if (
      /NETFLIX|SPOTIFY|PRIME|HBO|DISNEY|AMAZON PRIME|YOUTUBE|APPLE\.COM|APPLE MUSIC|DEEZER|CINEMA|INGRESSO|TEATRO|SHOW|PARQUE/.test(
        normalized
      )
    ) {
      return 'Lazer'
    }

    // Contas
    if (
      /ENERGIA|LUZ|CELPE|CEMIG|CPFL|AGUA|SANEAMENTO|INTERNET|TELEFONE|TIM|VIVO|CLARO|OI|SKY|NET|CONDOMINIO|ALUGUEL/.test(
        normalized
      )
    ) {
      return 'Contas'
    }

    // Saúde
    if (
      /FARMACIA|DROGARIA|DROGA|HOSPITAL|CLINICA|LABORATORIO|CONSULTA|MEDICO|DENTAL|ODONTO|UNIMED|AMIL|SULAMERICA/.test(
        normalized
      )
    ) {
      return 'Saúde'
    }

    // Educação
    if (
      /ESCOLA|FACULDADE|UNIVERSIDADE|CURSO|UDEMY|COURSERA|LIVRO|LIVRARIA|EDUCACAO|MATRICULA|MENSALIDADE/.test(
        normalized
      )
    ) {
      return 'Educação'
    }

    // Vestuário
    if (
      /RENNER|RIACHUELO|C&A|ZARA|SHEIN|NIKE|ADIDAS|ROUPA|CALCADO|SAPATO|TENIS|MODA/.test(
        normalized
      )
    ) {
      return 'Vestuário'
    }

    return 'Outros'
  }
}
