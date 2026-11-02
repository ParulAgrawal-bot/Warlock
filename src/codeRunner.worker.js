self.onmessage = ({ data }) => {
  const { functionName, cases, code } = data;
  try {
    const solve = new Function(`${code}\n; return ${functionName};`)();
    if (typeof solve !== 'function') throw new Error(`Define a function named ${functionName}.`);

    let passed = 0;
    for (const { args, expected } of cases) {
      const input = structuredClone(args);
      const actual = solve(...input) ?? input[0];
      if (JSON.stringify(actual) === JSON.stringify(expected)) passed += 1;
    }
    self.postMessage({ passed, total: cases.length });
  } catch (error) {
    self.postMessage({ error: error instanceof Error ? error.message : 'The solution could not be evaluated.' });
  }
};
