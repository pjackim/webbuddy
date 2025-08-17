These three errors / warnings appear on first load, but then disappear after a reload. None of them seem to affect the functionality of their respective components. Please resolve the errors.


Error One:
```
Placing %sveltekit.body% directly inside <body> is not recommended, as your app may break for users who have certain browser extensions installed.

Consider wrapping it in an element:

<div style="display: contents">
  %sveltekit.body%
</div>
```

Error Two:

> This is very likely to be a misconfiguration on my TailwindCSS 4 setup, or some import issues. Therefore, your solution SHOULD NOT be to remove references to `rounded-lg`. Instead, find the configuration issue or oversight on my part. Be sure to carefully examine @src/styles

```
Error: Cannot apply unknown utility class `rounded-lg`. Are you using CSS modules or similar and missing `@reference`? https://tailwindcss.com/docs/functions-and-directives#reference-directive
    at onInvalidCandidate (Z:\Coding\webbuddy\webbuddy\frontend\node_modules\tailwindcss\dist\lib.js:18:1312)
    at ge (Z:\Coding\webbuddy\webbuddy\frontend\node_modules\tailwindcss\dist\lib.js:13:29803)
    at Z:\Coding\webbuddy\webbuddy\frontend\node_modules\tailwindcss\dist\lib.js:18:373
    at I (Z:\Coding\webbuddy\webbuddy\frontend\node_modules\tailwindcss\dist\lib.js:3:1656)
    at je (Z:\Coding\webbuddy\webbuddy\frontend\node_modules\tailwindcss\dist\lib.js:18:172)
    at bi (Z:\Coding\webbuddy\webbuddy\frontend\node_modules\tailwindcss\dist\lib.js:35:780)
    at async yi (Z:\Coding\webbuddy\webbuddy\frontend\node_modules\tailwindcss\dist\lib.js:35:1123)
    at async _r (Z:\Coding\webbuddy\webbuddy\frontend\node_modules\@tailwindcss\node\dist\index.js:10:3384)
    at async p (Z:\Coding\webbuddy\webbuddy\frontend\node_modules\@tailwindcss\postcss\dist\index.js:10:4019)
    at async Object.Once (Z:\Coding\webbuddy\webbuddy\frontend\node_modules\@tailwindcss\postcss\dist\index.js:10:4290)
```




Error Three:

> This is in `@src/lib/components/ui/sidebar/sidebar-menu-button.svelte:119:14`. Despite the error, the functionality of the button works just fine! Please resolve the error while maintaining the behavior of the button (it toggles the side bar).

```
node_invalid_placement_ssr: `<button>` (src/lib/components/ui/sidebar/sidebar-menu-button.svelte:119:14) cannot be a descendant of `<button>` (src/lib/components/ui/sidebar/sidebar-menu-button.svelte:75:2)

This can cause content to shift around as the browser repairs the HTML, and will likely result in a `hydration_mismatch` warning.
```
