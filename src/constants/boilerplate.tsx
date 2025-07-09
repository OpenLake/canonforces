// constants.js

// Language versions (for display or reference)
export const LANGUAGE_VERSIONS = {
  javascript: "18.15.0",    // Node.js (Judge0: 18.15.0)
  typescript: "5.0.3",      // (Judge0: 5.0.3)
  python: "3.10.0",         // (Judge0: 3.10.0)
  java: "15.0.2",           // (Judge0: 15.0.2)
  csharp: "6.12.0",         // Mono (Judge0: 6.12.0)
  php: "8.2.3",             // (Judge0: 8.2.3)
  cpp: "9.2.0",             // GCC (Judge0: 9.2.0)
};

// Judge0 language IDs for API execution
export const LANGUAGE_IDS = {
  javascript: 63, // Node.js 18.15.0
  typescript: 74, // TypeScript 5.0.3
  python: 71,     // Python 3.10.0
  java: 91,       // Java 15.0.2 (use 62 for 13.0.1 if needed)
  csharp: 51,     // Mono 6.12.0
  cpp: 54,        // GCC 9.2.0
  php: 68,        // PHP 8.2.3 (use 68 for 7.4.1 if needed)
};

// Boilerplate code snippets for each language
export const CODE_SNIPPETS = {
  javascript: `
function greet(name) {
  console.log("Hello, " + name + "!");
}

greet("CanonForces");
`.trim(),

  typescript: `
type Params = {
  name: string;
};

function greet(data: Params) {
  console.log("Hello, " + data.name + "!");
}

greet({ name: "CanonForces" });
`.trim(),

  python: `
def greet(name):
    print("Hello, " + name + "!")

greet("CanonForces")
`.trim(),

  java: `
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello,CanonForces!");
    }
}
`.trim(),

  csharp: `
using System;

namespace HelloWorld
{
    class Hello { 
        static void Main(string[] args) {
            Console.WriteLine("Hello, CanonForces!");
        }
    }
}
`.trim(),

  php: `
<?php

$name = "CanonForces";
echo "Hello, " . $name . "!";
`.trim(),

  cpp: `
#include <iostream>
using namespace std;

void greet(string name) {
    cout << "Hello, " << name << "!" << endl;
}

int main() {
    greet("CanonForces");
    return 0;
}
`.trim(),
};

// (Optional) Default export for convenience
export default {
  LANGUAGE_VERSIONS,
  LANGUAGE_IDS,
  CODE_SNIPPETS,
};
