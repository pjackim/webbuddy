
```log
9:44:18 PM [vite] (ssr) Error when evaluating SSR module /src/routes/+page.svelte: src/routes/+page.svelte:48:1 'ondragover|preventDefault' is not a valid attribute name
https://svelte.dev/e/attribute_invalid_name
  Plugin: vite-plugin-svelte:compile
  File: src/routes/+page.svelte:48:1
   46 |    class="flex flex-col h-screen"
   47 |    role="group"
   48 |    ondragover|preventDefault={() => (hover = true)}
                                                           ^
   49 |    ondragleave={() => (hover = false)}
   50 |    ondrop={onDrop} (x9)
[Error [CompileError]: src/routes/+page.svelte:48:1 'ondragover|preventDefault' is not a valid attribute name
https://svelte.dev/e/attribute_invalid_name] {
  id: 'src/routes/+page.svelte',
  frame: ' 46 |    class="flex flex-col h-screen"\n' +
    ' 47 |    role="group"\n' +
    ' 48 |    ondragover|preventDefault={() => (hover = true)}\n' +
    '                                                         ^\n' +
    ' 49 |    ondragleave={() => (hover = false)}\n' +
    ' 50 |    ondrop={onDrop}',
  code: 'attribute_invalid_name',
  loc: { file: '+page.svelte', line: 48, column: 1 },
  plugin: 'vite-plugin-svelte:compile',
  pluginCode: '<script lang="ts">\n' +
    "\timport Toolbar from '../lib/components/Toolbar.svelte';\n" +
    "\timport Canvas from '../lib/components/Canvas.svelte';\n" +
    "\timport * as Card from '$lib/components/ui/card/index.js';\n" +
    "\timport { api, uploadFile } from '../lib/api';\n" +
    "\timport { online, upsertAsset, screens, type Asset } from '$lib/stores.svelte.ts';\n" +
    "\timport { toast } from 'svelte-sonner';\n" +
    '\n' +
    '\tlet hover = $state(false);\n' +
    '\n' +
    '\tasync function onDrop(e: DragEvent) {\n' +
    '\t\te.preventDefault();\n' +
    '\t\thover = false;\n' +
    '\t\tif (!online.current) {\n' +
    "\t\t\ttoast.error('You must be online to upload files.');\n" +
    '\t\t\treturn;\n' +
    '\t\t}\n' +
    '\t\tconst files = e.dataTransfer?.files;\n' +
    '\t\tif (!files) return;\n' +
    '\n' +
    '\t\tfor (const file of Array.from(files)) {\n' +
    '\t\t\tconst toastId = toast.loading(`Uploading ${file.name}...`);\n' +
    '\t\t\ttry {\n' +
    '\t\t\t\t// Upload to backend to get a URL\n' +
    '\t\t\t\tconst { url } = await uploadFile(file);\n' +
    '\t\t\t\t// Place on the first screen by default at (50,50)\n' +
    '\t\t\t\tconst sc = screens[0];\n' +
    '\t\t\t\tif (!sc) {\n' +
    "\t\t\t\t\ttoast.error('No screen available to place the asset.', { id: toastId });\n" +
    '\t\t\t\t\tcontinue;\n' +
    '\t\t\t\t}\n' +
    "\t\t\t\tconst asset = await api<Asset>('/assets', {\n" +
    "\t\t\t\t\tmethod: 'POST',\n" +
    "\t\t\t\t\tbody: JSON.stringify({ type: 'image', screen_id: sc.id, x: 50, y: 50, src: url })\n" +
    '\t\t\t\t});\n' +
    '\t\t\t\tupsertAsset(asset);\n' +
    '\t\t\t\ttoast.success(`Successfully uploaded ${file.name}!`, { id: toastId });\n' +
    '\t\t\t} catch (error) {\n' +
    '\t\t\t\ttoast.error(`Failed to upload ${file.name}.`, { id: toastId });\n' +
    '\t\t\t}\n' +
    '\t\t}\n' +
    '\t}\n' +
    '</script>\n' +
    '\n' +
    '<div\n' +
    '\tclass="flex flex-col h-screen"\n' +
    '\trole="group"\n' +
    '\tondragover|preventDefault={() => (hover = true)}\n' +
    '\tondragleave={() => (hover = false)}\n' +
    '\tondrop={onDrop}\n' +
    '>\n' +
    '\t<Toolbar />\n' +
    '\t<div class="relative flex-1">\n' +
    '\t\t{#if hover}\n' +
    '\t\t\t<div class="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">\n' +
    '\t\t\t\t<Card.Root class="w-1/2 h-1/2 border-4 border-dashed border-primary flex items-center justify-center">\n' +
    '\t\t\t\t\t<Card.Content class="text-center">\n' +
    '\t\t\t\t\t\t<h2 class="text-2xl font-bold">Drop files to upload</h2>\n' +
    '\t\t\t\t\t</Card.Content>\n' +
    '\t\t\t\t</Card.Root>\n' +
    '\t\t\t</div>\n' +
    '\t\t{/if}\n' +
    '\t\t<Canvas />\n' +
    '\t</div>\n' +
    '</div>',
  runnerError: Error: RunnerError
      at reviveInvokeError (file:///Z:/Coding/webbuddy/webbuddy/frontend/node_modules/vite/dist/node/module-runner.js:474:64)
      at Object.invoke (file:///Z:/Coding/webbuddy/webbuddy/frontend/node_modules/vite/dist/node/module-runner.js:547:11)
      at async SSRCompatModuleRunner.getModuleInformation (file:///Z:/Coding/webbuddy/webbuddy/frontend/node_modules/vite/dist/node/module-runner.js:1057:7)
      at async SSRCompatModuleRunner.import (file:///Z:/Coding/webbuddy/webbuddy/frontend/node_modules/vite/dist/node/module-runner.js:994:23)
      at async instantiateModule (file:///Z:/Coding/webbuddy/webbuddy/frontend/node_modules/vite/dist/node/chunks/dep-eRCq8YxU.js:18966:10)
      at async loud_ssr_load_module (file:///Z:/Coding/webbuddy/webbuddy/frontend/node_modules/@sveltejs/kit/src/exports/vite/dev/index.js:70:11)
      at async resolve (file:///Z:/Coding/webbuddy/webbuddy/frontend/node_modules/@sveltejs/kit/src/exports/vite/dev/index.js:97:18)
      at async result.component (file:///Z:/Coding/webbuddy/webbuddy/frontend/node_modules/@sveltejs/kit/src/exports/vite/dev/index.js:206:41)
      at async Promise.all (index 1)
      at async render_response (Z:/Coding/webbuddy/webbuddy/frontend/node_modules/@sveltejs/kit/src/runtime/server/page/render.js:98:21)
```
