jest.mock('../../src/lib/firebase', () => ({
  auth: {},
  db: {},
  provider: {}
}));

import { getSolvedCount } from "../../src/services/firebase";
import mockData from "../fixtures/cfUserStatus.json";

global.fetch = jest.fn(() =>
  Promise.resolve({
    status: 200,
    json: () => Promise.resolve(mockData)
  })
) as jest.Mock;

describe("Codeforces Service", () => {

  test("should calculate solved problems", async () => {

    const result = await getSolvedCount("tourist");

    expect(result.solved).toBe(1);
    expect(result.attempt).toBe(2);

  });

});