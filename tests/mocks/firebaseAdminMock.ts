const mockDb = {
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      set: jest.fn(),
      update: jest.fn(),
      get: jest.fn(() => ({ exists: true })),
    })),
    where: jest.fn(() => ({
      where: jest.fn(() => ({
        limit: jest.fn(() => ({
          get: jest.fn(() => ({ empty: true }))
        }))
      }))
    }))
  })),
  runTransaction: jest.fn(async (cb) => cb({
    get: jest.fn(() => ({ exists: true })),
    set: jest.fn(),
    update: jest.fn()
  }))
};

export const adminDb = mockDb;