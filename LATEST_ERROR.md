runnerError: Error: RunnerError
      at reviveInvokeError (file:///Z:/Coding/webbuddy/webbuddy/frontend/node_modules/vite/dist/node/module-runner.js:474:64)
      at Object.invoke (file:///Z:/Coding/webbuddy/webbuddy/frontend/node_modules/vite/dist/node/module-runner.js:547:11)
      at async SSRCompatModuleRunner.getModuleInformation (file:///Z:/Coding/webbuddy/webbuddy/frontend/node_modules/vite/dist/node/module-runner.js:1057:7)
      at async request (file:///Z:/Coding/webbuddy/webbuddy/frontend/node_modules/vite/dist/node/module-runner.js:1074:83)
      at async eval (Z:/Coding/webbuddy/webbuddy/frontend/src/routes/+layout.svelte:5:31)
      at async ESModulesEvaluator.runInlinedModule (file:///Z:/Coding/webbuddy/webbuddy/frontend/node_modules/vite/dist/node/module-runner.js:908:3)
      at async SSRCompatModuleRunner.directRequest (file:///Z:/Coding/webbuddy/webbuddy/frontend/node_modules/vite/dist/node/module-runner.js:1117:59)
      at async SSRCompatModuleRunner.directRequest (file:///Z:/Coding/webbuddy/webbuddy/frontend/node_modules/vite/dist/node/chunks/dep-eRCq8YxU.js:18993:22)
      at async SSRCompatModuleRunner.cachedRequest (file:///Z:/Coding/webbuddy/webbuddy/frontend/node_modules/vite/dist/node/module-runner.js:1035:73)
      at async SSRCompatModuleRunner.import (file:///Z:/Coding/webbuddy/webbuddy/frontend/node_modules/vite/dist/node/module-runner.js:995:10)
}
Not found: /favicon.ico
TypeError [ERR_UNKNOWN_FILE_EXTENSION]: Unknown file extension ".css" for Z:\Coding\webbuddy\webbuddy\frontend\node_modules\tw-animate-css\dist\tw-animate.css
    at Object.getFileProtocolModuleFormat [as file:] (node:internal/modules/esm/get_format:183:9)     
    at defaultGetFormat (node:internal/modules/esm/get_format:209:36)
    at defaultLoad (node:internal/modules/esm/load:119:22)
    at async nextLoad (node:internal/modules/esm/hooks:748:22)
    at async Hooks.load (node:internal/modules/esm/hooks:385:20)
    at async handleMessage (node:internal/modules/esm/worker:199:18) {
  code: 'ERR_UNKNOWN_FILE_EXTENSION',
  plugin: '@tailwindcss/vite:generate:serve',
  id: 'Z:/Coding/webbuddy/webbuddy/frontend/src/app.css',
  pluginCode: '/* Tailwind v4 entry: import Tailwind so utilities (e.g., py-4) are available for @apply */\n' +
    '@import "tailwindcss";\n' +
    '\n' +
    '/* Optional: Tailwind plugins via CSS (v4 style) */\n' +
    '@plugin "tw-animate-css";\n' +
    '@plugin "daisyui";\n' +
    '\n' +
    '/* Custom dark variant helper (kept for compatibility with existing selectors) */\n' +
    '@custom-variant dark (&:is(.dark *));\n' +
    '\n' +
    '/* Use DaisyUI without inline JSON config (which breaks the CSS parse
