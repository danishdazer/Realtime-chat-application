function getCachedValue(cache) {
  // Access the cached value from the cache using the 'myKey' key
  // If the value is not found, return the default value 'Default value if not cached'
  return cache.get('myKey') || 'Default value if not cached';
}

module.exports = {
  getCachedValue
};