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
  "id": "p800-1",
  "title": "A. Halloumi Boxes",
  "description": "Theofanis is busy after his last contest, as now, he has to deliver many halloumis all over the world. He stored them inside n boxes and each of which has some number aᵢ written on it. He wants to sort them in non-decreasing order based on their number, however, his machine works in a strange way. It can only reverse any subarray of boxes with length at most k. Find if it's possible to sort the boxes using any number of reverses.",
  "input_format": "The first line contains a single integer t (1 ≤ t ≤ 100) — the number of test cases.\nEach test case consists of two lines:\nFirst line: two integers n and k (1 ≤ k ≤ n ≤ 100)\nSecond line: n integers a₁, a₂, ..., aₙ (1 ≤ aᵢ ≤ 10⁹)",
  "output_format": "For each test case, print YES (case-insensitive), if the array can be sorted in non-decreasing order, or NO (case-insensitive) otherwise.",
  "test_case": "5\n3 2\n1 2 3\n3 1\n9 9 9\n4 4\n6 4 2 1\n4 3\n10 3 830 14\n2 1\n3 1",
  "answer": "YES\nYES\nYES\nYES\nNO",
  "solved": false
}
,
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
  "id": "p8003",
  "title": "A. Cover in Water",
  "description": "Filip has a row of cells, some of which are blocked ('#') and some are empty ('.'). He wants all empty cells to be filled with water. He has two actions:\n1 — Place water in an empty cell.\n2 — Move water from a cell to another empty cell.\nIf at any time, an empty cell i (2 ≤ i ≤ n−1) has water in both its neighboring cells (i−1 and i+1), it automatically becomes filled. Find the minimum number of action 1 operations needed to fill all empty cells with water. Blocked cells cannot contain water or be targeted.",
  "input_format": "The first line contains an integer t (1 ≤ t ≤ 100) — the number of test cases.\nEach test case has:\n- One integer n (1 ≤ n ≤ 100) — number of cells.\n- One string s of length n, consisting of '.' and '#' characters.",
  "output_format": "For each test case, print one integer — the minimum number of action 1 operations needed to fill all empty cells with water.",
  "test_case": "5\n3\n...\n7\n##....#\n7\n..#.#..\n4\n####\n10\n#...#..#.#",
  "answer": "2\n2\n5\n0\n2",
  "solved": false
},
{
  "id": "p9001",
  "title": "A. Jagged Swaps",
  "description": "You are given a permutation a of size n. You can do the following operation: Select an index i from 2 to n−1 such that aᵢ₋₁ < aᵢ and aᵢ > aᵢ₊₁. Swap aᵢ and aᵢ₊₁. Determine whether it is possible to sort the permutation after a finite number of operations.",
  "input_format": "The first line contains the number of test cases t (1 ≤ t ≤ 5000).\nEach test case consists of two lines:\nFirst line: a single integer n (3 ≤ n ≤ 10)\nSecond line: n integers a₁, a₂, ..., aₙ (1 ≤ aᵢ ≤ n), a is a permutation.",
  "output_format": "For each test case, print \"YES\" if it is possible to sort the permutation, and \"NO\" otherwise.",
  "test_case": "6\n3\n1 2 3\n5\n1 3 2 5 4\n5\n5 4 3 2 1\n3\n3 1 2\n4\n2 3 1 4\n5\n5 1 2 3 4",
  "answer": "YES\nYES\nNO\nNO\nNO\nNO",
  "solved": false
}

,{
  "id": "p800-2",
  "title": "A. Game with Integers",
  "description": "Vanya and Vova are playing a game. Players are given an integer n. On their turn, the player can add 1 to the current integer or subtract 1. The players take turns; Vanya starts. If after Vanya's move the integer is divisible by 3, then he wins. If 10 moves have passed and Vanya has not won, then Vova wins. Write a program that, based on the integer n, determines who will win if both players play optimally.",
  "input_format": "The first line contains the integer t (1 ≤ t ≤ 100) — the number of test cases.\nThe single line of each test case contains the integer n (1 ≤ n ≤ 1000).",
  "output_format": "For each test case, print \"First\" if Vanya wins, and \"Second\" if Vova wins.",
  "test_case": "6\n1\n3\n5\n100\n999\n1000",
  "answer": "First\nSecond\nFirst\nFirst\nSecond\nFirst",
  "solved": false
}
,
{
  "id": "p9002",
  "title": "A. Doremy's Paint 3",
  "description": "An array b₁, b₂, …, bₙ of positive integers is good if all the sums of two adjacent elements are equal to the same value. More formally, the array is good if there exists a k such that b₁ + b₂ = b₂ + b₃ = … = bₙ₋₁ + bₙ = k. Doremy has an array a of length n. Now Doremy can permute its elements (change their order) however she wants. Determine if she can make the array good.",
  "input_format": "The first line contains a single integer t (1 ≤ t ≤ 100) — the number of test cases.\nEach test case contains:\nFirst line: a single integer n (2 ≤ n ≤ 100)\nSecond line: n integers a₁, a₂, ..., aₙ (1 ≤ aᵢ ≤ 10⁵)",
  "output_format": "For each test case, print \"Yes\" if it is possible to make the array good, and \"No\" otherwise.",
  "test_case": "5\n2\n8 9\n3\n1 1 2\n4\n1 1 4 5\n5\n2 3 3 3 3\n4\n100000 100000 100000 100000",
  "answer": "Yes\nYes\nNo\nNo\nYes",
  "solved": false
}
,
{
  "id": "p800-3",
  "title": "A. How Much Does Daytona Cost?",
  "description": "We define an integer to be the most common on a subsegment if its number of occurrences on that subsegment is larger than the number of occurrences of any other integer in that subsegment. A subsegment of an array is a consecutive segment of elements in the array a.\n\nGiven an array a of size n, and an integer k, determine if there exists a non-empty subsegment of a where k is the most common element.",
  "input_format": "The first line contains a single integer t (1 ≤ t ≤ 1000) — the number of test cases.\nEach test case contains:\nFirst line: two integers n and k (1 ≤ n ≤ 100, 1 ≤ k ≤ 100)\nSecond line: n integers a₁, a₂, ..., aₙ (1 ≤ aᵢ ≤ 100)",
  "output_format": "For each test case output \"YES\" if there exists a subsegment in which k is the most common element, and \"NO\" otherwise.",
  "test_case": "7\n5 4\n1 4 3 4 1\n4 1\n2 3 4 4\n5 6\n43 5 60 4 2\n2 5\n1 5\n4 1\n5 3 3 1\n1 3\n3\n5 3\n3 4 1 5 5",
  "answer": "YES\nNO\nNO\nYES\nYES\nYES\nYES",
  "solved": false
}
,
{
  "id": "p900-3",
  "title": "A. Goals of Victory",
  "description": "There are n teams in a football tournament. Each pair of teams match up once. After every match, Pak Chanek receives two integers as the result of the match, the number of goals the two teams score during the match. The efficiency of a team is equal to the total number of goals the team scores in each of its matches minus the total number of goals scored by the opponent in each of its matches.\n\nAfter the tournament ends, Pak Dengklek counts the efficiency of every team. Turns out that he forgot about the efficiency of one of the teams. Given the efficiency of n−1 teams a₁, a₂, ..., aₙ₋₁, determine the efficiency of the missing team. It can be shown that the efficiency of the missing team can be uniquely determined.",
  "input_format": "The first line contains an integer t (1 ≤ t ≤ 500) — the number of test cases.\nEach test case contains:\nFirst line: an integer n (2 ≤ n ≤ 100) — the number of teams.\nSecond line: n−1 integers a₁, a₂, ..., aₙ₋₁ (−100 ≤ aᵢ ≤ 100) — the efficiency of the n−1 teams.",
  "output_format": "For each test case, output a single integer representing the efficiency of the missing team.",
  "test_case": "2\n4\n3 -4 5\n11\n-30 12 -57 7 0 -81 -68 41 -89 0",
  "answer": "-4\n265",
  "solved": false
}

