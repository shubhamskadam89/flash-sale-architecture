export function formatCurrency(amount: any): string {
  const parsed = typeof amount === 'number' ? amount : parseFloat(amount);
  if (isNaN(parsed) || amount === null || amount === undefined) {
    return '₹—';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(parsed);
}

export function formatDate(iso: any): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return '—';
  }
}

export function formatLocalDateTimeForApi(date: any): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    date = new Date();
  }
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

export function truncateUuid(uuid: any): string {
  if (typeof uuid !== 'string' || !uuid) return '—';
  return uuid.substring(0, 8) + '...';
}

export function discountPercent(original: any, sale: any): number {
  const origNum = typeof original === 'number' ? original : parseFloat(original);
  const saleNum = typeof sale === 'number' ? sale : parseFloat(sale);
  if (isNaN(origNum) || isNaN(saleNum) || origNum <= 0) return 0;
  return Math.round(((origNum - saleNum) / origNum) * 100);
}
