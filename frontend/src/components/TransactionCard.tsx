"use client";

interface Transaction {
  _id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  origin: string;
  date: string | null;
}

interface TransactionCardProps {
  transaction: Transaction;
  onEdit?: (t: Transaction) => void;
  onDelete?: (id: string) => void;
}

export function TransactionCard({ transaction, onEdit, onDelete }: TransactionCardProps) {
  const isIncome = transaction.type === "income";
  const formattedAmount = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(transaction.amount);

  return (
    <div className="glass glass-hover p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-[var(--text-primary)] truncate mr-4">
          {transaction.description}
        </span>
        <span className={`text-sm font-bold tabular-nums whitespace-nowrap ${isIncome ? "text-emerald-400" : "text-pink-400"}`}>
          {isIncome ? "+" : "-"}{formattedAmount}
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs">
        {transaction.date && (
          <span className="text-[var(--text-muted)] tabular-nums">
            {new Date(transaction.date).toLocaleDateString("pt-BR")}
          </span>
        )}
        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/[0.08] text-[var(--text-secondary)]">
          {transaction.category}
        </span>
        <span className="text-[var(--text-muted)]">
          {transaction.origin === "CREDIT_CARD" ? "Cartão" : "Dinheiro"}
        </span>
      </div>
    </div>
  );
}
