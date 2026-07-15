// In-memory AsyncStorage mock — default import
const store = {};

const AsyncStorage = {
  getItem: jest.fn(async (key) => (key in store ? store[key] : null)),
  setItem: jest.fn(async (key, value) => {
    store[key] = value;
  }),
  removeItem: jest.fn(async (key) => {
    delete store[key];
  }),
  clear: jest.fn(async () => {
    for (const k in store) delete store[k];
  }),
  __store: store,
  __reset: () => {
    for (const k in store) delete store[k];
  },
};

module.exports = AsyncStorage;
module.exports.default = AsyncStorage;
