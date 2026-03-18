import { ENV } from '@shared/config/env'
import type {
  IAIService,
  CategorizeResult,
  SpendingInsight,
  SpendingData
} from '@domain/services/IAIService'

export class OllamaService implements IAIService {
  private readonly baseUrl: string
  private readonly model: string

  constructor() {
    this.baseUrl = ENV.OLLAMA_BASE_URL
    this.model = ENV.OLLAMA_MODEL
  }

  async categorizeTransactions(
    descriptions: string[],
    availableCategories: string[]
  ): Promise<CategorizeResult[]> {
    const prompt = `Você é um categorizador de transações financeiras brasileiras.
Classifique cada descrição de transação em EXATAMENTE uma das categorias disponíveis.

Categorias disponíveis: ${availableCategories.join(', ')}

Transações para classificar:
${descriptions.map((d, i) => `${i + 1}. "${d}"`).join('\n')}

Responda APENAS com um JSON array, sem explicações:
[{"description": "...", "category": "...", "confidence": 0.0-1.0}]

Regras:
- Use EXATAMENTE os nomes das categorias listadas acima
- confidence deve refletir sua certeza (0.0 = incerto, 1.0 = certeza absoluta)
- Se não conseguir classificar, use "A Categorizar" com confidence 0.0`

    try {
      const response = await this.generate(prompt)
      const parsed = this.extractJSON<Array<{ description: string; category: string; confidence: number }>>(response)

      if (!Array.isArray(parsed)) {
        return descriptions.map(d => ({ description: d, suggestedCategory: 'A Categorizar', confidence: 0 }))
      }

      return descriptions.map((desc, i) => {
        const match = parsed[i] || parsed.find(p => p.description === desc)
        if (match && availableCategories.includes(match.category)) {
          return {
            description: desc,
            suggestedCategory: match.category,
            confidence: Math.min(1, Math.max(0, match.confidence || 0))
          }
        }
        return { description: desc, suggestedCategory: 'A Categorizar', confidence: 0 }
      })
    } catch (err) {
      console.error('[OllamaService] categorize error:', err)
      return descriptions.map(d => ({ description: d, suggestedCategory: 'A Categorizar', confidence: 0 }))
    }
  }

  async generateSpendingInsights(data: SpendingData): Promise<SpendingInsight> {
    const formatBRL = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`

    const categoryList = data.categoryBreakdown
      .sort((a, b) => b.amount - a.amount)
      .map(c => `- ${c.category}: ${formatBRL(c.amount)}`)
      .join('\n')

    let comparison = ''
    if (data.previousMonth) {
      const diff = data.totalExpense - data.previousMonth.totalExpense
      const pct = data.previousMonth.totalExpense > 0
        ? ((diff / data.previousMonth.totalExpense) * 100).toFixed(1)
        : 'N/A'
      comparison = `\nMês anterior: ${formatBRL(data.previousMonth.totalExpense)} (variação: ${diff >= 0 ? '+' : ''}${pct}%)`

      if (data.previousMonth.categoryBreakdown.length > 0) {
        comparison += '\nCategorias do mês anterior:'
        for (const prev of data.previousMonth.categoryBreakdown) {
          comparison += `\n- ${prev.category}: ${formatBRL(prev.amount)}`
        }
      }
    }

    const prompt = `Você é um consultor financeiro pessoal. Analise os gastos do mês e forneça insights em português (pt-BR).

Dados do mês ${data.month}:
Total de despesas: ${formatBRL(data.totalExpense)}

Gastos por categoria:
${categoryList}
${comparison}

Responda APENAS com JSON, sem explicações:
{
  "summary": "Resumo geral em 2-3 frases sobre a saúde financeira do mês",
  "highlights": ["Destaque 1", "Destaque 2", "Destaque 3"],
  "recommendations": ["Sugestão prática 1", "Sugestão prática 2", "Sugestão prática 3"]
}

Regras:
- Seja direto e prático, sem enrolação
- Use valores em reais (R$)
- Compare com mês anterior se disponível
- Foque nos maiores ofensores de gasto`

    try {
      const response = await this.generate(prompt)
      const parsed = this.extractJSON<SpendingInsight>(response)

      if (parsed && parsed.summary && Array.isArray(parsed.highlights) && Array.isArray(parsed.recommendations)) {
        return parsed
      }

      return {
        summary: 'Não foi possível gerar insights detalhados para este mês.',
        highlights: [`Total gasto: ${formatBRL(data.totalExpense)}`],
        recommendations: ['Tente novamente em alguns instantes.']
      }
    } catch (err) {
      console.error('[OllamaService] insights error:', err)
      throw new Error('Falha ao gerar insights. Verifique se o Ollama está rodando.')
    }
  }

  private async generate(prompt: string): Promise<string> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 60000)

    try {
      const res = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
          format: 'json',
          options: { temperature: 0.3 }
        }),
        signal: controller.signal
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`Ollama responded ${res.status}: ${text}`)
      }

      const data = await res.json()
      return data.response || ''
    } finally {
      clearTimeout(timeout)
    }
  }

  private extractJSON<T>(text: string): T | null {
    try {
      return JSON.parse(text) as T
    } catch {
      const match = text.match(/[\[{][\s\S]*[\]}]/)
      if (match) {
        try {
          return JSON.parse(match[0]) as T
        } catch {
          return null
        }
      }
      return null
    }
  }
}
