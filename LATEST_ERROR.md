[Error [CompileError]: src/lib/stores.svelte.ts:2:0 Cannot export state from a module if it is reassigned. Either export a function returning the state value or only mutate the state value's properties
https://svelte.dev/e/state_invalid_export] {
  id: 'src/lib/stores.svelte.ts',
  frame: ' 1 |  import { PersistedState } from "runed";\n' +
    ' 2 |  export const screens = $state([]);\n' +
    '                                        ^\n' +
    ' 3 |  export const assets = $state([]);\n' +
    ' 4 |  export const online = new PersistedState("online", true);',
  code: 'state_invalid_export',
  loc: {
    file: 'Z:/Coding/webbuddy/webbuddy/frontend/src/lib/stores.svelte.ts',
    line: 38,
    column: 7
  },
  plugin: 'vite-plugin-svelte:compile-module',
  pluginCode: 'import { PersistedState } from "runed";\n' +
    'export const screens = $state([]);\n' +
    'export const assets = $state([]);\n' +
    'export const online = new PersistedState("online", true);\n' +
    'export const selected = $state(null);\n' +
    'const _screensById = $derived(new Map(screens.map((sc) => [sc.id, sc])));\n' +
    'export const screensById = () => _screensById;\n' +
    'const _assetsByScreen = $derived.by(() => {\n' +
    '  const map = /* @__PURE__ */ new Map();\n' +
    '  for (const a of assets) {\n' +
    '    const arr = map.get(a.screen_id) || [];\n' +
    '    arr.push(a);\n' +
    '    map.set(a.screen_id, arr);\n' +
    '  }\n' +
    '  for (const [k, arr] of map) arr.sort((a, b) => a.z_index - b.z_index);\n' +
    '  return map;\n' +
    '});\n' +
    'export const assetsByScreen = () => _assetsByScreen;\n' +
    'export function upsertAsset(a) {\n' +
    '  const idx = assets.findIndex((x) => x.id === a.id);\n' +
    '  if (idx >= 0) assets[idx] = a;\n' +
    '  else assets.push(a);\n' +
    '}\n' +
    'export function removeAsset(id) {\n' +
    '  const idx = assets.findIndex((a) => a.id === id);\n' +
    '  if (idx >= 0) assets.splice(idx, 1);\n' +
    '}\n' +
    'export function setScreens(list) {\n' +
    '  screens = list;\n' +
    '}\n' +
    'export function upsertScreen(s) {\n' +
    '  const idx = screens.findIndex((x) => x.id === s.id);\n' +
    '  if (idx >= 0) screens[idx] = s;\n' +
    '  else screens.push(s);\n' +
    '}\n' +
    'export function removeScreen(id) {\n' +
    '  const idx = screens.findIndex((s) => s.id === id);\n' +
    '  if (idx >= 0) screens.splice(idx, 1);\n' +
    '}\n' +
    'export function getScreen(id) {\n' +
    '  return screens.find((s) => s.id === id);\n' +
    '}\n' +
    'export function getAsset(id) {\n' +
    '  return assets.find((a) => a.id === id);\n' +
    '}\n',
  runnerError: Error: RunnerError
      at reviveInvokeError (file:///Z:/Coding/webbuddy/webbuddy/frontend/node_modules/vite/dist/node/module-runner.js:474:64)
      at Object.invoke (file:///Z:/Coding/webbuddy/webbuddy/frontend/node_modules/vite/dist/node/module-runner.js:547:11)
      at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
      at async SSRCompatModuleRunner.getModuleInformation (file:///Z:/Coding/webbuddy/webbuddy/frontend/node_modules/vite/dist/node/module-runner.js:1057:7)
      at async request (file:///Z:/Coding/webbuddy/webbuddy/frontend/node_modules/vite/dist/node/module-runner.js:1074:83)
      at async eval (Z:/Coding/webbuddy/webbuddy/frontend/src/lib/components/Toolbar.svelte:11:31)
      at async ESModulesEvaluator.runInlinedModule (file:///Z:/Coding/webbuddy/webbuddy/frontend/node_modules/vite/dist/node/module-runner.js:908:3)
      at async SSRCompatModuleRunner.directRequest (file:///Z:/Coding/webbuddy/webbuddy/frontend/node_modules/vite/dist/node/module-runner.js:1117:59)
      at async SSRCompatModuleRunner.directRequest (file:///Z:/Coding/webbuddy/webbuddy/frontend/node_modules/vite/dist/node/chunks/dep-eRCq8YxU.js:18993:22)
      at async SSRCompatModuleRunner.cachedRequest (file:///Z:/Coding/webbuddy/webbuddy/frontend/node_modules/vite/dist/node/module-runner.js:1035:73)
}
