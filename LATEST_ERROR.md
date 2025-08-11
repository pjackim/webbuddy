
1:47:34 AM [vite] (ssr) Error when evaluating SSR module /src/routes/demo/error-panel/+page.svelte: Z:/Coding/webbuddy/webbuddy/frontend/src/routes/demo/error-panel/+page.svelte:162:4 `</code>` attempted to close an element that was not open
https://svelte.dev/e/element_invalid_closing_tag
  Plugin: vite-plugin-svelte:compile
  File: Z:/Coding/webbuddy/webbuddy/frontend/src/routes/demo/error-panel/+page.svelte:162:4
   160 |    </div>
   161 |  </div>
   162 |  />`}</code></pre>
              ^
   163 |    </div>
 (x2)4 |  </div>
[Error [CompileError]: Z:/Coding/webbuddy/webbuddy/frontend/src/routes/demo/error-panel/+page.svelte:162:4 `</code>` attempted to close an element that was not open
https://svelte.dev/e/element_invalid_closing_tag] {
  id: 'Z:/Coding/webbuddy/webbuddy/frontend/src/routes/demo/error-panel/+page.svelte',
  frame: ' 160 |    </div>\r\n' +
    ' 161 |  </div>\r\n' +
    ' 162 |  />`}</code></pre>\r\n' +
    '            ^\n' +
    ' 163 |    </div>\r\n' +
    ' 164 |  </div>\r',
  code: 'element_invalid_closing_tag',
  loc: { file: '+page.svelte', line: 162, column: 4 },
  plugin: 'vite-plugin-svelte:compile',
  pluginCode: '<script lang="ts">\r\n' +
    "\timport ErrorPanel from '$lib/components/ErrorPanelComplete.svelte';\r\n" +
    '\r\n' +
    '\t// Function to generate a real JavaScript error with stack trace\r\n' +
    '\tfunction generateTestError() {\r\n' +
    '\t\ttry {\r\n' +
    '\t\t\t// Create a nested function call to generate a meaningful stack trace\r\n' +
    '\t\t\tfunction deepFunction() {\r\n' +
    '\t\t\t\tfunction nestedFunction() {\r\n' +
    "\t\t\t\t\tthrow new Error('Test error with real stack trace');\r\n" +
    '\t\t\t\t}\r\n' +
    '\t\t\t\treturn nestedFunction();\r\n' +
    '\t\t\t}\r\n' +
    '\t\t\treturn deepFunction();\r\n' +
    '\t\t} catch (error) {\r\n' +
    '\t\t\treturn error;\r\n' +
    '\t\t}\r\n' +
    '\t}\r\n' +
    '\r\n' +
    '\t// Example error messages and logs\r\n' +
    '\tconst examples = [\r\n' +
    '\t\t{\r\n' +
    '\t\t\tcode: 500,\r\n' +
    "\t\t\tmessage: `const result = await fetch('/api/users');\r\n" +
    'if (!result.ok) {\r\n' +
    "\tthrow new Error('Failed to fetch users');\r\n" +
    '}`,\r\n' +
    '\t\t\tdetails: `Stack trace:\r\n' +
    'Error: Failed to fetch users\r\n' +
    '    at fetchUsers (src/api/users.ts:12:3)\r\n' +
    '    at async UserList.svelte:23:18\r\n' +
    '    at async Promise.all (index 0)\r\n' +
    '\r\n' +
    'Request Details:\r\n' +
    '- URL: /api/users\r\n' +
    '- Method: GET\r\n' +
    '- Status: 500\r\n' +
    '- Timestamp: 2024-01-15T10:30:45.123Z`,\r\n' +
    "\t\t\tlanguage: 'typescript' as const\r\n" +
    '\t\t},\r\n' +
    '\t\t{\r\n' +
    '\t\t\tcode: 404,\r\n' +
    '\t\t\tmessage: `Route not found: /api/nonexistent-endpoint\r\n' +
    '\r\n' +
    'Available routes:\r\n' +
    '- GET /api/users\r\n' +
    '- POST /api/users\r\n' +
    '- GET /api/screens\r\n' +
    '- POST /api/screens`,\r\n' +
    "\t\t\tlanguage: 'bash' as const\r\n" +
    '\t\t},\r\n' +
    '\t\t{\r\n' +
    '\t\t\tcode: 403,\r\n' +
    '\t\t\tmessage: `{\r\n' +
    '  "error": "Forbidden",\r\n' +
    `  "message": "You don't have permission to access this resource",\r\n` +
    '  "code": 403,\r\n' +
    '  "timestamp": "2024-01-15T10:30:45.123Z",\r\n' +
    '  "path": "/api/admin/users"\r\n' +
    '}`,\r\n' +
    "\t\t\tlanguage: 'json' as const\r\n" +
    '\t\t},\r\n' +
    '\t\t{\r\n' +
    "\t\t\tcode: 'JS',\r\n" +
    '\t\t\tmessage: generateTestError(),\r\n' +
    "\t\t\tdetails: 'This is a real JavaScript error with an actual stack trace generated at runtime.',\r\n" +
    "\t\t\tlanguage: 'javascript' as const\r\n" +
    '\t\t}\r\n' +
    '\t];\r\n' +
    '\r\n' +
    '\tlet currentExample = $state(0);\r\n' +
    '\r\n' +
    '\t// Function to simulate different types of errors\r\n' +
    '\tfunction triggerError() {\r\n' +
    '\t\ttry {\r\n' +
    '\t\t\t// Simulate a fetch error\r\n' +
    "\t\t\tthrow new TypeError('Failed to fetch: Network error');\r\n" +
    '\t\t} catch (error) {\r\n' +
    '\t\t\t// Add this error as a new example\r\n' +
    '\t\t\tconst newExample = {\r\n' +
    "\t\t\t\tcode: 'LIVE',\r\n" +
    '\t\t\t\tmessage: error,\r\n' +
    "\t\t\t\tdetails: 'This error was just generated dynamically when you clicked the button!',\r\n" +
    "\t\t\t\tlanguage: 'javascript' as const\r\n" +
    '\t\t\t};\r\n' +
    '\t\t\texamples.push(newExample);\r\n' +
    '\t\t\tcurrentExample = examples.length - 1;\r\n' +
    '\t\t}\r\n' +
    '\t}\r\n' +
    '</script>\r\n' +
    '\r\n' +
    '<svelte:head>\r\n' +
    '\t<title>Error Panel Demo</title>\r\n' +
    '</svelte:head>\r\n' +
    '\r\n' +
    '<div class="container mx-auto p-8">\r\n' +
    '\t<h1 class="text-3xl font-bold mb-8">ErrorPanel Component Demo</h1>\r\n' +
    '\t\r\n' +
    '\t<!-- Example Selector -->\r\n' +
    '\t<div class="mb-8">\r\n' +
    '\t\t<h2 class="text-xl font-semibold mb-4">Examples:</h2>\r\n' +
    '\t\t<div class="flex gap-4 flex-wrap">\r\n' +
    '\t\t\t{#each examples as example, i}\r\n' +
    '\t\t\t\t<button\r\n' +
    `\t\t\t\t\tclass="px-4 py-2 rounded-lg {i === currentExample ? 'bg-primary text-primary-foreground' : 'bg-muted'}"\r\n` +
    '\t\t\t\t\ton:click={() => currentExample = i}\r\n' +
    '\t\t\t\t>\r\n' +
    '\t\t\t\t\t{example.code} Error\r\n' +
    '\t\t\t\t</button>\r\n' +
    '\t\t\t{/each}\r\n' +
    '\t\t\t<button\r\n' +
    '\t\t\t\tclass="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white"\r\n' +
    '\t\t\t\ton:click={triggerError}\r\n' +
    '\t\t\t>\r\n' +
    '\t\t\t\tGenerate Live Error\r\n' +
    '\t\t\t</button>\r\n' +
    '\t\t</div>\r\n' +
    '\t</div>\r\n' +
    '\r\n' +
    '\t<!-- Current Example Display -->\r\n' +
    '\t{#key currentExample}\r\n' +
    '\t\t<ErrorPanel\r\n' +
    '\t\t\terrorCode={examples[currentExample].code}\r\n' +
    '\t\t\terrorMessage={examples[currentExample].message}\r\n' +
    '\t\t\terrorDetails={examples[currentExample].details}\r\n' +
    '\t\t\tlanguage={examples[currentExample].language}\r\n' +
    '\t\t/>\r\n' +
    '\t{/key}\r\n' +
    '\r\n' +
    '\t<!-- Usage Documentation -->\r\n' +
    '\t<div class="mt-16 prose dark:prose-invert max-w-none">\r\n' +
    '\t\t<h2>Usage</h2>\r\n' +
    '\t\t<p>The ErrorPanel component is flexible and reusable. Here are the available props:</p>\r\n' +
    '\t\t\r\n' +
    '\t\t<h3>Props</h3>\r\n' +
    '\t\t<ul>\r\n' +
    '\t\t\t<li><code>errorCode</code> (required): The error code (e.g., 500, 404, 403)</li>\r\n' +
    '\t\t\t<li><code>errorMessage</code> (required): The error message or logs to display</li>\r\n' +
    '\t\t\t<li><code>errorDetails</code> (optional): Additional error details or stack trace</li>\r\n' +
    "\t\t\t<li><code>language</code> (optional): Language for syntax highlighting (default: 'typescript')</li>\r\n" +
    '\t\t\t<li><code>showCopyButton</code> (optional): Whether to show the copy button (default: true)</li>\r\n' +
    '\t\t\t<li><code>startCollapsed</code> (optional): Whether to start collapsed (default: true)</li>\r\n' +
    '\t\t\t<li><code>title</code> (optional): Custom title instead of auto-generated title</li>\r\n' +
    '\t\t\t<li><code>class</code> (optional): Additional CSS classes</li>\r\n' +
    '\t\t</ul>\r\n' +
    '\r\n' +
    '\t\t<h3>Example Usage</h3>\r\n' +
    '\t\t<pre><code>{`<script>\r\n' +
    "\timport ErrorPanel from '$lib/components/ErrorPanelComplete.svelte';\r\n" +
    '</script>\r\n' +
    '\r\n' +
    '<ErrorPanel\r\n' +
    '\terrorCode={500}\r\n' +
    '\terrorMessage={\\`Database connection failed\r\n' +
    '\r\n' +
    'Details:\r\n' +
    'Connection timeout after 30 seconds...\\`}\r\n' +
    '\tlanguage="typescript"\r\n' +
    '/>`}</code></pre>\r\n' +
    '\t</div>\r\n' +
    '</div>\r\n' +
    '/>`}</code></pre>\r\n' +
    '\t</div>\r\n' +
    '</div>\r\n',
  runnerError: Error: RunnerError
      at reviveInvokeError (file:///Z:/Coding/webbuddy/webbuddy/frontend/node_modules/vite/dist/node/module-runner.js:474:64)
      at Object.invoke (file:///Z:/Coding/webbuddy/webbuddy/frontend/node_modules/vite/dist/node/module-runner.js:547:11)
      at async SSRCompatModuleRunner.getModuleInformation (file:///Z:/Coding/webbuddy/webbuddy/frontend/node_modules/vite/dist/node/module-runner.js:1057:7)
      at async SSRCompatModuleRunner.import (file:///Z:/Coding/webbuddy/webbuddy/frontend/node_modules/vite/dist/node/module-runner.js:994:23)
      at async instantiateModule (file:///Z:/Coding/webbuddy/webbuddy/frontend/node_modules/vite/dist/node/chunks/dep-eRCq8YxU.js:18966:10)
      at async loud_ssr_load_module (file:///Z:/Coding/webbuddy/webbuddy/frontend/node_modules/@sveltejs/kit/src/exports/vite/dev/index.js:70:11)
      at async resolve (file:///Z:/Coding/webbuddy/webbuddy/frontend/node_modules/@sveltejs/kit/src/exports/vite/dev/index.js:97:18)      at async result.component (file:///Z:/Coding/webbuddy/webbuddy/frontend/node_modules/@sveltejs/kit/src/exports/vite/dev/index.js:206:41)
      at async Promise.all (index 1)
      at async render_response (Z:/Coding/webbuddy/webbuddy/frontend/node_modules/@sveltejs/kit/src/runtime/server/page/render.js:98:21)
}
