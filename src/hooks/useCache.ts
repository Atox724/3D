import {
  clear as dbClear,
  createStore,
  del as dbDel,
  get as dbGet,
  set as dbSet} from "idb-keyval";

interface Options {
  dbName: string;
  storeName: string;
  version?: IDBValidKey;
}

const useCache = (options: Options) => {
  const store = createStore(options.dbName, options.storeName);

  const versionKey = "cache_version";

  let isChecked = false;

  const checkVersion = async () => {
    if (isChecked) return;
    isChecked = true;
    try {
      const currentVersion = await dbGet<IDBValidKey>(versionKey, store);
      if (currentVersion !== options.version) {
        await dbClear(store);
        await dbSet(versionKey, options.version, store);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const get = async <T>(key: IDBValidKey) => {
    await checkVersion();
    return dbGet<T>(key, store);
  };

  const set = async (key: IDBValidKey, value: any) => {
    await checkVersion();
    return dbSet(key, value, store);
  };

  const del = (key: IDBValidKey) => dbDel(key, store);

  const clear = () => dbClear(store);

  return {
    get,
    set,
    del,
    clear
  };
};

export default useCache;
