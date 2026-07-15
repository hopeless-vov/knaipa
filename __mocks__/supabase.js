module.exports = {
  createClient: jest.fn(() => ({
    auth: {
      signInWithPassword: jest.fn(async () => ({ data: { user: null, session: null }, error: null })),
      signUp: jest.fn(async () => ({ data: { user: null, session: null }, error: null })),
      signOut: jest.fn(async () => ({ error: null })),
      resetPasswordForEmail: jest.fn(async () => ({ data: {}, error: null })),
      getSession: jest.fn(async () => ({ data: { session: null }, error: null })),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn(() => ({ data: [], error: null })),
    })),
  })),
};
