import localforage from "localforage";

const useCache = (options: LocalForageOptions) => {
  localforage.config(options);

  const add = <T>(
    key: string,
    value: T,
    callback?: (err: any, value: T) => void
  ) => {
    return localforage.setItem(key, value, callback);
  };
  const get = <T>(
    key: string,
    callback?: (err: any, value: T | null) => void
  ) => {
    return localforage.getItem<T>(key, callback);
  };
  const remove = (key: string, callback?: (err: any) => void) => {
    return localforage.removeItem(key, callback);
  };
  const clear = (callback?: (err: any) => void) => {
    return localforage.clear(callback);
  };

  return {
    add,
    get,
    remove,
    clear
  };
};

export default useCache;
