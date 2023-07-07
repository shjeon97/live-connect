import { IDBPDatabase, openDB } from 'idb';

class IndexedDb {
  private database: string;
  private db: any;

  constructor(database: string) {
    this.database = database;
  }

  public async createObjectStore(tableNames: string[]) {
    try {
      this.db = await openDB(this.database, 1, {
        upgrade(db: IDBPDatabase) {
          for (const tableName of tableNames) {
            if (db.objectStoreNames.contains(tableName)) {
              continue;
            }
            db.createObjectStore(tableName);
          }
        },
      });
    } catch (error) {
      return false;
    }
  }

  public async getValue(tableName: string, id: number | string) {
    const tx = this.db.transaction(tableName, 'readonly');
    const store = tx.objectStore(tableName);
    const result = await store.get(id);
    return result;
  }

  public async getAllValue(tableName: string) {
    const tx = this.db.transaction(tableName, 'readonly');
    const store = tx.objectStore(tableName);
    const result = await store.getAll();
    return result;
  }

  public async putValue(
    tableName: string,
    value: object,
    key: string | number,
  ) {
    const tx = this.db.transaction(tableName, 'readwrite');
    const store = tx.objectStore(tableName);
    const result = await store.put(value, key);
    return result;
  }

  public async deleteValue(tableName: string, id: number | string) {
    const tx = this.db.transaction(tableName, 'readwrite');
    const store = tx.objectStore(tableName);
    const result = await store.get(id);
    if (!result) {
      return result;
    }
    await store.delete(id);
    return id;
  }

  public async deleteAllValue(tableName: string) {
    const tx = this.db.transaction(tableName, 'readwrite');
    const store = tx.objectStore(tableName);
    if (store) {
      await store.clear();
    }
    return;
  }
}

export default IndexedDb;
