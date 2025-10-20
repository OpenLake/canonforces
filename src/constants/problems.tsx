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

//Example of Questions stored in db
export type ProblemsMap = {
  [key: string]: Problem[];
};

// 3. The actual data
export const problem: ProblemsMap = {
  '800': [
    {
      "id": "p800-1",
      "title": "A. Halloumi Boxes",
      "description": "Theofanis is busy after his last contest, as now, he has to deliver many halloumis all over the world. He stored them inside n boxes and each of which has some number aᵢ written on it. He wants to sort them in non-decreasing order based on their number, however, his machine works in a strange way. It can only reverse any subarray of boxes with length at most k. Find if it's possible to sort the boxes using any number of reverses.",
      "input_format": "The first line contains a single integer t (1 ≤ t ≤ 100) — the number of test cases.\nEach test case consists of two lines:\nFirst line: two integers n and k (1 ≤ k ≤ n ≤ 100)\nSecond line: n integers a₁, a₂, ..., aₙ (1 ≤ aᵢ ≤ 10⁹)",
      "output_format": "For each test case, print YES (case-insensitive), if the array can be sorted in non-decreasing order, or NO (case-insensitive) otherwise.",
      "test_case": "5\n3 2\n1 2 3\n3 1\n9 9 9\n4 4\n6 4 2 1\n4 3\n10 3 830 14\n2 1\n3 1",
      "answer": "YES\nYES\nYES\nYES\nNO",
      "solved": false
    },
    {
      "id": "p800-2",
      "title": "Be Positive",
      "description": "Given an array a of n elements where each element is equal to -1, 0 or 1. In one operation, you can choose an index i and increase a_i by 1. Operations can be performed any number of times, choosingany indices. The goal is to make the product of all elements in the array strictly positive with the minimum number of operations. Find the minimum number of operations",
      "input_format": "The first line contains a single integer t (1 ≤ t ≤ 10000) — the number of test cases.\nEach test case consists of two lines:\nFirst line: two integers n (1 ≤ n ≤ 8) \nSecond line: n integers a₁, a₂, ..., aₙ (-1 ≤ aᵢ ≤ 1)",
      "output_format": "For each test case, output one integer - the minimum number of operations required to make the product of the elements in the array strictly positive",
      "test_case": "3\n3\n-1 0 1\n4\n-1 -1 0 1\n5\n-1 -1 -1 0 0",
      "answer": "3\n1\n4",
      "solved": false
    },
    {
      "id": "p800-3",
      "title": "Degree of Polynomial",
      "description": "In mathematics, the degree of polynomials in one variable is the highest power of the variable in the algebraic expression with non-zero coefficient. Chef has a variable a polynomial in one variable x with N terms. Find the degree of the polynomial",
      "input_format": "The first line contains a single integer t — the number of test cases (1 ≤ t ≤ 100).\nEach test case consists of two lines:\nFirst line: Single integer n (1 ≤ n ≤ 1000)\nSecond line: n space-separated integers - the ith integer A_i-1 corresponds to the coefficient of x^(i-1)",
      "output_format": "For each test case, output in a single line, the degree of the polynomial",
      "test_case": "4\n1\n5\n2\n-3 3\n3\n0 0 5\n4\n1 2 4 0",
      "answer": "0\n1\n2\n2",
      "solved": false
    },
    {
      "id": "p800-4",
      "title": "Good Kid",
      "description": "Slavic is preparing a present for a friend's birthday. He has an array a of n digits and the present will be the product of all these digits. Because Slavic is a good kid who wants to make the biggest product possible, he wants to add 1 to exactly one of his digits. What is the maximum product Slavic can make?",
      "input_format": "The first line contains a single integer t — the number of test cases (1 ≤ t ≤ 10000).\nEach test case consists of two lines:\nFirst line: Single integer n (1 ≤ n ≤ 9)\nSecond line: n space-separated integers - the digits in the array",
      "output_format": "For each test case, output a single integer - the maximum possible product Slavic can make, by adding 1 to exactly one of his digits",
      "test_case": "4\n4\n2 2 1 2\n3\n0 1 2\n5\n4 3 2 3 4\n9\n9 9 9 9 9 9 9 9 9",
      "answer": "16\n2\n432\n43067210",
      "solved": false
    }, 
    {
      "id": "p800-5",
      "title": "All lengths Subtraction",
      "description": "You are given a permutation p of length n. You must perform exactly one operation for each integer k from 1 up to n in that order:\nChoose a subarray of p of length exactly k and subtract 1 from every element in that subarray. After completing all n operations, your goal is to have all elements of the array equal to zero. Determine whether it is possible to achieve this",
      "input_format": "The first line contains a single integer t — the number of test cases (1 ≤ t ≤ 100).\nEach test case consists of two lines:\nFirst line: Single integer n (1 ≤ n ≤ 100)\nSecond line: n space-separated integers - the permutation itself",
      "output_format": "For each test case, print YES (case-insensitive), if it is possible to make all elements of the array p equal to 0, or NO (case-insensitive) otherwise",
      "test_case": "4\n4\n1 3 4 2\n5\n1 5 2 4 3\n5\n2 4 5 3 1\n3\n3 1 2",
      "answer": "YES\nNO\nYES\nNO",
      "solved": false
    },
    {
      "id": "p800-6",
      "title": "Sum of Digits",
      "description": "Given a two-digit number, you need to find the sum of its digits. For example, if the number is 23, the sum of digits is 2 + 3 = 5.",
      "input_format": "The first line contains a single integer t (1 ≤ t ≤ 100) — the number of test cases.\nEach of the next t lines contains a single two-digit integer n (10 ≤ n ≤ 99).",
      "output_format": "For each test case, output a single integer — the sum of the digits of n.",
      "test_case": "4\n23\n45\n10\n99",
      "answer": "5\n9\n1\n18",
      "solved": false
    },
    {
      "id": "p800-7",
      "title": "Even or Odd Count",
      "description": "You are given an array of n integers. Your task is to count how many of these integers are even and how many are odd.",
      "input_format": "The first line contains a single integer t (1 ≤ t ≤ 100) — the number of test cases.\nEach test case consists of two lines:\nFirst line: a single integer n (1 ≤ n ≤ 100)\nSecond line: n space-separated integers aᵢ (1 ≤ aᵢ ≤ 1000)",
      "output_format": "For each test case, output two integers: the count of even numbers and the count of odd numbers, separated by a space.",
      "test_case": "3\n5\n1 2 3 4 5\n4\n2 4 6 8\n3\n1 3 5",
      "answer": "2 3\n4 0\n0 3",
      "solved": false
    },
    {
      "id": "p800-8",
      "title": "Maximum Element",
      "description": "Given an array of integers, find the maximum element in the array.",
      "input_format": "The first line contains a single integer t (1 ≤ t ≤ 100) — the number of test cases.\nEach test case consists of two lines:\nFirst line: a single integer n (1 ≤ n ≤ 100)\nSecond line: n space-separated integers aᵢ (-1000 ≤ aᵢ ≤ 1000)",
      "output_format": "For each test case, output a single integer — the maximum element in the array.",
      "test_case": "3\n5\n3 7 2 9 1\n4\n-5 -2 -8 -1\n3\n10 10 10",
      "answer": "9\n-1\n10",
      "solved": false
    },
    {
      "id": "p800-9",
      "title": "Character Count",
      "description": "You are given a string s consisting of lowercase English letters. Find the number of times the character 'a' appears in the string.",
      "input_format": "The first line contains a single integer t (1 ≤ t ≤ 100) — the number of test cases.\nEach test case consists of a single line containing a string s (1 ≤ |s| ≤ 100) consisting of lowercase English letters.",
      "output_format": "For each test case, output a single integer — the number of times 'a' appears in the string.",
      "test_case": "4\nabcabc\nhello\naaaaaa\nxyz",
      "answer": "2\n0\n6\n0",
      "solved": false
    }
  ],
    '1000': [
    {
      "id": "p1000-1",
      "title": "Array Equality",
      "description": "You are given two arrays a and b, each of length n. In one operation, you can choose an index i and increase aᵢ by 1. Determine if it's possible to make both arrays equal by performing any number of operations (possibly zero).",
      "input_format": "The first line contains a single integer t (1 ≤ t ≤ 100) — the number of test cases.\nEach test case consists of three lines:\nFirst line: a single integer n (1 ≤ n ≤ 100)\nSecond line: n space-separated integers a₁, a₂, ..., aₙ (1 ≤ aᵢ ≤ 100)\nThird line: n space-separated integers b₁, b₂, ..., bₙ (1 ≤ bᵢ ≤ 100)",
      "output_format": "For each test case, print YES if it's possible to make both arrays equal, or NO otherwise.",
      "test_case": "3\n3\n1 2 3\n2 3 4\n3\n1 2 3\n3 2 1\n2\n5 5\n3 3",
      "answer": "YES\nNO\nNO",
      "solved": false
    },
    {
      "id": "p1000-2",
      "title": "Divisibility Check",
      "description": "You are given two integers x and y. Find the smallest positive integer k such that x·k is divisible by y.",
      "input_format": "The first line contains a single integer t (1 ≤ t ≤ 1000) — the number of test cases.\nEach test case consists of a single line containing two integers x and y (1 ≤ x, y ≤ 10⁹).",
      "output_format": "For each test case, output a single integer — the smallest positive integer k such that x·k is divisible by y.",
      "test_case": "4\n3 6\n10 5\n7 3\n1 1",
      "answer": "2\n1\n3\n1",
      "solved": false
    },
    {
      "id": "p1000-3",
      "title": "String Palindrome",
      "description": "You are given a string s consisting of lowercase English letters. Determine if the string is a palindrome. A palindrome is a string that reads the same forwards and backwards.",
      "input_format": "The first line contains a single integer t (1 ≤ t ≤ 100) — the number of test cases.\nEach test case consists of a single line containing a string s (1 ≤ |s| ≤ 100) consisting of lowercase English letters.",
      "output_format": "For each test case, print YES if the string is a palindrome, or NO otherwise.",
      "test_case": "4\naba\nracecar\nhello\na",
      "answer": "YES\nYES\nNO\nYES",
      "solved": false
    },
    {
      "id": "p1000-4",
      "title": "Binary Representation",
      "description": "Given a positive integer n, count the number of 1s in its binary representation.",
      "input_format": "The first line contains a single integer t (1 ≤ t ≤ 1000) — the number of test cases.\nEach test case consists of a single line containing a positive integer n (1 ≤ n ≤ 10⁹).",
      "output_format": "For each test case, output a single integer — the number of 1s in the binary representation of n.",
      "test_case": "4\n7\n8\n15\n1",
      "answer": "3\n1\n4\n1",
      "solved": false
    }
  ],
  '1200': [
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
      "id": "p1200-3",
      "title": "Trace of a matrix",
      "description": "Chef is learning linear algebra. Recently, he learnt that for a square matrix M, trace(M) is defined as the sum of all elements on the main diagonal of M(an element lies on a main diagonal if its row index and column index are same). Now, Chef wants to solve some exercises related to this new quantity, so he wrote down a square matrix A with size N * N. A square submatrix of A with size l * l is a contiguos block of l * l elements of A",
      "input_format": "The first line contains a single integer t — the number of test cases (1 ≤ t ≤ 100).\nFirst line: single integer n (2 ≤ n ≤ 100)\nN lines follow. For each i, the ith of these line contains N space-seperated integers denoting the ith row of the matrix A",
      "output_format": "For each test case, print one integer — the minimum possible fuel tank capacity (in liters) needed to complete the trip.",
      "test_case": "1\n3\n1 2 5\n6 3 4\n2 7 1",
      "answer": "13",
      "solved": false
    },
      {
      "id": "p1200-4",
      "title": "Subarray Sum",
      "description": "You are given an array of n positive integers. Your task is to find if there exists a contiguous subarray with sum equal to a given integer k.",
      "input_format": "The first line contains a single integer t (1 ≤ t ≤ 100) — the number of test cases.\nEach test case consists of two lines:\nFirst line: two integers n and k (1 ≤ n ≤ 100, 1 ≤ k ≤ 10⁵)\nSecond line: n space-separated integers aᵢ (1 ≤ aᵢ ≤ 1000)",
      "output_format": "For each test case, print YES if there exists a subarray with sum equal to k, or NO otherwise.",
      "test_case": "3\n5 7\n1 2 3 4 5\n4 10\n2 3 4 1\n3 15\n5 5 5",
      "answer": "YES\nYES\nYES",
      "solved": false
    },
    {
      "id": "p1200-5",
      "title": "GCD Operations",
      "description": "You are given two positive integers a and b. In one operation, you can replace a with gcd(a, b) or replace b with gcd(a, b), where gcd(x, y) denotes the greatest common divisor of x and y. Find the minimum number of operations needed to make both numbers equal.",
      "input_format": "The first line contains a single integer t (1 ≤ t ≤ 1000) — the number of test cases.\nEach test case consists of a single line containing two integers a and b (1 ≤ a, b ≤ 10⁹).",
      "output_format": "For each test case, output a single integer — the minimum number of operations needed to make both numbers equal.",
      "test_case": "4\n12 18\n10 10\n7 3\n100 50",
      "answer": "2\n0\n3\n2",
      "solved": false
    },
    {
      "id": "p1200-6",
      "title": "Longest Consecutive Sequence",
      "description": "You are given an array of integers. Find the length of the longest consecutive sequence of identical elements in the array.",
      "input_format": "The first line contains a single integer t (1 ≤ t ≤ 100) — the number of test cases.\nEach test case consists of two lines:\nFirst line: a single integer n (1 ≤ n ≤ 100)\nSecond line: n space-separated integers aᵢ (1 ≤ aᵢ ≤ 100)",
      "output_format": "For each test case, output a single integer — the length of the longest consecutive sequence.",
      "test_case": "3\n7\n1 1 2 2 2 3 3\n5\n5 5 5 5 5\n6\n1 2 3 4 5 6",
      "answer": "3\n5\n1",
      "solved": false
    },
    {
      "id": "p1200-7",
      "title": "Prime Factorization Count",
      "description": "Given a positive integer n, find the total number of prime factors of n (counting multiplicities). For example, 12 = 2² × 3, so the answer is 3 (two 2's and one 3).",
      "input_format": "The first line contains a single integer t (1 ≤ t ≤ 1000) — the number of test cases.\nEach test case consists of a single line containing a positive integer n (2 ≤ n ≤ 10⁶).",
      "output_format": "For each test case, output a single integer — the total number of prime factors of n counting multiplicities.",
      "test_case": "5\n12\n7\n16\n100\n2",
      "answer": "3\n1\n4\n4\n1",
      "solved": false
    }
  ]
};
