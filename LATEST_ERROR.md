[Kapture] Console listener attached
(index):1 Access to fetch at 'http://localhost:8000/api/screens' from origin 'http://localhost:5173' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.

error-store.svelte.ts:181 
 GET http://localhost:8000/api/screens net::ERR_FAILED
safeFetch	@	error-store.svelte.ts:181
api	@	api.ts:9
load	@	Canvas.svelte:20
(anonymous)	@	Canvas.svelte:57
await in start		
(anonymous)	@	(index):5085
Promise.then		
(anonymous)	@	(index):5084
console-listener.js:71 Application Error: 
{code: 'NETWORK', message: 'Network connection failed', details: 'Unable to connect to the server. Please check your internet connection.', timestamp: Mon Aug 11 2025 02:20:19 GMT-0400 (Eastern Daylight Time), url: 'http://localhost:8000/api/screens', …}
code
: 
"NETWORK"
details
: 
"Unable to connect to the server. Please check your internet connection."
message
: 
"Network connection failed"
stack
: 
undefined
timestamp
: 
Mon Aug 11 2025 02:20:19 GMT-0400 (Eastern Daylight Time) {}
url
: 
"http://localhost:8000/api/screens"
[[Prototype]]
: 
Object
console.<computed>	@	console-listener.js:71
handleError	@	error-store.svelte.ts:26
handleApiError	@	error-store.svelte.ts:173
safeFetch	@	error-store.svelte.ts:195
await in safeFetch		
api	@	api.ts:9
load	@	Canvas.svelte:20
(anonymous)	@	Canvas.svelte:57
await in start		
(anonymous)	@	(index):5085
Promise.then		
(anonymous)	@	(index):5084
console-listener.js:71 WS connected ws://localhost:8000/ws
console-listener.js:71 Application Error: 
{code: 'JS', message: Error: Failed to fetch
    at http://localhost:5173/src/routes/+layout.svelte?t=1754893117567:50:40, details: 'TypeError: Failed to fetch\n    at window.fetch (ht…s/.vite/deps/chunk-RMRYNJNT.js?v=787a9acb:2217:7)', timestamp: Mon Aug 11 2025 02:20:19 GMT-0400 (Eastern Daylight Time), url: 'http://localhost:5173/', …}
code
: 
"JS"
details
: 
"TypeError: Failed to fetch\n    at window.fetch (http://localhost:5173/node_modules/@sveltejs/kit/src/runtime/client/fetcher.js?v=787a9acb:66:10)\n    at safeFetch (http://localhost:5173/src/lib/error-store.svelte.ts?t=1754892609516:151:51)\n    at api (http://localhost:5173/src/lib/api.ts?t=1754892609516:7:23)\n    at load (http://localhost:5173/src/lib/components/Canvas.svelte?t=1754892609516:32:45)\n    at http://localhost:5173/src/lib/components/Canvas.svelte?t=1754892609516:80:3\n    at untrack (http://localhost:5173/node_modules/.vite/deps/chunk-RMRYNJNT.js?v=787a9acb:3099:12)\n    at $effect (http://localhost:5173/node_modules/.vite/deps/chunk-4KAZNKTJ.js?v=787a9acb:4126:23)\n    at update_reaction (http://localhost:5173/node_modules/.vite/deps/chunk-RMRYNJNT.js?v=787a9acb:2812:23)\n    at update_effect (http://localhost:5173/node_modules/.vite/deps/chunk-RMRYNJNT.js?v=787a9acb:2943:21)\n    at flush_queued_effects (http://localhost:5173/node_modules/.vite/deps/chunk-RMRYNJNT.js?v=787a9acb:2217:7)"
message
: 
Error: Failed to fetch at http://localhost:5173/src/routes/+layout.svelte?t=1754893117567:50:40
stack
: 
"Error: Failed to fetch\n    at http://localhost:5173/src/routes/+layout.svelte?t=1754893117567:50:40"
timestamp
: 
Mon Aug 11 2025 02:20:19 GMT-0400 (Eastern Daylight Time) {}
url
: 
"http://localhost:5173/"
[[Prototype]]
: 
Object
console.<computed>	@	console-listener.js:71
handleError	@	error-store.svelte.ts:26
(anonymous)	@	+layout.svelte:49
fetcher.js?v=787a9acb:66 
 
 Uncaught (in promise) TypeError: Failed to fetch
    at safeFetch (error-store.svelte.ts:181:26)
    at api (api.ts:9:21)
    at load (Canvas.svelte:20:20)
    at Canvas.svelte:57:3
safeFetch	@	error-store.svelte.ts:181
api	@	api.ts:9
load	@	Canvas.svelte:20
(anonymous)	@	Canvas.svelte:57
await in start		
(anonymous)	@	(index):5085
Promise.then		
(anonymous)	@	(index):5084
