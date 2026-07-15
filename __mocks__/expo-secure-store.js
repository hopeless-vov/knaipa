// In-memory SecureStore mock — namespace import (`import * as SecureStore`)
const store = {};

module.exports = {
  getItemAsync: jest.fn(async (key) => (key in store ? store[key] : null)),
  setItemAsync: jest.fn(async (key, value) => {
    store[key] = value;
  }),
  deleteItemAsync: jest.fn(async (key) => {
    delete store[key];
  }),
  __store: store,
  __reset: () => {
    for (const k in store) delete store[k];
  },
};
