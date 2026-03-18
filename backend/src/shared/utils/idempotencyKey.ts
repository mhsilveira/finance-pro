import crypto from 'crypto'

export function generateIdempotencyKey (
  date: Date | null,
  description: string,
  amount: number
): string | null {
  if (!date || !description) return null

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const dateStr = `${year}-${month}-${day}`

  const normalizedDesc = description
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toUpperCase()

  const amountStr = Number(amount).toFixed(2)

  const base = `${dateStr}|${normalizedDesc}|${amountStr}`

  const hash = crypto
    .createHash('sha256')
    .update(base)
    .digest('hex')
    .slice(0, 16)

  return hash
}
