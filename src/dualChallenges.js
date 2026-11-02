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
];

export function starterFor(question) {
  return question.starterCode;
}

export function efficiencyScore(question, code) {
  if (question.id === 1) return /\bnew\s+Map\b/.test(code) ? 100 : 80;
  if (question.id === 3) return /%\s*10|Math\.floor/.test(code) ? 100 : 80;
  return /for\s*\([^;]+;[^;]*\*|\bwhile\s*\(/.test(code) ? 80 : 100;
}

export function runCasesLocally(question, code, language) {
  if (language !== 'javascript') return Promise.resolve({ error: 'Only JavaScript evaluation is available.' });
  return new Promise((resolve) => {
    let worker;
    try {
      worker = new Worker(new URL('./codeRunner.worker.js', import.meta.url), { type: 'module' });
    } catch (error) {
      resolve({ error: error.message || 'Could not start the code evaluator.' });
      return;
    }
    const timeout = setTimeout(() => {
      worker.terminate();
      resolve({ error: 'Execution timed out. Check for an infinite loop and try again.' });
    }, 2000);
    worker.onmessage = ({ data }) => {
      clearTimeout(timeout);
      worker.terminate();
      resolve(data);
    };
    worker.onerror = (event) => {
      clearTimeout(timeout);
      worker.terminate();
      resolve({ error: event.message || 'Could not run this JavaScript solution.' });
    };
    worker.postMessage({ functionName: question.functionName, cases: question.cases, code });
  });
}
