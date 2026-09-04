const MS_DAY = 86_400_000;
const DAYS_YEAR = 365.2425;
export const parseDate = (value) => new Date(`${value}T12:00:00`);
export const yearsBetween = (from, to) => (to.getTime() - from.getTime()) / MS_DAY / DAYS_YEAR;
export const futureValue = (balance, rate, years) => years <= 0 ? balance : balance * ((1 + rate / 100) ** years);
export function retirementDate(birthDate, age) { const date = parseDate(birthDate); date.setFullYear(date.getFullYear() + age); return date; }
export const sortEntries = (entries) => [...entries].sort((a, b) => a.date.localeCompare(b.date));
export function entriesForPeriod(entries, period, now = new Date()) {
  const sorted = sortEntries(entries);
  if (period === "all") return sorted;
  const start = new Date(now);
  if (period === "ytd") start.setMonth(0, 1);
  else start.setFullYear(start.getFullYear() - Number(period[0]));
  const key = start.toISOString().slice(0, 10);
  return sorted.filter((entry) => entry.date >= key && parseDate(entry.date) <= now);
}
export function summary(entries) {
  const sorted = sortEntries(entries), first = sorted[0], last = sorted.at(-1);
  if (!first || !last) return { count: 0, contributions: 0 };
  const amount = last.balance - first.balance;
  return { count: sorted.length, first, last, amount, percent: first.balance ? amount / first.balance * 100 : null, contributions: sorted.reduce((sum, item) => sum + (item.contribution || 0), 0) };
}
