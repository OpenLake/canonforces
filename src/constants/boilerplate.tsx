// constants.js

export const LANGUAGE_VERSIONS = {
  'javascript': "18.15.0",
  'typescript': "5.0.3",
  'python': "3.10.0",
  'java': "15.0.2",
  'csharp': "6.12.0",
  'php': "8.2.3",
  'cpp': "9.2.0",
};

// Judge0 language IDs for API execution
export const LANGUAGE_IDS = {
  'javascript': 63,  // Node.js
  'typescript': 74,  // TypeScript
  'python': 71,      // Python 3.8.1
  'java': 62,        // Java (OpenJDK 13.0.1)
  'csharp': 51,      // C# (Mono 6.6.0.161)
  'cpp': 54,         // C++ (GCC 9.2.0)
  'php': 68,         // PHP 7.4.1
};


export const CODE_SNIPPETS = {
  'javascript': `\nfunction greet(name) {\n\tconsole.log("Hello, " + name + "!");\n}\n\ngreet("Aviral");\n`,
  'typescript': `\ntype Params = {\n\tname: string;\n}\n\nfunction greet(data: Params) {\n\tconsole.log("Hello, " + data.name + "!");\n}\n\ngreet({ name: "Aviral" });\n`,
  'python': `\ndef greet(name):\n\tprint("Hello, " + name + "!")\n\ngreet("Aviral")\n`,
  'java': `\npublic class HelloWorld {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hello World");\n\t}\n}\n`,
  'csharp':
    'using System;\n\nnamespace HelloWorld\n{\n\tclass Hello { \n\t\tstatic void Main(string[] args) {\n\t\t\tConsole.WriteLine("Hello World in C#");\n\t\t}\n\t}\n}\n',
  'php': "<?php\n\n$name = 'Aviral';\necho $name;\n",
};
