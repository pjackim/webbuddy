<script lang="ts">
	import { Tooltip as TooltipPrimitive } from "bits-ui";
	import type { Snippet } from "svelte";

	// Support both child snippet (asChild behavior) and regular children fallback.
	let {
		ref = $bindable(null),
		child: triggerChild,
		children,
		...restProps
	}: TooltipPrimitive.TriggerProps & { child?: Snippet; children?: Snippet } = $props();
</script>

<TooltipPrimitive.Trigger
	bind:ref
	data-slot="tooltip-trigger"
	{...restProps}
	child={triggerChild}
>
	{#if !triggerChild}
		{@render children?.()}
	{/if}
</TooltipPrimitive.Trigger>
