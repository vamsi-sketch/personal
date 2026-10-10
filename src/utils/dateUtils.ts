export function getDaysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function formatYearMonth(year: number, monthIndex: number): string {
  const m = String(monthIndex + 1).padStart(2, '0');
  return `${year}-${m}`;
}

export function parseYearMonth(ym: string): { year: number; monthIndex: number } {
  const [yearStr, monthStr] = ym.split('-');
  const year = parseInt(yearStr, 10);
  const monthIndex = parseInt(monthStr, 10) - 1;
  return { year, monthIndex };
}

export function formatDateStr(year: number, monthIndex: number, day: number): string {
  const m = String(monthIndex + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

export function getTodayString(): string {
  const now = new Date();
  return formatDateStr(now.getFullYear(), now.getMonth(), now.getDate());
}

export function getMonthLabel(year: number, monthIndex: number): string {
  const date = new Date(year, monthIndex, 1);
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
}

export function getPrevMonth(year: number, monthIndex: number): { year: number; monthIndex: number } {
  if (monthIndex === 0) {
    return { year: year - 1, monthIndex: 11 };
  }
  return { year, monthIndex: monthIndex - 1 };
}

export function getNextMonth(year: number, monthIndex: number): { year: number; monthIndex: number } {
  if (monthIndex === 11) {
    return { year: year + 1, monthIndex: 0 };
  }
  return { year, monthIndex: monthIndex + 1 };
}

export function getDayOfWeekAbbr(year: number, monthIndex: number, day: number): string {
  const date = new Date(year, monthIndex, day);
  return date.toLocaleDateString('en-US', { weekday: 'narrow' });
}
