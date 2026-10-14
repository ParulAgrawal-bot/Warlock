const baseUrl = (process.env.PISTON_API_URL || 'http://127.0.0.1:2000').replace(/\/$/, '');
const packages = ['javascript', 'python', 'java', 'c++', 'csharp'];
const aliases = {
  javascript: ['javascript', 'js', 'node'],
  python: ['python', 'py'],
  java: ['java'],
  'c++': ['c++', 'cpp'],
  csharp: ['csharp', 'c#', 'csharp.net'],
};

async function request(path, init) {
  const response = await fetch(`${baseUrl}${path}`, init);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || `Piston returned HTTP ${response.status} for ${path}`);
  }
  return payload;
}

async function waitForPiston() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      return await request('/api/v2/runtimes');
    } catch (error) {
      if (attempt === 59) {
        throw new Error(`Piston did not become ready at ${baseUrl}. Check that Docker Desktop is running. ${error.message}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

let runtimes = await waitForPiston();
for (const language of packages) {
  const acceptedNames = aliases[language];
  const installed = runtimes.some((runtime) =>
    [runtime.language, ...(runtime.aliases || [])]
      .some((name) => acceptedNames.includes(String(name).toLowerCase())),
  );
  if (installed) {
    console.log(`${language}: already installed`);
    continue;
  }

  console.log(`${language}: installing latest runtime (this can take a few minutes)`);
  await request('/api/v2/packages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language, version: '*' }),
  });
  runtimes = await request('/api/v2/runtimes');
}

console.log('Piston is ready. Installed runtimes:');
for (const runtime of runtimes) {
  console.log(`- ${runtime.language} ${runtime.version}`);
}
