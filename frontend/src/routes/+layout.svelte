<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { ModeWatcher } from 'mode-watcher';
	import { theme } from '$lib/stores';
	import { watch } from 'runed';

	let { children } = $props();

	document.documentElement.setAttribute('data-theme', theme.current);
	watch(theme, (t) => document.documentElement.setAttribute('data-theme', t));
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>
<ModeWatcher />
{@render children?.()}
