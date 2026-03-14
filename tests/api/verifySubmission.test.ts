import handler from '../../src/pages/api/verify-codeforces'
import { createMocks } from 'node-mocks-http';

describe('Verify Submission API', () => {

  test('should return 400 if fields missing', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {}
    });

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(400);
  });

  test('should reject non POST methods', async () => {
    const { req, res } = createMocks({
      method: 'GET'
    });

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(405);
  });

});