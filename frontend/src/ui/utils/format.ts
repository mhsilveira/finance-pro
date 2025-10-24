export function formatCurrencyBR(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value ?? 0);
}

export function formatDateBR(iso: string) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '-';
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(d);
  } catch {
    return '-';
  }
}

// YYYY-MM -> Mês/Ano pt-BR
export function formatMonthYearBR(ym: string) {
  if (!/^\d{4}-\d{2}$/.test(ym)) return ym;
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1, 1);
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(d);
}