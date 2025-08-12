<script lang="ts">
	// Legacy wrapper component. Prefer using ErrorPanelComplete directly.
	import ErrorPanelComplete from './ErrorPanelComplete.svelte';

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
		codeClass = ''
	} = $props();

	// Normalize logs
	const errorMessage = $derived(
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

	const codeVariant: 'default' | 'secondary' = $derived(
		variant === 'default' ? 'default' : 'secondary'
	);
</script>

<ErrorPanelComplete
	errorCode={statusCode}
	errorMessage={errorMessage}
	language={lang as 'bash' | 'diff' | 'javascript' | 'json' | 'svelte' | 'typescript'}
	startCollapsed={collapsed}
	title={title}
	{hideLines}
	{highlight}
	codeVariant={codeVariant}
	codeClass={codeClass}
	class={className}
>
	<slot />
</ErrorPanelComplete>
