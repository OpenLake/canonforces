export interface Problem {
  id: string;
  title: string;
  description: string;
  input_format: string;
  output_format: string;
  test_case: string;
  answer: string;
  solved: boolean;
}

// 2. Define the type for the whole collection
export type ProblemsMap = {
  [key: string]: Problem[];
};

// 3. The actual data
export const problem: ProblemsMap = {
  '800': [
    {
  "id": "p1200-2",
  "title": "A. Line Trip",
  "description": "You are located at point 0 on a number line and want to travel to point x and return to 0. Your car consumes 1 liter of fuel per unit of distance. There are n gas stations at specific points, and you can only refuel at these gas stations. Compute the minimum tank capacity required to make the round trip.",
  "input_format": "The first line contains a single integer t — the number of test cases (1 ≤ t ≤ 1000).\nEach test case consists of two lines:\nFirst line: two integers n and x (1 ≤ n ≤ 50; 2 ≤ x ≤ 100)\nSecond line: n space-separated integers a1, a2, ..., an such that 0 < a1 < a2 < ... < an < x",
  "output_format": "For each test case, print one integer — the minimum possible fuel tank capacity (in liters) needed to complete the trip.",
  "test_case": "3\n3 7\n1 2 5\n3 6\n1 2 5\n1 10\n7",
  "answer": "4\n3\n7",
  "solved": false
},
{
  "id": "p800-3",
  "title": "A. Cover in Water",
  "description": "Filip has a row of cells, some of which are blocked ('#') and some are empty ('.'). He wants all empty cells to be filled with water. He has two actions:\n1 — Place water in an empty cell.\n2 — Move water from a cell to another empty cell.\nIf at any time, an empty cell i (2 ≤ i ≤ n−1) has water in both its neighboring cells (i−1 and i+1), it automatically becomes filled. Find the minimum number of action 1 operations needed to fill all empty cells with water. Blocked cells cannot contain water or be targeted.",
  "input_format": "The first line contains an integer t (1 ≤ t ≤ 100) — the number of test cases.\nEach test case has:\n- One integer n (1 ≤ n ≤ 100) — number of cells.\n- One string s of length n, consisting of '.' and '#' characters.",
  "output_format": "For each test case, print one integer — the minimum number of action 1 operations needed to fill all empty cells with water.",
  "test_case": "5\n3\n...\n7\n##....#\n7\n..#.#..\n4\n####\n10\n#...#..#.#",
  "answer": "2\n2\n5\n0\n2",
  "solved": false
}


  ],
  '1000': [
   {
  "id": "p1400-2",
  "title": "B. Swap and Delete",
  "description": "You are given a binary string s. You can delete any character at a cost of 1 coin, or swap any two characters for free. You can perform these operations any number of times and in any order. After the operations, you obtain a string t. The string t is good if for every index i, ti ≠ si (i.e., no character in t is the same as the character at the same position in s). The empty string is always good. Find the minimum cost to transform s into a good string t.",
  "input_format": "The first line contains an integer t — the number of test cases (1 ≤ t ≤ 10^4).\nEach test case consists of a single line containing a binary string s (1 ≤ |s| ≤ 2⋅10^5).\nThe total length of all strings does not exceed 2⋅10^5.",
  "output_format": "For each test case, print one integer — the minimum cost in coins to make string t good.",
  "test_case": "4\n0\n011\n0101110001\n111100",
  "answer": "1\n1\n0\n4",
  "solved": false
}

  ],
  '1200': [
    {
  "id": "p1600-2",
  "title": "Two Distinct Remainders",
  "description": "You are given an array a1, a2, ..., an of distinct positive integers. You must choose a positive integer k (1 ≤ k ≤ 10^18) and replace each ai with ai mod k. Your goal is to find a k such that after this operation, the resulting array contains **exactly two distinct values**. It is guaranteed that at least one such k exists.",
  "input_format": "The first line contains an integer t — the number of test cases (1 ≤ t ≤ 500).\nEach test case consists of two lines:\n- First line: a single integer n (2 ≤ n ≤ 100) — the size of the array.\n- Second line: n space-separated distinct positive integers a1, a2, ..., an (1 ≤ ai ≤ 10^17).",
  "output_format": "For each test case, print a single integer — a value of k (1 ≤ k ≤ 10^18) such that the resulting array has exactly 2 distinct values after applying ai mod k to each element.",
  "test_case": "5\n4\n8 15 22 30\n5\n60 90 98 120 308\n6\n328 769 541 986 215 734\n5\n1000 2000 7000 11000 16000\n2\n2 1",
  "answer": "7\n30\n3\n5000\n1000000000000000000",
  "solved": false
}

  ],
  '1400': [
    {
      'id': "p1400-1",
      'title': "Prefix Sum Query",
      'description': "Given an array, answer queries for the sum of elements in a range.",
      'input_format': "First line: n q\nSecond line: n space-separated integers\nNext q lines: l r",
      'output_format': "For each query, output the sum from index l to r (1-based)",
      'test_case': "5 2\n1 2 3 4 5\n1 3\n2 5",
      'answer': "6\n14",
      'solved': false
    }
  ],
  '1600': [
    {
      'id': "p1600-1",
      'title': "Minimum Swaps to Sort",
      'description': "Given a permutation of numbers from 1 to n, find the minimum number of swaps to sort the array.",
      'input_format': "An integer n followed by n space-separated integers",
      'output_format': "A single integer - the minimum number of swaps",
      'test_case': "5\n2 3 4 1 5",
      'answer': "3",
      'solved': false
    }
  ]
};
