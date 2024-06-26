import { log } from "$lib/utils/Logger"

const storeName = "stateStore"

export async function initDB() {
    return new Promise<IDBDatabase>((resolve, _) => {
        const request = indexedDB.open("UplinkAppState", 1)
        request.onupgradeneeded = _ => {
            const db = request.result
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName, { keyPath: "key" })
            }
        }
        request.onsuccess = _ => resolve(request.result)
    })
}

export async function clearState() {
    return new Promise(async (resolve, reject) => {
        log.debug("Clearing state from DB")
        const dbName = "UplinkAppState"
        localStorage.clear()
        sessionStorage.clear()
        if ('caches' in window) {
            const cacheNames = await caches.keys()
            await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)))
        }
        const request = indexedDB.deleteDatabase(dbName)

        request.onerror = (event) => {
            log.error(`Error deleting database ${dbName}. Event: ${event}`)
            reject(event)
        }

        request.onblocked = () => {
            log.warn(`Database ${dbName} deletion blocked`)
        }

        resolve(dbName)
    })
}

export async function getStateFromDB<T>(key: string, defaultState: T): Promise<T> {
    const db = await initDB()
    return new Promise<T>(resolve => {
        const transaction = db.transaction([storeName], "readonly")
        const objectStore = transaction.objectStore(storeName)
        const request = objectStore.get(key)
        request.onsuccess = () => resolve(request.result?.value ?? defaultState)
    })
}

export async function setStateToDB<T>(key: string, state: T): Promise<void> {
    const db = await initDB()
    return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([storeName], "readwrite")
        const objectStore = transaction.objectStore(storeName)
        const request = objectStore.put({ key, value: state })
        request.onsuccess = () => resolve()
        request.onerror = () => reject("Error writing to DB")
    })
}
