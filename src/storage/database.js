import { DATABASE_NAME, DATABASE_VERSION, STORE_NAMES } from "../config.js";
let databasePromise;
export function openDatabase() {
  if (databasePromise) return databasePromise;
  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => Object.values(STORE_NAMES).forEach((name) => {
      if (!request.result.objectStoreNames.contains(name)) request.result.createObjectStore(name, { keyPath: "id" });
    });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error("Den lokale database kunne ikke åbnes."));
  });
  return databasePromise;
}
export async function transact(storeName, mode, operation) {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, mode);
    let result;
    transaction.oncomplete = () => resolve(result instanceof IDBRequest ? result.result : result);
    transaction.onerror = () => reject(new Error("Dataændringen kunne ikke gemmes."));
    result = operation(transaction.objectStore(storeName));
  });
}
