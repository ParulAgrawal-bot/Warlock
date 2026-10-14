export const QUESTION_BANK = [
  {
    id: 1, title: 'Two Sum', difficulty: 'Easy',
    description: 'Given an array of integers nums and a target, return the indices of two numbers that add up to target.',
    functionName: 'twoSum', starterCode: `function twoSum(nums, target) {\n  // Write your code here\n}`,
    cases: [
      { args: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { args: [[3, 2, 4], 6], expected: [1, 2] },
      { args: [[3, 3], 6], expected: [0, 1] },
      { args: [[-1, -2, -3, -4, -5], -8], expected: [2, 4] },
    ],
    optimal: (code) => /\b(Map|Map\s*\()/.test(code) && !/\.indexOf\s*\(/.test(code),
    optimalityHint: 'Use a hash map for O(n) time instead of scanning the array for every value.',
  },
  {
    id: 2, title: 'Reverse String', difficulty: 'Easy',
    description: 'Reverse the input array of characters in place. Do not return a new array.',
    functionName: 'reverseString', starterCode: `function reverseString(s) {\n  // Reverse s in place\n}`,
    cases: [
      { args: [['h', 'e', 'l', 'l', 'o']], expected: ['o', 'l', 'l', 'e', 'h'] },
      { args: [['H', 'a', 'n', 'n', 'a', 'h']], expected: ['h', 'a', 'n', 'n', 'a', 'H'] },
      { args: [['x']], expected: ['x'] },
      { args: [[]], expected: [] },
    ],
    optimal: (code) => !/\.reverse\s*\(/.test(code) && !/\bnew\s+Array\b/.test(code),
    optimalityHint: 'Swap elements from both ends in place for O(n) time and O(1) extra space.',
  },
  {
    id: 3, title: 'Palindrome Number', difficulty: 'Easy',
    description: 'Return true when an integer reads the same forward and backward; otherwise return false.',
    functionName: 'isPalindrome', starterCode: `function isPalindrome(x) {\n  // Write your code here\n}`,
    cases: [
      { args: [121], expected: true }, { args: [-121], expected: false },
      { args: [10], expected: false }, { args: [0], expected: true },
      { args: [12321], expected: true },
    ],
    optimal: (code) => !/\.split\s*\(/.test(code) || /%\s*10|Math\.floor/.test(code),
    optimalityHint: 'Avoid converting the number to a string; reverse digits or compare half the number.',
  },
];

export const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'python', label: 'Python' },
  { id: 'java', label: 'Java' },
  { id: 'cpp', label: 'C++' },
  { id: 'csharp', label: 'C#' },
];

export function starterFor(question, language) {
  const functionName = question.functionName;
  if (language === 'python') return `class Solution:\n    def ${functionName}(self, ${question.id === 1 ? 'nums, target' : question.id === 2 ? 's' : 'x'}):\n        # Write your code here\n        pass`;
  if (language === 'java') {
    const args = question.id === 1 ? 'int[] nums, int target' : question.id === 2 ? 'char[] s' : 'int x';
    const type = question.id === 2 ? 'void' : question.id === 3 ? 'boolean' : 'int[]';
    return `class Solution {\n    public ${type} ${functionName}(${args}) {\n        // Write your code here\n    }\n}`;
  }
  if (language === 'cpp') {
    const signature = question.id === 1 ? 'vector<int> twoSum(vector<int>& nums, int target)' : question.id === 2 ? 'void reverseString(vector<char>& s)' : 'bool isPalindrome(int x)';
    return `class Solution {\npublic:\n    ${signature} {\n        // Write your code here\n    }\n};`;
  }
  if (language === 'csharp') {
    const signature = question.id === 1 ? 'int[] TwoSum(int[] nums, int target)' : question.id === 2 ? 'void ReverseString(char[] s)' : 'bool IsPalindrome(int x)';
    return `public class Solution {\n    public ${signature} {\n        // Write your code here\n    }\n}`;
  }
  return question.starterCode;
}

export function efficiencyScore(question, code, language) {
  if (question.id === 1) {
    const mapPatterns = {
      javascript: /\bnew\s+Map\b/,
      python: /\{\s*[^{}]*\bfor\b|\bdict\s*\(/,
      java: /\bHashMap\b|\bMap\s*</,
      cpp: /\b(unordered_map|map)\s*</,
      csharp: /\bDictionary\s*</,
    };
    return mapPatterns[language].test(code) ? 100 : 80;
  }
  if (question.id === 3) return /%\s*10|Math\.floor|Integer\.toString|ToString\(|str\(/.test(code) ? 100 : 80;
  return /for\s*\([^;]+;[^;]*\*|\bwhile\s*\(/.test(code) ? 80 : 100;
}

function languageRuntime(language) {
  return ({ javascript: 'javascript', python: 'python', java: 'java', cpp: 'c++', csharp: 'c#' })[language];
}

function pythonLiteral(value) {
  return JSON.stringify(value).replace(/\btrue\b/g, 'True').replace(/\bfalse\b/g, 'False').replace(/\bnull\b/g, 'None');
}

function createProgram(question, code, language) {
  if (language === 'javascript') {
    return `${code}\nconst __solve = ${question.functionName};\nconst __cases = ${JSON.stringify(question.cases)};\nlet __passed = 0;\nfor (const {args, expected} of __cases) { const actual = __solve(...args) ?? args[0]; if (JSON.stringify(actual) === JSON.stringify(expected)) __passed++; }\nconsole.log('__WARLOCK_RESULT__' + __passed);`;
  }
  if (language === 'python') {
    const tests = question.cases.map(({ args, expected }) => `    args = ${pythonLiteral(args)}\n    actual = solution.${question.functionName}(*args)\n    actual = args[0] if actual is None else actual\n    passed += int(actual == ${pythonLiteral(expected)})`).join('\n');
    return `import json\n${code}\nsolution = Solution()\npassed = 0\n${tests}\nprint('__WARLOCK_RESULT__' + str(passed))`;
  }
  if (language === 'java') {
    const tests = question.cases.map(({ args, expected }) => {
      if (question.id === 1) return `        passed += Arrays.equals(solution.twoSum(new int[]{${args[0].join(',')}}, ${args[1]}), new int[]{${expected.join(',')}}) ? 1 : 0;`;
      if (question.id === 2) return `        { char[] input = "${args[0].join('')}".toCharArray(); solution.reverseString(input); passed += Arrays.equals(input, "${expected.join('')}".toCharArray()) ? 1 : 0; }`;
      return `        passed += solution.isPalindrome(${args[0]}) == ${expected} ? 1 : 0;`;
    }).join('\n');
    return `import java.util.*;\n${code}\npublic class Main { public static void main(String[] args) { Solution solution = new Solution(); int passed = 0;\n${tests}\nSystem.out.println("__WARLOCK_RESULT__" + passed); } }`;
  }
  if (language === 'cpp') {
    const tests = question.cases.map(({ args, expected }) => {
      if (question.id === 1) return `  { vector<int> input{${args[0].join(',')}}; passed += solution.twoSum(input, ${args[1]}) == vector<int>{${expected.join(',')}}; }`;
      if (question.id === 2) return `  { vector<char> input{${args[0].map((char) => `'${char}'`).join(',')}}; solution.reverseString(input); passed += input == vector<char>{${expected.map((char) => `'${char}'`).join(',')}}; }`;
      return `  passed += solution.isPalindrome(${args[0]}) == ${expected};`;
    }).join('\n');
    return `#include <bits/stdc++.h>\nusing namespace std;\n${code}\nint main() { Solution solution; int passed = 0;\n${tests}\ncout << "__WARLOCK_RESULT__" << passed << endl; }`;
  }
  const tests = question.cases.map(({ args, expected }) => {
    if (question.id === 1) return `        passed += solution.TwoSum(new int[] { ${args[0].join(',')} }, ${args[1]}).SequenceEqual(new int[] { ${expected.join(',')} }) ? 1 : 0;`;
    if (question.id === 2) return `        char[] input = "${args[0].join('')}".ToCharArray(); solution.ReverseString(input); passed += input.SequenceEqual("${expected.join('')}".ToCharArray()) ? 1 : 0;`;
    return `        passed += solution.IsPalindrome(${args[0]}) == ${expected.toString().toLowerCase()} ? 1 : 0;`;
  }).join('\n');
  return `using System;\nusing System.Linq;\n${code}\nclass Program { static void Main() { var solution = new Solution(); int passed = 0;\n${tests}\nConsole.WriteLine("__WARLOCK_RESULT__" + passed); } }`;
}

export async function runCasesWithPiston(question, code, language) {
  const endpoint = (import.meta.env.VITE_PISTON_URL || '/piston-api/execute').replace(/\/$/, '');
  let response;
  try {
    response = await fetch(endpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: languageRuntime(language), version: '*',
        files: [{ name: language === 'java' ? 'Main.java' : language === 'python' ? 'main.py' : language === 'cpp' ? 'main.cpp' : language === 'csharp' ? 'main.cs' : 'main.js', content: createProgram(question, code, language) }],
        run_timeout: 5000, compile_timeout: 10000,
      }),
    });
  } catch (error) {
    const localRunnerMissing = /localhost:2000|127\.0\.0\.1:2000|^\/piston-api\//.test(endpoint);
    return { error: localRunnerMissing
      ? `No code runner is listening at ${endpoint}. Start Piston with Docker, install its language runtimes, then retry. (${error.message})`
      : `Cannot reach the code runner at ${endpoint}. Check that Piston is running and allows requests from this app. (${error.message})` };
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) return { error: payload.message || `Code runner returned HTTP ${response.status}.` };
  const compileError = payload.compile && (payload.compile.stderr || payload.compile.output) && payload.compile.code !== 0;
  if (compileError) return { error: payload.compile.stderr || payload.compile.output || 'Compilation failed.' };
  const run = payload.run || {};
  if (run.code !== 0 || run.signal) return { error: run.stderr || run.output || 'The solution failed while running.' };
  const match = (run.stdout || '').match(/__WARLOCK_RESULT__(\d+)/);
  if (!match) return { error: run.stderr || 'The runner did not return a test result. Check the solution signature.' };
  return { passed: Number(match[1]), total: question.cases.length };
}

