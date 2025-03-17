const memoize = (fn, { key }) => {
  const cache = /* @__PURE__ */ new Map();
  return (...args) => {
    const k = key(...args);
    if (cache.has(k)) {
      return cache.get(k);
    }
    const result = fn(...args);
    cache.set(k, result);
    return result;
  };
};
export {
  memoize
};
