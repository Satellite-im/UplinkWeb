import { log } from "$lib/utils/Logger"

const storeName = "stateStore"
const dbName = "UplinkAppState"

export async function initDB(): Promise<IDBDatabase> {
    // During e.g. a page refresh initDB() is called too fast and the constants are uninitialized. This is a workaround for that
    while (true) {
        try {
            let _ = dbName
            break
        } catch (e) {
            await new Promise(f => setTimeout(f, 5))
        }
    }
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1)

        request.onupgradeneeded = event => {
            const db = request.result
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName, { keyPath: "key" })
            }
        }

        request.onsuccess = () => {
            resolve(request.result)
            const db = request.result
            db.onversionchange = () => {
                db.close()
            }
        }

        request.onerror = event => {
            log.error(`Error opening database ${dbName}. Event: ${event}`)
            reject(event)
        }
    })
}

export async function clearState(): Promise<string> {
    return new Promise((resolve, reject) => {
        log.debug("Clearing state from DB")
        localStorage.clear()
        sessionStorage.clear()
        self.close()
        const request = indexedDB.deleteDatabase(dbName)
        request.onerror = event => {
            log.error(`Error deleting database ${dbName}. Event: ${event}`)
            reject(event)
        }

        request.onblocked = () => {
            log.warn(`Database ${dbName} deletion blocked`)
        }

        request.onsuccess = () => {
            resolve(dbName)
        }
    })
}

export async function getStateFromDB<T>(key: string, defaultState: T): Promise<T> {
    try {
        const db = await initDB()
        return new Promise<T>((resolve, reject) => {
            const transaction = db.transaction([storeName], "readonly")
            const objectStore = transaction.objectStore(storeName)
            const request = objectStore.get(key)

            request.onsuccess = () => {
                resolve(request.result?.value ?? defaultState)
            }

            request.onerror = event => {
                log.error(`Error getting state from DB. Event: ${event}`)
                reject(defaultState)
            }
        })
    } catch (error) {
        log.error(`Error initializing DB for getting state ${key}. Error: ${error}`)
        return defaultState
    }
}

export async function setStateToDB<T>(key: string, state: T): Promise<void> {
    try {
        const db = await initDB()
        return new Promise<void>((resolve, reject) => {
            const transaction = db.transaction([storeName], "readwrite")
            const objectStore = transaction.objectStore(storeName)
            const request = objectStore.put({ key, value: state })

            request.onsuccess = () => {
                resolve()
            }

            request.onerror = event => {
                log.error(`Error setting state to DB. Event: ${event}`)
                reject("Error writing to DB")
            }
        })
    } catch (error) {
        log.error(`Error initializing DB for setting state ${key}. Error: ${error}`)
        throw new Error("Error writing to DB")
    }
}
