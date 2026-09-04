export function createBackup(entries, settings) {
  return { formatVersion: 1, exportedAt: new Date().toISOString(), entries, settings };
}
export function parseBackup(text) {
  let data;
  try { data = JSON.parse(text); } catch { throw new Error("Filen er ikke gyldig JSON."); }
  const validEntry = (item) => item && typeof item.id === "string" && /^\d{4}-\d{2}-\d{2}$/.test(item.date) && Number.isFinite(item.balance);
  const validSettings = data?.settings && /^\d{4}-\d{2}-\d{2}$/.test(data.settings.birthDate) && Number.isFinite(data.settings.retirementAge) && Number.isFinite(data.settings.growthRate);
  if (data?.formatVersion !== 1 || !Array.isArray(data.entries) || !data.entries.every(validEntry) || !validSettings) throw new Error("Filen er ikke en gyldig Pensionsblik-sikkerhedskopi.");
  return data;
}
export function mergeEntries(current, imported) {
  const byDate = new Map(current.map((entry) => [entry.date, entry]));
  imported.forEach((entry) => byDate.set(entry.date, entry));
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}
export function downloadBackup(data) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = `pensionsblik-${new Date().toISOString().slice(0, 10)}.json`; anchor.click(); URL.revokeObjectURL(url);
}
