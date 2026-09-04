import { STORE_NAMES, DEFAULT_SETTINGS } from "../config.js";
import { transact } from "./database.js";
export const entriesRepository = {
  async all() { return transact(STORE_NAMES.entries, "readonly", (store) => store.getAll()); },
  async put(entry) { return transact(STORE_NAMES.entries, "readwrite", (store) => store.put(entry)); },
  async delete(id) { return transact(STORE_NAMES.entries, "readwrite", (store) => store.delete(id)); },
  async clear() { return transact(STORE_NAMES.entries, "readwrite", (store) => store.clear()); },
  async replace(entries) { await this.clear(); for (const entry of entries) await this.put(entry); }
};
export const settingsRepository = {
  async get() { return (await transact(STORE_NAMES.settings, "readonly", (store) => store.get("app"))) || { ...DEFAULT_SETTINGS }; },
  async put(settings) { return transact(STORE_NAMES.settings, "readwrite", (store) => store.put({ ...settings, id: "app" })); }
};
