<script lang="ts">
  // Reusable error panel that centers a big status code above an expandable log viewer.
  // Depends on shadcn-svelte Code component being installed at $lib/components/ui/code.
  import * as Code from '$lib/components/ui/code/index.js';

  type Lang = 'bash' | 'diff' | 'javascript' | 'json' | 'svelte' | 'typescript' | (string & {});
  type Variant = 'default' | 'secondary' | (string & {});

  let {
    // Top heading
    statusCode = 500 as number | string,
    title = 'Internal Error',

    // Code/log viewer
    logs = '' as string | unknown,
    lang = 'typescript' as Lang,
    variant = 'secondary' as Variant,
    collapsed = true,
    hideLines = false,
    highlight = [] as Array<number | [number, number]>,

    // Styling hooks
    class: className = '',
    codeClass = '',
  } = $props();

  // Normalize logs to string for the Code component (Svelte 5 runes)
  const codeText = $derived(
    typeof logs === 'string'
      ? logs
      : (() => {
          try {
            return JSON.stringify(logs, null, 2);
          } catch (e) {
            return String(logs);
          }
        })()
  );

  // Narrow variant to the exact type accepted by Code.Root
  const codeVariant: 'default' | 'secondary' | undefined = $derived(
    variant === 'default' ? 'default' : variant === 'secondary' ? 'secondary' : undefined
  );
</script>

<div class={`w-full h-full flex items-center justify-center p-6 ${className}`}>
  <div class="w-full max-w-4xl">
    <div class="text-center mb-6">
      <div class="text-7xl font-black leading-none tracking-tight">{statusCode}</div>
      {#if title}
        <div class="mt-2 text-sm text-muted-foreground">{title}</div>
      {/if}
    </div>

    <!-- Collapsible overflow wrapper around the code block -->
    <Code.Overflow bind:collapsed>
      <!-- Position the CopyButton over the code via relative container on Root -->
      <Code.Root
        class={`relative rounded-lg shadow-sm ${codeClass}`}
        code={codeText}
        lang={lang as 'bash' | 'diff' | 'javascript' | 'json' | 'svelte' | 'typescript'}
        variant={codeVariant}
        hideLines={hideLines}
        highlight={highlight}
      >
        <div class="absolute right-2 top-2">
          <Code.CopyButton variant="ghost" size="icon" />
        </div>
      </Code.Root>
    </Code.Overflow>

    <!-- Optional consumer-provided actions or notes below the code -->
    <slot />
  </div>
  
</div>

<style lang="postcss">
  /* Tailwind handles layout; kept for future extension. */
</style>
