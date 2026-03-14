jest.mock('axios', () => ({
  create: () => ({
    post: jest.fn().mockResolvedValue({
      data: {
        stdout: "1\n",
        stderr: "",
        compile_output: "",
        status: { description: "Accepted" }
      }
    })
  })
}));

import { executeCode } from '../../src/pages/api/hello';

describe('Code Execution Service', () => {

  test('should return output object', async () => {

    const result = await executeCode("python", "print(1)", "");

    expect(result).toHaveProperty("run");

  });

});