import crypto from 'crypto'

/**
 * Generates a deterministic idempotency key from transaction data.
 * Uses:
 * - Local date (YYYY-MM-DD, timezone safe)
 * - Normalized full description
 * - Amount with 2 decimals
 * Returns a 16-char stable hash.
 */
export function generateIdempotencyKey (
  date: Date | null,
  description: string,
  amount: number
): string | null {
  if (!date || !description) return null

  // 1️⃣ Safe local date (no UTC shift)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const dateStr = `${year}-${month}-${day}`

  // 2️⃣ Normalize description
  const normalizedDesc = description
    .normalize('NFD') // remove accents
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toUpperCase()

  // 3️⃣ Normalize amount
  const amountStr = Number(amount).toFixed(2)

  // 4️⃣ Deterministic base string
  const base = `${dateStr}|${normalizedDesc}|${amountStr}`

  // 5️⃣ Stable short hash (16 hex chars)
  const hash = crypto
    .createHash('sha256')
    .update(base)
    .digest('hex')
    .slice(0, 16)

  return hash
}
