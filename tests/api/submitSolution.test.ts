import handler from '../../src/pages/api/submit-solution'
import { createMocks } from 'node-mocks-http';

describe('Submit Solution API', () => {

  test('should reject missing fields', async () => {

    const { req, res } = createMocks({
      method: 'POST',
      body: {}
    });

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(400);

  });

  test('should reject short code', async () => {

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        userId: "123",
        contestId: "100",
        problemId: "A",
        problemName: "Test",
        platform: "CF",
        language: "cpp",
        code: "a"
      }
    });

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(400);

  });

});