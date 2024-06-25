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
    return new Promise((resolve, reject) => {
        console.log("Clearing state from DB");
        const dbName = "UplinkAppState";
        const request = indexedDB.deleteDatabase(dbName);

        request.onerror = (event) => {
            console.error(`Error deleting database ${dbName}`, event);
            reject(event);
        }

        request.onblocked = () => {
            console.warn(`Database ${dbName} deletion blocked`);
        }

        resolve(dbName)
    });
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
