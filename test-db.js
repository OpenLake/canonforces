const fs = require('fs');
const content = fs.readFileSync('./src/constants/problems.tsx', 'utf-8');
const match = content.match(/"test_case":\s*"([^"]+)"/g);
if (match) {
    console.log(match.slice(0, 3).join("\n"));
}
const test_case = "5\\n3 2\\n1 2 3\\n3 1\\n9 9 9\\n4 4\\n6 4 2 1\\n4 3\\n10 3 830 14\\n2 1\\n3 1";
console.log(test_case.split("\n"));
