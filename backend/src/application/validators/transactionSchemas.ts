import { z } from 'zod'

const originEnum = z.enum(['CREDIT_CARD', 'CASH']).nullable()

const amountSchema = z.preprocess(
  val => {
    if (typeof val === 'number') {
      return String(val)
    }
    if (typeof val === 'string') {
      return val.replace(',', '.').trim()
    }
    return val
  },
  z.string().refine(
    s => {
      return /^\d+(\.\d{1,2})?$/.test(s)
    },
    { message: 'amount must be a positive number with max 2 decimal places' }
  )
)

export const createTransactionSchema = z
  .object({
    userId: z.string().min(1),
    description: z.string().min(1),
    amount: amountSchema, // retorna string (ex: "85.50") -> converte pra Decimal128 no repo
    type: z.enum(['income', 'expense']),
    category: z.string().min(1, 'Categoria é obrigatória'),
    date: z
      .string()
      .datetime()
      .or(
        z.string().refine(s => !Number.isNaN(Date.parse(s)), {
          message: 'Invalid date'
        })
      ),
    origin: originEnum,
    card: z.string().min(1).optional().or(z.literal(undefined))
  })
  .superRefine((data, ctx) => {
    if (
      data.origin === 'CREDIT_CARD' &&
      (!data.card || data.card.trim().length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['card'],
        message: 'card é obrigatório quando origin = CREDIT_CARD'
      })
    }
  })

export const updateTransactionSchema = z
  .object({
    description: z.string().min(1).optional(),
    amount: amountSchema.optional(),
    type: z.enum(['income', 'expense']).optional(),
    category: z.string().min(1).optional(),
    date: z
      .string()
      .datetime()
      .or(
        z.string().refine(s => !Number.isNaN(Date.parse(s)), {
          message: 'Invalid date'
        })
      )
      .optional(),
    origin: originEnum.optional(),
    card: z.string().min(1).optional().or(z.literal(undefined))
  })
  .superRefine((data, ctx) => {
    if (
      data.origin === 'CREDIT_CARD' &&
      data.card &&
      data.card.trim().length === 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['card'],
        message: 'card deve ser fornecido quando origin = CREDIT_CARD'
      })
    }
  })
  .refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided'
  })
