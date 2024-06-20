import localforage from "localforage";

const useCache = (options: LocalForageOptions) => {
  const store = localforage.createInstance(options);

  const add = <T>(
    key: string,
    value: T,
    callback?: (err: any, value: T) => void
  ) => {
    return store.setItem(key, value, callback);
  };
  const get = <T>(
    key: string,
    callback?: (err: any, value: T | null) => void
  ) => {
    return store.getItem<T>(key, callback);
  };
  const remove = (key: string, callback?: (err: any) => void) => {
    return store.removeItem(key, callback);
  };
  const clear = (callback?: (err: any) => void) => {
    return store.dropInstance(
      {
        name: options.name
      },
      callback
    );
  };

  return {
    add,
    get,
    remove,
    clear
  };
};

export default useCache;