,
{
  "id": "p800-4",
  "title": "A. Ambitious Kid",
  "description": "Chaneka, Pak Chanek's child, is an ambitious kid. Given an array of integers [A₁, A₂, ..., Aₙ], in one operation, Chaneka can choose one element and increase or decrease its value by 1. She can perform this operation multiple times on any elements. What is the minimum number of operations required to make the product A₁ × A₂ × ... × Aₙ equal to 0?",
  "input_format": "The first line contains a single integer n (1 ≤ n ≤ 10⁵).\nThe second line contains n integers A₁, A₂, ..., Aₙ (−10⁵ ≤ Aᵢ ≤ 10⁵).",
  "output_format": "Print a single integer — the minimum number of operations needed to make the product of the array equal to 0.",
  "test_case": "3\n2 -6 5\n1\n-3\n5\n0 -1 0 1 0",
  "answer": "2\n3\n0",
  "solved": false
}
,
{
  "id": "p900-1",
  "title": "A. United We Stand",
  "description": "Given an array a of length n, containing integers. You need to split the array into two non-empty arrays b and c such that for any element bi in b and cj in c, cj is not a divisor of bi. Determine any such split, or output -1 if it's impossible.",
  "input_format": "The first line contains a single integer t (1 ≤ t ≤ 500) — the number of test cases.\nEach test case consists of two lines:\nFirst line: an integer n (2 ≤ n ≤ 100) — the length of the array a.\nSecond line: n integers a₁, a₂, ..., aₙ (1 ≤ aᵢ ≤ 10⁹).",
  "output_format": "For each test case, print -1 if no solution exists.\nOtherwise, print three lines:\nFirst line: two integers lb and lc — the lengths of arrays b and c.\nSecond line: lb integers — elements of b.\nThird line: lc integers — elements of c.",
  "test_case": "5\n3\n2 2 2\n5\n1 2 3 4 5\n3\n1 3 5\n7\n1 7 7 2 9 1 4\n5\n4 8 12 12 4",
  "answer": "-1\n3 2\n1 3 5\n2 4\n1 2\n1\n3 5\n2 5\n1 1\n2 4 7 7 9\n3 2\n4 8 4\n12 12",
  "solved": false
}

  ],
  '900': [
   {
  "id": "p1400-11",
  "title": "C. Permutation Swap",
  "description": "You are given an unsorted permutation p1, p2, …, pn. To sort the permutation, you choose a constant k (k ≥ 1) and perform operations. In one operation, you can choose two indices i and j (1 ≤ j < i ≤ n) such that i - j = k and swap pi and pj.\n\nWhat is the maximum value of k that allows you to sort the given permutation?\n\nA permutation is an array consisting of n distinct integers from 1 to n in arbitrary order. The permutation is unsorted, i.e., there exists at least one i such that pi ≠ i.",
  "input_format": "The first line contains an integer t (1 ≤ t ≤ 10^4) — the number of test cases.\nEach test case has two lines:\n- The first line contains an integer n (2 ≤ n ≤ 10^5).\n- The second line contains n distinct integers p1, p2, ..., pn (1 ≤ pi ≤ n), forming a permutation.\nIt is guaranteed that the permutation is unsorted.\nThe total sum of n over all test cases does not exceed 2 × 10^5.",
  "output_format": "For each test case, output a single integer — the maximum k such that the permutation can be sorted using the defined operations.",
  "test_case": "7\n3\n3 1 2\n4\n3 4 1 2\n7\n4 2 6 7 5 3 1\n9\n1 6 7 4 9 2 3 8 5\n6\n1 5 3 4 2 6\n10\n3 10 5 2 9 6 7 8 1 4\n11\n1 11 6 4 8 3 7 5 9 10 2",
  "answer": "1\n2\n3\n4\n3\n2\n3",
  "solved": false
}

,
{
  "id": "p1400-10",
  "title": "C. Comparison String",
  "description": "You are given a string s of length n, where each character is either '<' or '>'. An array a of n+1 elements is compatible with s if for every i from 1 to n:\n- si is '<' if and only if ai < ai+1\n- si is '>' if and only if ai > ai+1\nThe cost of an array is the number of different elements in it. You must find the minimum cost among all arrays compatible with the given string s.",
  "input_format": "The first line contains an integer t (1 ≤ t ≤ 500) — the number of test cases.\nEach test case has two lines:\n- The first line contains one integer n (1 ≤ n ≤ 100).\n- The second line contains the string s consisting of n characters, each either '<' or '>'.",
  "output_format": "For each test case, print a single integer — the minimum cost among all arrays compatible with the given string s.",
  "test_case": "4\n4\n<<>>\n4\n>><<\n5\n>>>>>\n7\n<><><><",
  "answer": "3\n3\n6\n2",
  "solved": false
}

,
{
  "id": "p1400-9",
  "title": "C. Balanced Round",
  "description": "You are the author of a Codeforces round and have prepared n problems, each with a difficulty ai. A round is considered balanced if, after removing some (possibly zero) problems and rearranging the rest, the absolute difference between the difficulties of any two consecutive problems is at most k. Find the minimum number of problems you need to remove to make the round balanced.",
  "input_format": "The first line contains an integer t (1 ≤ t ≤ 1000) — the number of test cases.\nEach test case starts with two integers n and k (1 ≤ n ≤ 2⋅10^5, 1 ≤ k ≤ 10^9) — the number of problems and the maximum allowed absolute difference between consecutive problems.\nThe second line of each test case contains n integers a1, a2, ..., an (1 ≤ ai ≤ 10^9) — the difficulty of the problems.",
  "output_format": "For each test case, print a single integer — the minimum number of problems to remove so the remaining problems can be rearranged into a balanced round.",
  "test_case": "7\n5 1\n1 2 4 5 6\n1 2\n10\n8 3\n17 3 1 20 12 5 17 12\n4 2\n2 4 6 8\n5 3\n2 3 19 10 8\n3 4\n1 10 5\n8 1\n8 3 1 4 5 10 7 3",
  "answer": "2\n0\n5\n0\n3\n1\n4",
  "solved": false
}
,
{
  "id": "p1400-8",
  "title": "C. Longest Divisors Interval",
  "description": "Given a positive integer n, find the maximum size of an interval [l, r] of positive integers such that for every integer i in the interval, n is divisible by i. The size of the interval is r − l + 1. You need to determine this maximum possible size.",
  "input_format": "The first line contains an integer t (1 ≤ t ≤ 10^4) — the number of test cases.\nEach of the next t lines contains a single integer n (1 ≤ n ≤ 10^18).",
  "output_format": "For each test case, print one integer — the maximum size of a valid interval [l, r] such that every number i in this interval divides n.",
  "test_case": "10\n1\n40\n990990\n4204474560\n169958913706572972\n365988220345828080\n387701719537826430\n620196883578129853\n864802341280805662\n1000000000000000000",
  "answer": "1\n2\n3\n6\n4\n22\n3\n1\n2\n2",
  "solved": false
}
,
{
  "id": "p1400-7",
  "title": "C. Make It Zero",
  "description": "You are given an array a of n ≥ 2 integers. In one operation, you can select two indices l and r (1 ≤ l ≤ r ≤ n), compute s = a[l] ⊕ a[l+1] ⊕ ... ⊕ a[r] (⊕ is the bitwise XOR), and replace every a[i] in [l, r] with s. You can do this operation at most 8 times. Your goal is to make all elements in the array equal to 0 using these operations. It is guaranteed that a solution always exists.",
  "input_format": "The first line contains an integer t (1 ≤ t ≤ 500) — the number of test cases.\nEach test case consists of:\n- A line with an integer n (2 ≤ n ≤ 100) — the number of elements in the array.\n- A line with n integers a1, a2, ..., an (0 ≤ ai ≤ 100) — the array elements.",
  "output_format": "For each test case, print the number k (0 ≤ k ≤ 8) — the number of operations used.\nThen print k lines, each containing two integers l and r (1 ≤ l ≤ r ≤ n) — the indices of the range selected in that operation.",
  "test_case": "6\n4\n1 2 3 0\n8\n3 1 4 1 5 9 2 6\n6\n1 5 4 1 4 7\n5\n0 0 0 0 0\n7\n1 1 9 9 0 1 8\n3\n100 100 0",
  "answer": "1\n1 4\n2\n4 7\n1 8\n6\n1 2\n3 4\n5 6\n1 3\n4 6\n1 6\n0\n4\n1 2\n6 7\n3 4\n6 7\n1\n1 2",
  "solved": false
}
,
{
  "id": "p1400-6",
  "title": "C. Jellyfish and Undertale",
  "description": "Flowey has planted a bomb with an initial timer set to b. Every second, the timer decreases by 1. You have n tools that can each be used once to increase the timer by xi seconds. However, if the timer exceeds a due to using a tool, it is set to a instead (max cap). Tools can be used at the start of any second. You need to determine the maximum number of seconds before the bomb explodes by using the tools optimally.",
  "input_format": "The first line contains an integer t (1 ≤ t ≤ 2000) — the number of test cases.\nEach test case contains:\n- A line with three integers a, b, and n (1 ≤ b ≤ a ≤ 10^9, 1 ≤ n ≤ 100).\n- A line with n integers x1, x2, ..., xn (1 ≤ xi ≤ 10^9).\nNote: The sum of n across all test cases is not bounded.",
  "output_format": "For each test case, output a single integer — the maximum number of seconds until the bomb explodes if the tools are used optimally.",
  "test_case": "2\n5 3 3\n1 1 7\n7 1 5\n1 2 5 6 8",
  "answer": "9\n21",
  "solved": false
}
,
{
  "id": "p1400-5",
  "title": "C. Vasilije in Cacak",
  "description": "Given three positive integers n, k, and x, determine whether it's possible to choose k distinct integers between 1 and n such that their sum is equal to x. You must help Vasilije solve this problem.",
  "input_format": "The first line contains a single integer t (1 ≤ t ≤ 10^4) — the number of test cases.\nEach test case consists of a single line containing three integers n, k, and x (1 ≤ n ≤ 2⋅10^5, 1 ≤ k ≤ n, 1 ≤ x ≤ 4⋅10^10).\nNote: The sum of n over all test cases may exceed 2⋅10^5.",
  "output_format": "For each test case, print \"YES\" if it is possible to choose k distinct integers between 1 and n such that their sum is equal to x. Otherwise, print \"NO\". Output is case-insensitive.",
  "test_case": "12\n5 3 10\n5 3 3\n10 10 55\n6 5 20\n2 1 26\n187856 87856 2609202300\n200000 190000 19000000000\n28 5 2004\n2 2 2006\n9 6 40\n47202 32455 613407217\n185977 145541 15770805980",
  "answer": "YES\nNO\nYES\nYES\nNO\nNO\nYES\nNO\nNO\nNO\nYES\nYES",
  "solved": false
}
,
{
  "id": "p1400-4",
  "title": "C. Chemistry",
  "description": "You are given a string s of length n, consisting of lowercase Latin letters, and an integer k. You need to check if it is possible to remove exactly k characters from the string s in such a way that the remaining characters can be rearranged to form a palindrome. A palindrome is a string that reads the same forwards and backwards (e.g., \"aba\", \"abccba\").",
  "input_format": "The first line contains a single integer t (1 ≤ t ≤ 10^4) — the number of test cases.\nEach test case consists of:\n- A line containing two integers n and k (0 ≤ k < n ≤ 10^5).\n- A line containing a string s of length n consisting of lowercase Latin letters.\nThe total sum of n over all test cases does not exceed 2⋅10^5.",
  "output_format": "For each test case, print \"YES\" if it is possible to remove exactly k characters so that the remaining characters can be rearranged into a palindrome. Otherwise, print \"NO\". Answers are case-insensitive.",
  "test_case": "14\n1 0\na\n2 0\nab\n2 1\nba\n3 1\nabb\n3 2\nabc\n6 2\nbacacd\n6 2\nfagbza\n6 2\nzwaafa\n7 2\ntaagaak\n14 3\nttrraakkttoorr\n5 3\ndebdb\n5 4\necadc\n5 3\ndebca\n5 3\nabaac",
  "answer": "YES\nNO\nYES\nYES\nYES\nYES\nNO\nNO\nYES\nYES\nYES\nYES\nNO\nYES",
  "solved": false
}
,
{
  "id": "p1400-3",
  "title": "C. Forked!",
  "description": "Lunchbox is playing chess on an infinite chessboard with modified knight moves. Instead of the traditional 1 and 2 tile moves, a knight can move 'a' tiles in one direction and 'b' tiles in the other. Given the coordinates of the king and queen, find the number of positions such that if a knight was placed on that cell, it would attack both the king and the queen.",
  "input_format": "The first line contains an integer t (1 ≤ t ≤ 1000) — the number of test cases.\nEach test case contains three lines:\n- The first line contains two integers a and b (1 ≤ a, b ≤ 10^8).\n- The second line contains two integers xK and yK (0 ≤ xK, yK ≤ 10^8).\n- The third line contains two integers xQ and yQ (0 ≤ xQ, yQ ≤ 10^8).\nIt is guaranteed that the king and queen are on different cells.",
  "output_format": "For each test case, print a single integer — the number of positions where a knight can be placed to attack both the king and the queen.",
  "test_case": "4\n2 1\n0 0\n3 3\n1 1\n3 1\n1 3\n4 4\n0 0\n8 0\n4 2\n1 4\n3 4",
  "answer": "2\n1\n2\n0",
  "solved": false
}
,
{
  "id": "p1400-12",
  "title": "C. Odd Queries",
  "description": "You are given an array a1, a2, ..., an. You have to answer q queries. Each query is of the form:\n\nIf we change all elements from index l to r in the array to a new value k, will the sum of the entire array become **odd**?\n\n**Important**: Queries are independent — the original array remains unchanged after each query.\n\nYou must answer YES if the array’s sum becomes odd after applying the change, and NO otherwise.",
  "input_format": "The first line contains an integer t (1 ≤ t ≤ 10^4) — the number of test cases.\nEach test case contains:\n- A line with two integers n and q (1 ≤ n, q ≤ 2⋅10^5).\n- A line with n integers a1, ..., an (1 ≤ ai ≤ 10^9).\n- q lines each with three integers l, r, k (1 ≤ l ≤ r ≤ n; 1 ≤ k ≤ 10^9).\n\nThe sum of all n and q over all test cases does not exceed 2⋅10^5.",
  "output_format": "For each query, output 'YES' if the total sum becomes odd, and 'NO' otherwise.\n\nYou can print each answer in any case (YES/yes/Yes/etc).",
  "test_case": "2\n5 5\n2 2 1 3 2\n2 3 3\n2 3 4\n1 5 5\n1 4 9\n2 4 3\n10 5\n1 1 1 1 1 1 1 1 1 1\n3 8 13\n2 5 10\n3 8 10\n1 10 2\n1 9 100",
  "answer": "YES\nYES\nYES\nNO\nYES\nNO\nNO\nNO\nNO\nYES",
  "solved": false
}


  ],
  '1100': [
    {
  "id": "p1600-9",
  "title": "Cardboard for Pictures",
  "description": "Mircea has n pictures. The i-th picture is a square with a side length of si centimeters.\n\nHe mounted each picture on a square piece of cardboard so that each picture has a border of w centimeters of cardboard on all sides. In total, he used c square centimeters of cardboard. Given the picture sizes and the value c, can you find the value of w?\n\nA picture of the first test case. Here c=50=5²+4²+3², so w=1 is the answer.\n\nPlease note that the piece of cardboard goes behind each picture, not just the border.",
  "input_format": "The first line contains a single integer t (1 ≤ t ≤ 1000) — the number of test cases.\n\nThe first line of each test case contains two positive integers n and c (1 ≤ n ≤ 2⋅10⁵; 1 ≤ c ≤ 10¹⁸) — the number of paintings, and the amount of used square centimeters of cardboard.\n\nThe second line of each test case contains n space-separated integers si (1 ≤ si ≤ 10⁴) — the sizes of the paintings.\n\nThe sum of n over all test cases doesn't exceed 2⋅10⁵.\n\nAdditional constraint on the input: Such an integer w exists for each test case.",
  "output_format": "For each test case, output a single integer — the value of w (w ≥ 1) which was used to use exactly c squared centimeters of cardboard.",
  "test_case": "10\n3 50\n3 2 1\n1 100\n6\n5 500\n2 2 2 2 2\n2 365\n3 4\n2 469077255466389\n10000 2023\n10 635472106413848880\n9181 4243 7777 1859 2017 4397 14 9390 2245 7225\n7 176345687772781240\n9202 9407 9229 6257 7743 5738 7966\n14 865563946464579627\n3654 5483 1657 7571 1639 9815 122 9468 3079 2666 5498 4540 7861 5384\n19 977162053008871403\n9169 9520 9209 9013 9300 9843 9933 9454 9960 9167 9964 9701 9251 9404 9462 9277 9661 9164 9161\n18 886531871815571953\n2609 10 5098 9591 949 8485 6385 4586 1064 5412 6564 8460 2245 6552 5089 8353 3803 3764",
  "answer": "1\n2\n4\n5\n7654321\n126040443\n79356352\n124321725\n113385729\n110961227",
  "solved": false
}
,
{
  "id": "p1600-8",
  "title": "2D Traveling",
  "description": "Piggy lives on an infinite plane with the Cartesian coordinate system on it.\n\nThere are n cities on the plane, numbered from 1 to n, and the first k cities are defined as major cities. The coordinates of the i-th city are (xi, yi).\n\nPiggy, as a well-experienced traveller, wants to have a relaxing trip after Zhongkao examination. Currently, he is in city a, and he wants to travel to city b by air. You can fly between any two cities, and you can visit several cities in any order while travelling, but the final destination must be city b.\n\nBecause of active trade between major cities, it's possible to travel by plane between them for free. Formally, the price of an air ticket f(i, j) between two cities i and j is defined as follows:\n- f(i, j) = 0 if cities i and j are both major cities\n- f(i, j) = |xi−xj| + |yi−yj| otherwise\n\nPiggy doesn't want to save time, but he wants to save money. So you need to tell him the minimum value of the total cost of all air tickets if he can take any number of flights.",
  "input_format": "The first line contains an integer t (1 ≤ t ≤ 10^4) — the number of test cases.\n\nThe first line of each test case contains four integers n, k, a and b (2 ≤ n ≤ 2⋅10^5, 0 ≤ k ≤ n, 1 ≤ a, b ≤ n, a ≠ b).\n\nThen n lines follow, each line contains two integers xi and yi (−10^9 ≤ xi, yi ≤ 10^9) — the coordinates of the i-th city. The first k lines describe major cities. It is guaranteed that all coordinates are pairwise distinct.\n\nIt is guaranteed that the sum of n over all test cases does not exceed 2⋅10^5.",
  "output_format": "For each test case, print a single integer — the minimum value of the total price of all air tickets.",
  "test_case": "5\n6 2 3 5\n0 0\n1 -2\n-2 1\n-1 3\n2 -2\n-3 -3\n2 0 1 2\n-1000000000 -1000000000\n1000000000 1000000000\n7 5 4 2\n154 147\n-154 -147\n123 456\n20 23\n43 20\n998 244\n353 100\n3 1 3 1\n0 10\n1 20\n2 30\n4 3 2 4\n0 0\n-100 100\n-1 -1\n-1 0",
  "answer": "4\n4000000000\n0\n22\n1",
  "solved": false
}
,
{
  "id": "p16987",
  "title": "250 Thousand Tons of TNT",
  "description": "Alex is participating in the filming of another video of BrMeast, and BrMeast asked Alex to prepare 250 thousand tons of TNT, but Alex didn't hear him well, so he prepared n boxes and arranged them in a row waiting for trucks. The i-th box from the left weighs ai tons.\n\nAll trucks that Alex is going to use hold the same number of boxes, denoted by k. Loading happens the following way:\n- The first k boxes go to the first truck\n- The second k boxes go to the second truck\n- ⋯\n- The last k boxes go to the (n/k)-th truck\n\nUpon loading completion, each truck must have exactly k boxes. In other words, if at some point it is not possible to load exactly k boxes into the truck, then the loading option with that k is not possible.\n\nAlex hates justice, so he wants the maximum absolute difference between the total weights of two trucks to be as great as possible. If there is only one truck, this value is 0.\n\nAlex has quite a lot of connections, so for every 1 ≤ k ≤ n, he can find a company such that each of its trucks can hold exactly k boxes. Print the maximum absolute difference between the total weights of any two trucks.",
  "input_format": "The first line contains one integer t (1 ≤ t ≤ 10^4) — the number of test cases.\n\nThe first line of each test case contains one integer n (1 ≤ n ≤ 150000) — the number of boxes.\n\nThe second line contains n integers a1,a2,…,an (1 ≤ ai ≤ 10^9) — the weights of the boxes.\n\nIt is guaranteed that the sum of n for all test cases does not exceed 150000.",
  "output_format": "For each test case, print a single integer — the maximum absolute difference between the total weights of any two trucks.",
  "test_case": "5\n2\n1 2\n6\n10 2 3 6 1 3\n4\n1000000000 1000000000 1000000000 1000000000\n15\n60978 82265 78961 56708 39846 31071 4913 4769 29092 91348 64119 72421 98405 222 14294\n8\n19957 69913 37531 96991 57838 21008 14207 19198",
  "answer": "1\n9\n0\n189114\n112141",
  "solved": false
}
,
{
  "id": "p16896",
  "title": "Yarik and Array",
  "description": "A subarray is a continuous part of an array.\n\nYarik recently found an array a of n elements and became very interested in finding the maximum sum of a non-empty subarray. However, Yarik doesn't like consecutive integers with the same parity, so the subarray he chooses must have alternating parities for adjacent elements.\n\nFor example, [1,2,3] is acceptable, but [1,2,4] is not, as 2 and 4 are both even and adjacent.\n\nYou need to help Yarik by finding the maximum sum of such a subarray.",
  "input_format": "The first line contains an integer t (1 ≤ t ≤ 10^4) — number of test cases. Each test case is described as follows.\n\nThe first line of each test case contains an integer n (1 ≤ n ≤ 2⋅10^5) — length of the array.\n\nThe second line of each test case contains n integers a1, a2, ..., an (−10^3 ≤ ai ≤ 10^3) — elements of the array.\n\nIt is guaranteed that the sum of n for all test cases does not exceed 2⋅10^5.",
  "output_format": "For each test case, output a single integer — the answer to the problem.",
  "test_case": "7\n5\n1 2 3 4 5\n4\n9 9 8 8\n6\n-1 4 -1 0 5 -4\n4\n-1 2 4 -3\n1\n-1000\n3\n101 -99 101\n20\n-10 5 -8 10 6 -10 7 9 -2 -6 7 2 -4 6 -1 7 -6 -7 4 1",
  "answer": "15\n17\n8\n4\n-1000\n101\n10",
  "solved": false
}
,
{
  "id": "p16005",
  "title": "Collecting Game",
  "description": "You are given an array a of n positive integers and a score. If your score is greater than or equal to ai, then you can increase your score by ai and remove ai from the array.\n\nFor each index i, output the maximum number of additional array elements that you can remove if you remove ai and then set your score to ai. Note that the removal of ai should not be counted in the answer.",
  "input_format": "Each test contains multiple test cases. The first line contains an integer t (1 ≤ t ≤ 5000) — the number of test cases.\n\nThe first line of each test case contains a single integer n (1 ≤ n ≤ 10^5) — the length of the array.\n\nThe second line of each test case contains n integers a1, a2, ..., an (1 ≤ ai ≤ 10^9) — the elements of the array.\n\nIt is guaranteed that the sum of n over all test cases does not exceed 10^5.",
  "output_format": "For each test case, output n integers, the i-th of which denotes the maximum number of additional array elements that you can remove if you remove ai from the array and then set your score to ai.",
  "test_case": "4\n5\n20 5 1 4 2\n3\n1434 7 1442\n1\n1\n5\n999999999 999999999 999999999 1000000000 1000000000",
  "answer": "4 3 0 3 1\n1 0 2\n0\n4 4 4 4 4",
  "solved": false
}
,
{
  "id": "p16004",
  "title": "Quests",
  "description": "Monocarp is playing a computer game. In order to level up his character, he can complete quests. There are n quests in the game, numbered from 1 to n.\n\nMonocarp can complete quests according to the following rules:\n\n- The 1st quest is always available for completion;\n- The i-th quest is available for completion if all quests j < i have been completed at least once.\n\nNote that Monocarp can complete the same quest multiple times.\n\nFor each completion, the character gets some amount of experience points:\n- For the first completion of the i-th quest, he gets ai experience points;\n- For each subsequent completion of the i-th quest, he gets bi experience points.\n\nMonocarp is a very busy person, so he has free time to complete no more than k quests. Your task is to calculate the maximum possible total experience Monocarp can get if he can complete no more than k quests.",
  "input_format": "The first line contains a single integer t (1 ≤ t ≤ 10^4) — the number of test cases.\n\nThe first line of each test case contains two integers n and k (1 ≤ n ≤ 2⋅10^5; 1 ≤ k ≤ 2⋅10^5) — the number of quests and the maximum number of quests Monocarp can complete, respectively.\n\nThe second line contains n integers a1, a2, ..., an (1 ≤ ai ≤ 10^3).\n\nThe third line contains n integers b1, b2, ..., bn (1 ≤ bi ≤ 10^3).\n\nAdditional constraint on the input: the sum of n over all test cases does not exceed 2⋅10^5.",
  "output_format": "For each test case, print a single integer — the maximum possible total experience Monocarp can get if he can complete no more than k quests.",
  "test_case": "4\n4 7\n4 3 1 2\n1 1 1 1\n3 2\n1 2 5\n3 1 8\n5 5\n3 2 4 1 4\n2 3 1 4 7\n6 4\n1 4 5 4 5 10\n1 5 1 2 5 1",
  "answer": "13\n4\n15\n15",
  "solved": false
}
,
{
  "id": "p16003",
  "title": "Erase First or Second Letter",
  "description": "You are given a string s of length n. Let's define two operations you can apply on the string:\n\n1. Remove the first character of the string;\n2. Remove the second character of the string.\n\nYour task is to find the number of distinct non-empty strings that can be generated by applying the given operations on the initial string any number of times (possibly zero), in any order.",
  "input_format": "Each test consists of multiple test cases. The first line contains a single integer t (1 ≤ t ≤ 10^4) — the number of test cases.\n\nThe description of the test cases follows. The first line of each test case contains n (1 ≤ n ≤ 10^5) — the length of the string.\nThe second line of each test case contains the string s. It is guaranteed that the string only contains lowercase letters of the English alphabet.\n\nIt is guaranteed that the sum of n over all test cases does not exceed 2⋅10^5.",
  "output_format": "For each test case, output a single integer: the number of distinct non-empty strings you can get.",
  "test_case": "5\n5\naaaaa\n1\nz\n5\nababa\n14\nbcdaaaabcdaaaa\n20\nabcdefghijklmnopqrst",
  "answer": "5\n1\n9\n50\n210",
  "solved": false
}

,
{
  "id": "p1600-10",
  "title": "Counting Orders",
  "description": "You are given two arrays a and b each consisting of n integers. All elements of a are pairwise distinct.\n\nFind the number of ways to reorder a such that ai > bi for all 1 ≤ i ≤ n, modulo 10^9+7.\n\nTwo ways of reordering are considered different if the resulting arrays are different.",
  "input_format": "Each test contains multiple test cases. The first line contains the number of test cases t (1 ≤ t ≤ 10^4).\n\nThe description of the test cases follows. The first line of each test case contains a single integer n (1 ≤ n ≤ 2⋅10^5) — the length of the arrays a and b.\n\nThe second line of each test case contains n distinct integers a1, a2, …, an (1 ≤ ai ≤ 10^9).\n\nThe third line contains n integers b1, b2, …, bn (1 ≤ bi ≤ 10^9).\n\nIt is guaranteed that all elements of a are pairwise distinct and the sum of n over all test cases does not exceed 2⋅10^5.",
  "output_format": "For each test case, output the number of ways to reorder array a such that ai > bi for all 1 ≤ i ≤ n, modulo 10^9+7.",
  "test_case": "5\n6\n9 6 8 4 5 2\n4 1 5 6 3 1\n3\n4 3 2\n3 4 9\n1\n2\n1\n3\n2 3 4\n1 3 3\n12\n2 3 7 10 23 28 29 50 69 135 420 1000\n1 1 2 3 5 8 13 21 34 55 89 144",
  "answer": "32\n0\n1\n0\n13824",
  "solved": false
}
,
{
  "id": "p1600-11",
  "title": "Lunatic Never Content",
  "description": "You have an array `a` of `n` non-negative integers. Let's define `f(a, x) = [a1 % x, a2 % x, ..., an % x]` for some positive integer `x`. Find the largest `x` such that `f(a, x)` is a palindrome.\n\nHere, `ai % x` is the remainder of the division of `ai` by `x`.\n\nAn array is a palindrome if it reads the same backward as forward. More formally, an array `a` of length `n` is a palindrome if for every `i` (1 ≤ i ≤ n), `ai = a[n − i + 1]`.",
  "input_format": "The first line contains an integer `t` (1 ≤ t ≤ 10^5) — the number of test cases.\n\nEach test case contains two lines:\n- The first line contains a single integer `n` (1 ≤ n ≤ 10^5).\n- The second line contains `n` integers `a1, a2, ..., an` (0 ≤ ai ≤ 10^9).\n\nIt is guaranteed that the sum of all `n` across all test cases does not exceed 10^5.",
  "output_format": "For each test case, output the largest `x` such that `f(a, x)` is a palindrome. If there exists no maximum value (i.e., `f(a, x)` is already a palindrome for any `x`), output 0.",
  "test_case": "4\n2\n1 2\n8\n3 0 1 2 0 3 2 1\n1\n0\n3\n100 1 1000000000",
  "answer": "1\n2\n0\n999999900",
  "solved": false
}


  ],
  '1300': [
    {
  "id": "p1600-19",
  "title": "Scoring Subsequences",
  "description": "The **score** of a sequence `[s1, s2, ..., sd]` is defined as:\n\n    (s1 * s2 * ... * sd) / d!\n\nwhere `d!` is the factorial of `d`, and the **score of an empty sequence is 1**.\n\nFor a given sequence `[s1, s2, ..., sd]`, let `m` be the **maximum score** of any of its subsequences. The **cost** of the sequence is defined as the **maximum length** of a subsequence that has a score of exactly `m`.\n\nYou are given a non-decreasing sequence `[a1, a2, ..., an]`. For each prefix `[a1, ..., ak]` (for `k = 1` to `n`), compute its **cost**.",
  "input_format": "The first line contains an integer `t` (1 ≤ t ≤ 10⁴) — the number of test cases.\n\nEach test case consists of two lines:\n- First line: a single integer `n` (1 ≤ n ≤ 10⁵) — the length of the sequence.\n- Second line: `n` integers `a1, a2, ..., an` (1 ≤ ai ≤ n), given in **non-decreasing order**.\n\nThe sum of all `n` over all test cases does not exceed 5 × 10⁵.",
  "output_format": "For each test case, output `n` integers. The `k`-th integer is the **cost** of the prefix `[a1, ..., ak]`.",
  "test_case": "3\n3\n1 2 3\n2\n1 1\n5\n5 5 5 5 5",
  "answer": "1 1 2\n1 1\n1 2 3 4 5",
  "solved": false
 
}

    ,
    {
  "id": "p1600-18",
  "title": "Rudolf and Snowflakes (simple version)",
  "description": "Rudolf models a **snowflake** as an undirected graph built using these rules:\n\n1. Start with one vertex.\n2. Connect this vertex to **k > 1** new vertices.\n3. For each vertex connected to only one other vertex, connect it to **k** more new vertices.\n4. Repeat this at least once.\n\nThis construction forms a kind of **k-ary tree** with a specific branching rule.\n\nYou are given an integer `n`. Determine if there exists a value of **k > 1** such that a snowflake graph can be formed with exactly `n` vertices.\n\nYour task is to answer **YES** or **NO** for each test case.",
  "input_format": "The first line contains a single integer `t` (1 ≤ t ≤ 10⁴) — the number of test cases.\n\nEach of the next `t` lines contains one integer `n` (1 ≤ n ≤ 10⁶) — the number of vertices to test.",
  "output_format": "For each test case, print one line — either `YES` or `NO` depending on whether a valid snowflake with `n` vertices can be constructed.",
  "test_case": "9\n1\n2\n3\n6\n13\n15\n255\n10101\n1000000",
  "answer": "NO\nNO\nNO\nNO\nYES\nYES\nYES\nYES\nNO",
  "solved": false
}

,
{
  "id": "p1600-17",
  "title": "Strong Vertices",
  "description": "You are given two arrays `a` and `b`, both of length `n`. A directed graph is constructed where an edge from vertex `u` to vertex `v` (with `u ≠ v`) exists **if and only if**:\n\n```\na[u] - a[v] >= b[u] - b[v]\n```\n\nA vertex `V` is called **strong** if there exists a **path** from `V` to **all other vertices**.\n\nA path is a chain of vertices connected by directed edges that allows traversal from one to another by following edge directions.\n\nYour task is to find and return **all strong vertices** in ascending order for each test case.",
  "input_format": "The first line contains a single integer `t` (1 ≤ t ≤ 10⁴) — the number of test cases.\n\nEach test case contains:\n- One integer `n` (2 ≤ n ≤ 2⋅10⁵) — the length of arrays `a` and `b`.\n- A line with `n` integers `a1, a2, ..., an` (−10⁹ ≤ ai ≤ 10⁹).\n- A line with `n` integers `b1, b2, ..., bn` (−10⁹ ≤ bi ≤ 10⁹).\n\nIt is guaranteed that the sum of `n` over all test cases does not exceed 2⋅10⁵.",
  "output_format": "For each test case, print two lines:\n- First, print an integer `k` — the number of strong vertices.\n- Second, print `k` space-separated integers — the indices (1-based) of all strong vertices in ascending order.",
  "test_case": "5\n4\n3 1 2 4\n4 3 2 1\n5\n1 2 4 1 2\n5 2 3 3 1\n2\n1 2\n2 1\n3\n0 2 1\n1 3 2\n3\n5 7 4\n-2 -3 -6",
  "answer": "1\n4\n2\n3 5\n1\n2\n3\n1 2 3\n2\n2 3",
  "solved": false
}
,
{
  "id": "p1600-16",
  "title": "Make it Alternating",
  "description": "You are given a binary string `s`. A binary string is a string consisting of characters `0` and/or `1`.\n\nYou can perform the following operation on `s` any number of times (even zero):\n- Choose an integer `i` (1 ≤ i ≤ |s|), then **erase** the character `s[i]`.\n\nYour goal is to make `s` alternating, i.e., after operations, every two adjacent characters in `s` should be different (no two equal consecutive characters).\n\nYou need to calculate two values:\n1. The **minimum number of operations** required to make `s` alternating.\n2. The **number of different shortest sequences of operations** that make `s` alternating.\n\nTwo sequences of operations are considered different if in at least one operation, the chosen index `i` is different in the two sequences.\n\nSince the second number can be large, print it modulo `998244353`.",
  "input_format": "The first line contains one integer `t` (1 ≤ t ≤ 10^4) — the number of test cases.\n\nEach test case consists of one line containing the string `s` (1 ≤ |s| ≤ 2⋅10^5).\n\nThe total length of all strings over all test cases does not exceed 2⋅10^5.",
  "output_format": "For each test case, print two integers separated by a space:\n- The minimum number of deletions needed to make `s` alternating.\n- The number of different ways to perform those deletions (modulo 998244353).",
  "test_case": "3\n10010\n111\n0101",
  "answer": "1 2\n2 6\n0 1",
  "solved": false
}

,
{
  "id": "p1600-15",
  "title": "Divide and Equalize",
  "description": "You are given an array `a` consisting of `n` positive integers. You can perform the following operation on it:\n\n1. Choose a pair of elements `a[i]` and `a[j]` (`1 ≤ i, j ≤ n` and `i ≠ j`);\n2. Choose one of the **divisors** of the integer `a[i]`, i.e., an integer `x` such that `a[i] % x == 0`;\n3. Replace `a[i]` with `a[i] / x` and `a[j]` with `a[j] * x`.\n\nDetermine whether it is possible to make **all elements in the array the same** by applying the operation a certain number of times (possibly zero).\n\nFor example, given `a = [100, 2, 50, 10, 1]`, you can:\n- Choose `a[3] = 50` and `a[2] = 2`, `x = 5`. Result: `a = [100, 10, 10, 10, 1]`\n- Then choose `a[1] = 100` and `a[5] = 1`, `x = 10`. Result: `a = [10, 10, 10, 10, 10]`\n\nSo the final array has all equal elements.",
  "input_format": "The first line contains an integer `t` (1 ≤ t ≤ 2000) — the number of test cases.\n\nEach test case consists of:\n- One line with an integer `n` (1 ≤ n ≤ 10^4) — the number of elements in array `a`.\n- One line with `n` integers `a[1], a[2], ..., a[n]` (1 ≤ a[i] ≤ 10^6).\n\nIt is guaranteed that the **sum of all `n` over all test cases does not exceed 10^4**.",
  "output_format": "For each test case, output one line:\n- `YES` if it's possible to make all elements equal;\n- `NO` otherwise.\n\nThe output is case-insensitive.",
  "test_case": "7\n5\n100 2 50 10 1\n3\n1 1 1\n4\n8 2 4 2\n4\n30 50 27 20\n2\n75 40\n2\n4 4\n3\n2 3 1",
  "answer": "YES\nYES\nNO\nYES\nNO\nYES\nNO",
  "solved": false
}
,
{
  "id": "p1600-14",
  "title": "Romantic Glasses",
  "description": "Iulia has `n` glasses arranged in a line. The `i`-th glass has `a[i]` units of juice in it. Iulia drinks only from **odd-numbered** glasses, while her date drinks only from **even-numbered** glasses.\n\nTo impress her date, Iulia wants to find a contiguous subarray of these glasses such that **both Iulia and her date will have the same amount of juice in total** when considering **only the glasses in this subarray**.\n\nMore formally, find if there exist two indices `l` and `r` such that `1 ≤ l ≤ r ≤ n`, and:\n- if `l` and `r` have the **same parity**, then `a[l] + a[l+2] + ... + a[r] == a[l+1] + a[l+3] + ... + a[r-1]`\n- otherwise, `a[l] + a[l+2] + ... + a[r-1] == a[l+1] + a[l+3] + ... + a[r]`\n\nReturn `YES` if such a subarray exists, otherwise `NO`.",
  "input_format": "The first line contains a single integer `t` (1 ≤ t ≤ 10^4) — the number of test cases.\n\nEach test case contains:\n- A single integer `n` (1 ≤ n ≤ 2⋅10^5) — the number of glasses.\n- A second line with `n` integers `a[1], ..., a[n]` (1 ≤ a[i] ≤ 10^9) — the amount of juice in each glass.\n\nIt is guaranteed that the **sum of all `n` across test cases does not exceed 2⋅10^5**.",
  "output_format": "For each test case, output `YES` if there exists a valid subarray, otherwise output `NO`. You may print each letter in any case (e.g., `yes`, `Yes`, `YEs` are all valid).",
  "test_case": "6\n3\n1 3 2\n6\n1 1 1 1 1 1\n10\n1 6 9 8 55 3 14 2 7 2\n8\n1 2 11 4 1 5 1 2\n6\n2 6 1 5 7 8\n9\n2 5 10 4 4 9 6 7 8",
  "answer": "YES\nYES\nNO\nYES\nNO\nYES",
  "solved": false
}
,
{
  "id": "p1600-13",
  "title": "Find the Different Ones!",
  "description": "You are given an array `a` of `n` integers, and `q` queries.\n\nEach query is represented by two integers `l` and `r` (`1 ≤ l ≤ r ≤ n`). Your task is to find, for each query, two indices `i` and `j` (or determine that they do not exist) such that:\n\n- `l ≤ i ≤ r`;\n- `l ≤ j ≤ r`;\n- `a[i] ≠ a[j]`.\n\nIn other words, for each query, you need to find a pair of different elements among `a[l], a[l+1], ..., a[r]`, or report that such a pair does not exist.",
  "input_format": "The first line contains a single integer `t` (1 ≤ t ≤ 10^4) — the number of test cases.\n\nFor each test case:\n- The first line contains one integer `n` (2 ≤ n ≤ 2⋅10^5).\n- The second line contains `n` integers `a1, a2, ..., an` (1 ≤ ai ≤ 10^6).\n- The third line contains one integer `q` (1 ≤ q ≤ 2⋅10^5).\n- Each of the next `q` lines contains two integers `l` and `r` (1 ≤ l < r ≤ n).\n\nIt is guaranteed that the sum of the values of `n` and `q` across all test cases does not exceed 2⋅10^5.",
  "output_format": "For each query, output two integers separated by space: `i` and `j` (`l ≤ i, j ≤ r`) such that `a[i] ≠ a[j]`. If such a pair does not exist, output `-1 -1`.\n\nOutputs for test cases can be separated by empty lines (optional).",
  "test_case": "5\n5\n1 1 2 1 1\n3\n1 5\n1 2\n1 3\n6\n30 20 20 10 10 20\n5\n1 2\n2 3\n2 4\n2 6\n3 5\n4\n5 2 3 4\n4\n1 2\n1 4\n2 3\n2 4\n5\n1 4 3 2 4\n5\n1 5\n2 4\n3 4\n3 5\n4 5\n5\n2 3 1 4 2\n7\n1 2\n1 4\n1 5\n2 4\n2 5\n3 5\n4 5",
  "answer": "2 3\n-1 -1\n1 3\n\n2 1\n-1 -1\n4 2\n4 6\n5 3\n\n1 2\n1 2\n2 3\n3 2\n\n1 3\n2 4\n3 4\n5 3\n5 4\n\n1 2\n4 2\n1 3\n2 3\n3 2\n5 4\n5 4",
  "solved": false
}
,
{
  "id": "p1600-12",
  "title": "Divisible Pairs",
  "description": "Polycarp has two favorite integers `x` and `y` (they can be equal), and he has found an array `a` of length `n`.\n\nPolycarp considers a pair of indices ⟨i, j⟩ (1 ≤ i < j ≤ n) beautiful if:\n\n- `a[i] + a[j]` is divisible by `x`;\n- `a[i] - a[j]` is divisible by `y`.\n\nFor example, if `x = 5`, `y = 2`, `n = 6`, `a = [1, 2, 7, 4, 9, 6]`, then the only beautiful pairs are:\n- ⟨1,5⟩: `1 + 9 = 10` (divisible by 5) and `1 - 9 = -8` (divisible by 2)\n- ⟨4,6⟩: `4 + 6 = 10` (divisible by 5) and `4 - 6 = -2` (divisible by 2)\n\nYour task is to count the number of beautiful pairs in the array.",
  "input_format": "The first line of the input contains a single integer `t` (1 ≤ t ≤ 10^4) — the number of test cases.\n\nThe first line of each test case contains three integers `n`, `x`, and `y` (2 ≤ n ≤ 2⋅10^5, 1 ≤ x, y ≤ 10^9).\n\nThe second line contains `n` integers `a1, a2, ..., an` (1 ≤ ai ≤ 10^9).\n\nIt is guaranteed that the sum of `n` over all test cases does not exceed 2⋅10^5.",
  "output_format": "For each test case, output a single integer — the number of beautiful pairs in the array `a`.",
  "test_case": "7\n6 5 2\n1 2 7 4 9 6\n7 9 5\n1 10 15 3 8 12 15\n9 4 10\n14 10 2 2 11 11 13 5 6\n9 5 6\n10 7 6 7 9 7 7 10 10\n9 6 2\n4 9 7 1 2 2 13 3 15\n9 2 3\n14 6 1 15 12 15 8 2 15\n10 5 7\n13 3 3 2 12 11 3 7 13 14",
  "answer": "2\n0\n1\n3\n5\n7\n0",
  "solved": false
}
,
{
  "id": "p1611",
  "title": "Lunatic Never Content",
  "description": "You have an array `a` of `n` non-negative integers. Let's define `f(a, x) = [a1 % x, a2 % x, ..., an % x]` for some positive integer `x`. Find the largest `x` such that `f(a, x)` is a palindrome.\n\nHere, `ai % x` is the remainder of the division of `ai` by `x`.\n\nAn array is a palindrome if it reads the same backward as forward. More formally, an array `a` of length `n` is a palindrome if for every `i` (1 ≤ i ≤ n), `ai = a[n − i + 1]`.",
  "input_format": "The first line contains an integer `t` (1 ≤ t ≤ 10^5) — the number of test cases.\n\nEach test case contains two lines:\n- The first line contains a single integer `n` (1 ≤ n ≤ 10^5).\n- The second line contains `n` integers `a1, a2, ..., an` (0 ≤ ai ≤ 10^9).\n\nIt is guaranteed that the sum of all `n` across all test cases does not exceed 10^5.",
  "output_format": "For each test case, output the largest `x` such that `f(a, x)` is a palindrome. If there exists no maximum value (i.e., `f(a, x)` is already a palindrome for any `x`), output 0.",
  "test_case": "4\n2\n1 2\n8\n3 0 1 2 0 3 2 1\n1\n0\n3\n100 1 1000000000",
  "answer": "1\n2\n0\n999999900",
  "solved": false
}
,
{
  "id": "p1600-20",
  "title": "Kazimir and Subsequences",
  "description": "Kazimir Kazimirovich has an array of integers `c1, c2, ..., cn`. He wants to know whether there are **two different subsequences** `a` and `b` of the original array such that:\n\n- `f(a) = f(b)`, where `f(x)` is the **bitwise OR** of all numbers in subsequence `x`.\n\nA **subsequence** is defined by its set of indices. Two subsequences are considered **different** if they are chosen from **different sets of indices**, even if their values are the same.\n\nThe array `c` is **not given directly**. Instead, each `ci` is described by the **positions of set bits** in its binary representation. For example, if `ci = 2^1 + 2^5`, then the input will be `2 1 5`.\n\nYou are to check if there exists at least one **collision** of OR values across **different subsequences**.",
  "input_format": "The first line contains an integer `t` (1 ≤ t ≤ 10⁵) — number of test cases.\n\nFor each test case:\n- First line: a single integer `n` (1 ≤ n ≤ 10⁵) — size of the array.\n- Next `n` lines: Each line starts with an integer `ki` (1 ≤ ki ≤ 10⁵), followed by `ki` integers `pi,1, ..., pi,ki` (1 ≤ pi ≤ 2⋅10⁵) indicating the positions of the bits that are set in `ci`.\n\nIt is guaranteed that the total sum of all `ki` over all test cases is ≤ 10⁵.",
  "output_format": "For each test case, print `Yes` if there exist two **different** subsequences with the **same OR**, otherwise print `No`.\n\nYou may print each answer in any case (e.g., \"YES\", \"yes\", \"yEs\").",
  "test_case": "5\n3\n2 1 5\n2 2 4\n2 2 3\n2\n2 1 2\n1 2\n4\n3 1 2 4\n2 2 4\n4 1 2 5 6\n2 2 5\n5\n3 3 1 2\n3 2 5 3\n5 7 2 3 1 4\n5 1 2 6 3 5\n3 2 6 3\n2\n1 1\n1 2",
  "answer": "No\nYes\nYes\nYes\nNo",
  "solved": false
}

  ],
  '1500':[

    {
  "id": "p1600-30",
  "title": "AGAGA XOOORRR",
  "description": "Baby Ehab loves the XOR operation. He has an array `a` of length `n` and performs the following operation repeatedly:\n\n- Pick **any two adjacent elements**, remove them, and replace them with **their bitwise XOR** (`a[i] ^ a[i+1]`).\n\nEach operation reduces the array size by 1.\n\nEhab wants to know if it is possible to perform this operation any number of times and end up with **at least two** elements left in the array, **all equal**.\n\n### Your task:\nGiven the array, print `YES` if it's possible to end with at least two equal elements, or `NO` otherwise.\n\n### Constraints:\n- `1 ≤ t ≤ 15` — number of test cases\n- `2 ≤ n ≤ 2000` — size of the array\n- `0 ≤ a[i] < 2^30` — array elements\n\n### Note:\n- You must leave at least **two** elements in the final array.\n- The XOR operation is associative and commutative, but the reduction is only allowed via **adjacent elements**.",
  "input_format": "The first line contains an integer `t` — number of test cases.\nEach test case consists of two lines:\n- First line: integer `n`\n- Second line: `n` space-separated integers `a1, a2, ..., an`",
  "output_format": "For each test case, output `YES` if it's possible to leave at least two equal elements after any number of operations, otherwise output `NO`.",
  "test_case": "2\n3\n0 2 2\n4\n2 3 1 10",
  "answer": "YES\nNO",
  "solved": false
}
,
{
  "id": "p1600-29",
  "title": "Factorials and Powers of Two",
  "description": "A number is called **powerful** if it is either a power of two (`2^d`) or a factorial (`d!`) for some non-negative integer `d`. That is:\n- `m` is powerful if `m = 2^d` or `m = d!` for some `d ≥ 0`\n\nYou are given a positive integer `n`. Your task is to find the **minimum number `k`** such that `n` can be expressed as the sum of `k` **distinct** powerful numbers.\n\nIf there is no such representation, output `-1`.\n\n### Examples of powerful numbers:\n- `1 = 0! = 1! = 2^0`\n- `2 = 2^1`, `4 = 2^2`, `6 = 3!`, `8 = 2^3`\n- `24 = 4!`, `120 = 5!`, etc.\n\n### Notes:\n- You must use **distinct** powerful numbers.\n- The same number can't appear more than once in the sum.\n\n### Constraints:\n- `1 ≤ t ≤ 100` — number of test cases\n- `1 ≤ n ≤ 10^12` — the target number to be represented",
  "input_format": "The first line contains a single integer `t` — the number of test cases.\nEach of the next `t` lines contains one integer `n` — the number you must represent as a sum of distinct powerful numbers.",
  "output_format": "For each test case, print the minimum number of distinct powerful numbers whose sum is `n`, or `-1` if no such representation exists.",
  "test_case": "4\n7\n11\n240\n17179869184",
  "answer": "2\n3\n4\n1",
  "solved": false
},
{
  "id": "p1600-28",
  "title": "Line Empire",
  "description": "You are an ambitious king who wants to be the Emperor of The Reals. But first, you must conquer all integer kingdoms located on the number line.\n\nYou start with your capital at position `0`. There are `n` unconquered kingdoms located at `x1 < x2 < ... < xn`, all positive integers.\n\nYou have two possible actions:\n1. **Move Capital**: Move your capital from `c1` to another conquered position `c2` at cost `a * |c1 - c2|`.\n2. **Conquer**: From current capital `c1`, conquer the nearest **unconquered** kingdom `c2` (no other unconquered kingdom between them) at cost `b * |c1 - c2|`. Conquering does **not** change the capital position.\n\nInitially, only position `0` is conquered.\n\nFind the minimum **total** cost to conquer all kingdoms. Your capital can end at any conquered kingdom.\n\nNote: You cannot place the capital at an unconquered or empty location.\n\n### Constraints:\n- `1 ≤ t ≤ 1000` — number of test cases.\n- For each test case:\n  - `1 ≤ n ≤ 2 * 10^5`\n  - `1 ≤ a, b ≤ 10^5`\n  - `1 ≤ x1 < x2 < ... < xn ≤ 10^8`\n- Sum of `n` over all test cases does not exceed `2 * 10^5`.",
  "input_format": "First line contains integer `t` — number of test cases.\nFor each test case:\n- One line with integers `n`, `a`, `b` — number of kingdoms, move cost, conquer cost.\n- One line with `n` integers: `x1 x2 ... xn` — positions of kingdoms.",
  "output_format": "Print `t` lines. For each test case, output one integer — the minimum total cost to conquer all kingdoms.",
  "test_case": "4\n5 2 7\n3 5 12 13 21\n5 6 3\n1 5 6 21 30\n2 9 3\n10 15\n11 27182 31415\n16 18 33 98 874 989 4848 20458 34365 38117 72030",
  "answer": "173\n171\n75\n3298918744",
  "solved": false
},
{
  "id": "p1600-27",
  "title": "Palindrome Basis",
  "description": "You are given a positive integer `n`. A positive integer `a` is called palindromic if it remains the same after reversing the order of its digits (and it has no leading zeroes).\n\nYour task is to determine in how many distinct **multisets** of palindromic integers you can sum to exactly `n`. Two ways are considered **different** if the **frequency** of at least one palindromic integer differs. For example:\n- 5 = 4 + 1 and 5 = 3 + 1 + 1 are different,\n- 5 = 3 + 1 + 1 and 5 = 1 + 3 + 1 are the **same**.\n\nSince the answer may be large, output it modulo 10⁹+7.",
  "input_format": "The first line contains an integer `t` (1 ≤ t ≤ 10⁴) — number of test cases.\nEach of the next `t` lines contains a single integer `n` (1 ≤ n ≤ 4⋅10⁴) — the target sum.",
  "output_format": "For each test case, print the number of distinct ways to represent `n` as a sum of palindromic integers, modulo 10⁹+7.",
  "test_case": "2\n5\n12",
  "answer": "7\n74",
  "solved": false
}
,
{
  "id": "p1600-26",
  "title": "Controllers",
  "description": "You are playing a retro game using controllers with two numbered buttons. You play `n` rounds, where each round has a symbol (`+` or `-`). In each round, you press one of the controller buttons. If the symbol is `+`, your score increases by the button's number; if `-`, your score decreases by the button's number.\n\nYou win the game if your final score is exactly 0. You are given `q` controllers. Each controller has two button values, `a` and `b`.\n\nFor each controller, determine if it's possible to win the game using that controller.",
  "input_format": "The first line contains an integer `n` (1 ≤ n ≤ 2⋅10⁵) — number of rounds.\nThe second line contains a string `s` of length `n` with characters `+` and `-`.\nThe third line contains an integer `q` (1 ≤ q ≤ 10⁵) — number of controllers.\nEach of the next `q` lines contains two integers `a` and `b` (1 ≤ a, b ≤ 10⁹) — the values on the two buttons of a controller.",
  "output_format": "For each controller, print `YES` if the game can be won using it, otherwise print `NO`.",
  "test_case": "8\n+-+---+-\n5\n2 1\n10 3\n7 9\n10 10\n5 3",
  "answer": "YES\nNO\nNO\nNO\nYES",
  "solved": false
}
,
{
  "id": "p1600-25",
  "title": "Tea Tasting",
  "description": "There are `n` sorts of tea and `n` tasters. Each sort `i` has `a[i]` ml of tea, and each taster `j` can drink up to `b[j]` ml per turn.\n\nThe tasting is performed in steps:\n- In step 1, taster `i` drinks from tea `i`.\n- In step 2, taster `i` drinks from tea `i-1`.\n- This continues until all tasters finish tasting.\n\nA taster drinks the minimum of what's available in the tea and their own capacity for that step. Tea is reduced accordingly.\n\nGiven arrays `a` and `b`, calculate how much tea each taster drinks in total.",
  "input_format": "The first line contains an integer `t` (1 ≤ t ≤ 10⁴) — number of test cases.\n\nFor each test case:\n- First line: Integer `n` (1 ≤ n ≤ 2⋅10⁵) — number of teas and tasters.\n- Second line: `n` integers `a[1..n]` (1 ≤ a[i] ≤ 10⁹).\n- Third line: `n` integers `b[1..n]` (1 ≤ b[i] ≤ 10⁹).\n\nThe sum of `n` over all test cases does not exceed `2⋅10⁵`.",
  "output_format": "For each test case, output `n` integers — the total tea each taster drinks, in order.",
  "test_case": "4\n3\n10 20 15\n9 8 6\n1\n5\n7\n4\n13 8 5 4\n3 4 2 1\n3\n1000000000 1000000000 1000000000\n1 1 1000000000",
  "answer": "9 9 12\n5\n3 8 6 4\n1 2 2999999997",
  "solved": false
}
,
{
  "id": "p1600-24",
  "title": "Data Structures Fan",
  "description": "You are given an array of integers `a1, a2, ..., an`, and a binary string `s` of length `n`.\n\nYou must process `q` queries of two types:\n\n1. **Type 1 — Flip Bits:**\n   Format: `1 l r`\n   Flip the bits of string `s` from index `l` to `r` (1-based).\n\n2. **Type 2 — XOR Query:**\n   Format: `2 g` (where `g ∈ {0, 1}`)\n   Compute the XOR of elements `ai` for all `i` such that `si = g`. If there are no such `i`, return 0.\n\nAll queries must be processed in order.\n\n**Note:** XOR of an empty set is `0`.",
  "input_format": "First line: Integer `t` (1 ≤ t ≤ 10⁴) — number of test cases.\n\nFor each test case:\n- First line: Integer `n` (1 ≤ n ≤ 10⁵) — length of array.\n- Second line: `n` integers `a1 a2 ... an` (1 ≤ ai ≤ 10⁹).\n- Third line: Binary string `s` of length `n`.\n- Fourth line: Integer `q` (1 ≤ q ≤ 10⁵) — number of queries.\n- Next `q` lines: Each query as `tp` (1 or 2) and its parameters.\n\nThe sum of all `n` and `q` across test cases does not exceed 10⁵ each.",
  "output_format": "For each query of type 2, print the answer on a new line. Answers for each test case should follow the order of queries.",
  "test_case": "5\n5\n1 2 3 4 5\n01000\n7\n2 0\n2 1\n1 2 4\n2 0\n2 1\n1 1 3\n2 1\n6\n12 12 14 14 5 5\n001001\n3\n2 1\n1 2 4\n2 1\n4\n7 7 7 777\n1111\n3\n2 0\n1 2 3\n2 0\n2\n1000000000 996179179\n11\n1\n2 1\n5\n1 42 20 47 7\n00011\n5\n1 3 4\n1 1 1\n1 3 4\n1 2 4\n2 0",
  "answer": "3\n2\n6\n7\n7\n11\n7\n0\n0\n16430827\n47",
  "solved": false
}
,
{
  "id": "p1300-23",
  "title": "Block Sequence",
  "description": "Given a sequence of integers `a` of length `n`.\n\nA sequence is called **beautiful** if it has the form of a series of blocks, each starting with its length. That is, the first element in each block indicates the length of that block, followed by that many elements. For example:\n\n- `[3, 3, 4, 5, 2, 6, 1]` is beautiful.\n- `[1, 8, 4, 5, 2, 6, 1]` is beautiful.\n- `[1]`, `[1, 4, 3]`, `[3, 2, 1]` are **not** beautiful.\n\nIn one operation, you may remove **any** element from the sequence. What is the minimum number of operations (deletions) needed to make the sequence beautiful?",
  "input_format": "The first line contains an integer `t` (1 ≤ t ≤ 10⁴) — the number of test cases.\n\nEach test case consists of:\n- An integer `n` (1 ≤ n ≤ 2⋅10⁵) — the length of the sequence.\n- A second line with `n` integers `a1, a2, ..., an` (1 ≤ ai ≤ 10⁶) — the elements of the sequence.\n\nThe sum of all `n` over all test cases does not exceed 2⋅10⁵.",
  "output_format": "For each test case, print a single integer — the minimum number of deletions required to make the sequence beautiful.",
  "test_case": "7\n7\n3 3 4 5 2 6 1\n4\n5 6 3 2\n6\n3 4 1 6 7 7\n3\n1 4 3\n5\n1 2 3 4 5\n5\n1 2 3 1 2\n5\n4 5 5 1 5",
  "answer": "0\n4\n1\n1\n2\n1\n0",
  "solved": false
}
,
{
  "id": "p1500-22",
  "title": "Smilo and Monsters",
  "description": "A boy called Smilo is playing a new game! In the game, there are `n` hordes of monsters, and the `i`-th horde contains `ai` monsters. The goal of the game is to destroy all the monsters. To do this, you have two types of attacks and a combo counter `x`, initially set to 0:\n\n- **First type**: Choose an index `i` (1 ≤ i ≤ n) where at least one monster remains. Kill one monster from horde `i`, and increase `x` by 1.\n- **Second type**: Choose an index `i` (1 ≤ i ≤ n) where at least `x` monsters remain. Use an ultimate attack to kill `x` monsters from horde `i`, and reset `x` to 0.\n\nYour task is to destroy all of the monsters, so that there are none left in any horde. Smilo wants to win as quickly as possible — what is the **minimum number of attacks** required to win?",
  "input_format": "The first line contains a single integer `t` (1 ≤ t ≤ 10⁴) — the number of test cases.\n\nEach test case consists of:\n- A single integer `n` (1 ≤ n ≤ 2⋅10⁵) — the number of hordes.\n- A second line with `n` integers `a1, a2, ..., an` (1 ≤ ai ≤ 10⁹) — the number of monsters in each horde.\n\nThe sum of `n` across all test cases does not exceed 2⋅10⁵.",
  "output_format": "For each test case, print a single integer — the minimum number of attacks required to kill all monsters.",
  "test_case": "4\n4\n1 3 1 1\n4\n1 2 1 1\n6\n3 2 1 5 2 4\n2\n1 6",
  "answer": "4\n4\n11\n5",
  "solved": false
}
,
{
  "id": "p1700-21",
  "title": "Greetings",
  "description": "There are n people on the number line; the i-th person is at point `ai` and wants to go to point `bi`. For each person, `ai < bi`, and the starting and ending points of all people are distinct. (That is, all of the `2n` numbers `a1, a2, ..., an, b1, b2, ..., bn` are distinct.)\n\nAll the people will start moving simultaneously at a speed of 1 unit per second until they reach their final point `bi`. When two people meet at the same point, they will greet each other once. How many greetings will there be?\n\nNote that a person can still greet other people even if they have reached their final point.",
  "input_format": "The first line contains a single integer `t` (1 ≤ t ≤ 10⁴) — the number of test cases.\n\nEach test case starts with an integer `n` (1 ≤ n ≤ 2⋅10⁵) — the number of people.\n\nThen `n` lines follow, each containing two integers `ai` and `bi` (−10⁹ ≤ ai < bi ≤ 10⁹) — the starting and ending positions of each person.\n\nAll `2n` numbers `a1, ..., an, b1, ..., bn` are distinct across each test case.\n\nThe sum of `n` across all test cases does not exceed 2⋅10⁵.",
  "output_format": "For each test case, output a single integer denoting the number of greetings that will happen.",
  "test_case": "5\n2\n2 3\n1 4\n6\n2 6\n3 9\n4 5\n1 8\n7 10\n-2 100\n4\n-10 10\n-5 5\n-12 12\n-13 13\n5\n-4 9\n-2 5\n3 4\n6 7\n8 10\n4\n1 2\n3 4\n5 6\n7 8",
  "answer": "1\n9\n6\n4\n0",
  "solved": false
}



  ],

  '1600': [
    {
      'id': "p16001",
      'title': "Minimum Swaps to Sort",
      'description': "Given a permutation of numbers from 1 to n, find the minimum number of swaps to sort the array.",
      'input_format': "An integer n followed by n space-separated integers",
      'output_format': "A single integer - the minimum number of swaps",
      'test_case': "5\n2 3 4 1 5",
      'answer': "3",
      'solved': false
    },
    {
  "id": "p1600-1",
  "title": "Partitioning the Array",
  "description": "Allen has an array a1,a2,…,an. For every positive integer k that is a divisor of n, Allen partitions the array into n/k disjoint subarrays of length k. He earns one point if there exists some positive integer m (m ≥ 2) such that if he replaces every element in the array with its remainder when divided by m, then all subarrays will be identical. Find the number of points Allen will earn.",
  "input_format": "The first line contains a single integer t — the number of test cases. The description of the test cases follows.\nEach test case contains:\n- The first line contains a single integer n — the length of the array a.\n- The second line contains n integers a1, a2, ..., an — the elements of the array a.",
  "output_format": "For each test case, output a single integer — the number of points Allen will earn.",
  "test_case": "8\n4\n1 2 1 4\n3\n1 2 3\n5\n1 1 1 1 1\n6\n1 3 1 1 3 1\n6\n6 2 6 2 2 2\n6\n2 6 3 6 6 6\n10\n1 7 5 1 4 3 1 3 1 4\n1\n1",
  "answer": "2\n1\n2\n4\n4\n1\n2\n1",
  "solved": false
}
,
{
  "id": "p1600-2",
  "title": "Good Triples",
  "description": "Given a non-negative integer n, a triple of non-negative integers (a, b, c) is considered good if a + b + c = n and the sum of digits of a, b, and c adds up to the sum of digits of n. Count the number of such good triples where the order of (a, b, c) matters.",
  "input_format": "The first line contains an integer t — the number of test cases.\nEach of the next t lines contains a single integer n (0 ≤ n ≤ 10^7).",
  "output_format": "For each test case, output a single integer — the number of good triples for the given integer n.",
  "test_case": "12\n11\n0\n1\n2\n3\n4\n5\n3141\n999\n2718\n9999999\n10000000",
  "answer": "9\n1\n3\n6\n10\n15\n21\n1350\n166375\n29160\n1522435234375\n3",
  "solved": false
}
,
{
  "id": "p1600-3",
  "title": "Decreasing String",
  "description": "Given a string s1, construct a sequence of strings s1, s2, ..., sn where each si is formed by removing one character from si−1 such that si is lexicographically minimal. Then concatenate all the strings to form a single string S = s1 + s2 + ... + sn. For a given position pos, output the character at that position in S.",
  "input_format": "The first line contains one integer t — the number of test cases.\nEach test case consists of two lines:\n- First line: a string s1 consisting of lowercase Latin letters (1 ≤ |s1| ≤ 10^6).\n- Second line: an integer pos (1 ≤ pos ≤ |s1|⋅(|s1|+1)/2).\nThe sum of lengths of all strings over all test cases does not exceed 10^6.",
  "output_format": "For each test case, output the character at the given position pos in the concatenated string S. Print the answers consecutively (i.e., without spaces or newlines between them).",
  "test_case": "3\ncab\n6\nabcd\n9\nx\n1",
  "answer": "abx",
  "solved": false
}
,
{
  "id": "p1600-4",
  "title": "To Become Max",
  "description": "You are given an array of integers a of length n. In one operation, choose an index i such that 1 ≤ i ≤ n−1 and a[i] ≤ a[i+1], and increase a[i] by 1. Find the maximum possible value of max(a) that can be achieved after performing at most k such operations.",
  "input_format": "The first line contains a single integer t — the number of test cases.\nEach test case contains:\n- The first line has two integers n and k — the size of the array and the number of operations allowed.\n- The second line contains n integers a1, a2, ..., an — the elements of the array.",
  "output_format": "For each test case, output one integer — the maximum possible value of the array after at most k operations.",
  "test_case": "6\n3 4\n1 3 3\n5 6\n1 3 4 5 1\n4 13\n1 1 3 179\n5 3\n4 3 2 2 2\n5 6\n6 5 4 1 5\n2 17\n3 5",
  "answer": "4\n7\n179\n5\n7\n6",
  "solved": false
}
,
{
  "id": "p1600-5",
  "title": "Tracking Segments",
  "description": "You are given an array `a` of n zeros and m segments, each defined by [l_i, r_i]. A segment is called beautiful if the number of 1s in it becomes strictly greater than the number of 0s. You are also given q updates where each update sets `a[x] = 1`. Determine the first update after which at least one of the segments becomes beautiful, or output -1 if no segment ever becomes beautiful.",
  "input_format": "The first line contains a single integer t — the number of test cases.\nEach test case contains:\n- First line: two integers n and m — the size of array and number of segments.\n- Next m lines: each contains two integers l_i and r_i — the segment boundaries.\n- Next line: an integer q — the number of changes.\n- Next q lines: each contains an integer x — index to update to 1.\nIndices in queries are distinct.",
  "output_format": "For each test case, output one integer — the minimum change number after which at least one segment becomes beautiful, or -1 if it never happens.",
  "test_case": "6\n5 5\n1 2\n4 5\n1 5\n1 3\n2 4\n5\n5\n3\n1\n2\n4\n4 2\n1 1\n4 4\n2\n2\n3\n5 2\n1 5\n1 5\n4\n2\n1\n3\n4\n5 2\n1 5\n1 3\n5\n4\n1\n2\n3\n5\n5 5\n1 5\n1 5\n1 5\n1 5\n1 4\n3\n1\n4\n3\n3 2\n2 2\n1 3\n3\n2\n3\n1",
  "answer": "3\n-1\n3\n3\n-1\n2",
  "solved": false
}
,
{
  "id": "p16006",
  "title": "Round Dance",
  "description": "Each of n people at a festival remembers exactly one neighbor they danced with. Each round dance involves at least 2 people, each having two neighbors (except when only 2 people dance together). Given the remembered neighbors, determine the minimum and maximum number of round dances possible.",
  "input_format": "The first line contains a single integer t — the number of test cases.\nEach test case contains:\n- First line: an integer n — the number of people.\n- Second line: n integers a1, a2, ..., an — each ai is the neighbor person i remembers (1 ≤ ai ≤ n, ai ≠ i).",
  "output_format": "For each test case, output two integers — the minimum and maximum number of round dances possible.",
  "test_case": "10\n6\n2 1 4 3 6 5\n6\n2 3 1 5 6 4\n9\n2 3 2 5 6 5 8 9 8\n2\n2 1\n4\n4 3 2 1\n5\n2 3 4 5 1\n6\n5 3 4 1 1 2\n5\n3 5 4 1 2\n6\n6 3 2 5 4 3\n6\n5 1 4 3 4 2",
  "answer": "1 3\n2 2\n1 3\n1 1\n1 2\n1 1\n1 1\n2 2\n1 2\n1 1",
  "solved": false
}
,
{
  "id": "p16007",
  "title": "Hits Different",
  "description": "In a pyramid of 2023 rows, each can is numbered consecutively. When a can numbered n^2 is hit, all cans stacked directly on top of it fall as well. This includes the can n^2, and the ones directly above it, forming a vertical-like stack through the pyramid. Determine the sum of all fallen can numbers when a ball hits can n^2.",
  "input_format": "The first line contains an integer t — the number of test cases (1 ≤ t ≤ 1000).\nEach test case contains a single integer n (1 ≤ n ≤ 10^6) — meaning the can that is hit is numbered n^2.",
  "output_format": "For each test case, print one integer — the sum of numbers on all cans that fall.",
  "test_case": "10\n9\n1\n2\n3\n4\n5\n6\n10\n1434\n1000000",
  "answer": "156\n1\n5\n10\n21\n39\n46\n146\n63145186\n58116199242129511",
  "solved": false
}
,
{
  "id": "p1600-6",
  "title": "Shocking Arrangement",
  "description": "Given an array of integers where the sum of elements is zero, determine whether it's possible to rearrange the array such that the maximum absolute value of any subarray sum is strictly less than (maximum element − minimum element). If it's possible, output 'Yes' and any such permutation. Otherwise, output 'No'.",
  "input_format": "The first line contains an integer t (1 ≤ t ≤ 50000) — the number of test cases.\nEach test case contains:\n  - An integer n (1 ≤ n ≤ 300000) — the length of the array.\n  - A line of n integers a1, a2, ..., an (−10^9 ≤ ai ≤ 10^9), with the sum of all ai equal to zero.\nThe total sum of all n across test cases will not exceed 300000.",
  "output_format": "For each test case, print \"Yes\" followed by a valid permutation if one exists, otherwise print \"No\".",
  "test_case": "7\n4\n3 4 -2 -5\n5\n2 2 2 -3 -3\n8\n-3 -3 1 1 1 1 1 1\n3\n0 1 -1\n7\n-3 4 3 4 -4 -4 0\n1\n0\n7\n-18 13 -18 -17 12 15 13",
  "answer": "Yes\n-5 -2 3 4\nYes\n-3 2 -3 2 2\nYes\n1 1 1 -3 1 1 1 -3\nYes\n-1 0 1\nYes\n4 -4 4 -4 0 3 -3\nNo\nYes\n13 12 -18 15 -18 13 -17",
  "solved": false
}
,
{
  "id": "p1600-7",
  "title": "Flexible String",
  "description": "You are given two strings a and b of equal length n. You can apply an operation on string a any number of times: choose index i and a letter c, add ai to a set Q, and change ai to c. The set Q must contain at most k unique characters. Under this constraint, maximize the number of pairs (l, r) such that the substrings a[l, r] and b[l, r] are equal.",
  "input_format": "The first line contains an integer t (1 ≤ t ≤ 10^4) — the number of test cases.\nEach test case contains:\n- Two integers n and k (1 ≤ n ≤ 10^5, 0 ≤ k ≤ 10) — the length of the strings and the limit on distinct characters in set Q.\n- A string a of length n with at most 10 different lowercase English letters.\n- A string b of length n consisting of lowercase English letters.\nThe total sum of n over all test cases does not exceed 10^5.",
  "output_format": "For each test case, print a single integer — the maximum number of pairs (l, r) such that a[l, r] = b[l, r] and the transformation respects the Q set limit.",
  "test_case": "6\n3 1\nabc\nabd\n3 0\nabc\nabd\n3 1\nxbb\nxcd\n4 1\nabcd\naxcb\n3 10\nabc\nabd\n10 3\nlkwhbahuqa\nqoiujoncjb",
  "answer": "6\n3\n6\n6\n6\n11",
  "solved": false
}

    
  ]
};
