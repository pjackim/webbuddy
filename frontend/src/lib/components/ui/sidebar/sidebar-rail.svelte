<script lang="ts">
	import * as Tooltip from "$lib/components/ui/tooltip";
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";
	import { useSidebar } from "./context.svelte.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLButtonElement>, HTMLButtonElement> = $props();

	const sidebar = useSidebar();
</script>

<Tooltip.Root>
	<Tooltip.Trigger>
		{#snippet child({ props })}
			<button
				bind:this={ref}
				data-sidebar="rail"
				data-slot="sidebar-rail"
				aria-label="Toggle Sidebar"
				onclick={sidebar.toggle}
				class={cn(
					"hover:after:bg-sidebar-border absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-[calc(1/2*100%-1px)] after:w-[2px] group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex",
					"in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
					"[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
					"hover:group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full",
					"[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
					"[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
					className
				)}
				{...restProps}
				{...props}
			>
				{@render children?.()}
			</button>
		{/snippet}
	</Tooltip.Trigger>
	<Tooltip.Content side="right" sideOffset={8}>Toggle Sidebar</Tooltip.Content>
</Tooltip.Root>
