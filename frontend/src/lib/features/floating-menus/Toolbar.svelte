<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip';
	import * as Menubar from '$lib/ui/menubar';
	import * as Popover from '$lib/ui/popover';
	import {
		Circle,
		Eraser,
		Layers,
		MousePointer,
		Redo,
		Save,
		Settings,
		Square,
		Type,
		Undo
	} from '@lucide/svelte';
	import { selectedTool, setTool, type ToolType } from '$lib/stores';

	// Tools config for the centered horizontal toolbar
	const tools = [
		{ id: 'pointer' as const, label: 'Pointer Tool', icon: MousePointer, shortcut: 'V' },
		{ id: 'rectangle' as const, label: 'Rectangle', icon: Square, shortcut: 'R' },
		{ id: 'circle' as const, label: 'Circle', icon: Circle, shortcut: 'C' },
		{ id: 'text' as const, label: 'Text Tool', icon: Type, shortcut: 'T' },
		{ id: 'eraser' as const, label: 'Eraser', icon: Eraser, shortcut: 'E' }
	];

	// Keyboard shortcuts: V/R/C/T/E
	$effect(() => {
		const onKey = (e: KeyboardEvent) => {
			// Only handle if no input/textarea is focused
			if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
				return;
			}
			
			switch (e.key.toLowerCase()) {
				case 'v':
					setTool('pointer');
					break;
				case 'r':
					setTool('rectangle');
					break;
				case 'c':
					setTool('circle');
					break;
				case 't':
					setTool('text');
					break;
				case 'e':
					setTool('eraser');
					break;
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});

	function handleToolSelect(toolId: ToolType) {
		setTool(toolId);
	}
</script>

<!-- Centered floating horizontal tools toolbar -->
<div class="fixed top-4 left-1/2 -translate-x-1/2 z-50">
	<div class="glassmorphism border border-border/50 shadow-2xl backdrop-blur-md">
		<div class="flex items-center gap-1 px-2 py-1">
			{#each tools as tool (tool.id)}
				{#if tool.id === 'eraser'}
					<div class="w-px h-6 bg-border/60 mx-1"></div>
				{/if}
				<Tooltip.Root>
					<Tooltip.Trigger
						class="inline-flex items-center justify-center h-8 w-8 p-0 rounded-md text-sm transition-colors hover:bg-accent/20 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 {$selectedTool === tool.id ? 'bg-accent/25 border border-accent/50' : ''}"
						onclick={() => handleToolSelect(tool.id)}
						aria-pressed={$selectedTool === tool.id}
						type="button"
					>
						<tool.icon class="h-4 w-4" />
					</Tooltip.Trigger>
					<Tooltip.Content side="bottom" sideOffset={8} class="shadow-md">
						{tool.label} ({tool.shortcut})
					</Tooltip.Content>
				</Tooltip.Root>
			{/each}
		</div>
	</div>

	<!-- Optional hint of the active tool for accessibility -->
	<span class="sr-only">Active tool: {$selectedTool}</span>
</div>

<!-- Top-right aligned application menubar (moved from center) -->
<div class="fixed top-4 right-4 z-50">
	<div class="glassmorphism border border-border/50 shadow-2xl backdrop-blur-md">
		<Menubar.Root class="border-0 bg-transparent">
			<Menubar.Menu>
				<Menubar.Trigger class="px-2 hover:bg-accent/20">Tools</Menubar.Trigger>
				<Menubar.Content class="glassmorphism border border-border/50">
					<Menubar.Item class="flex items-center gap-2">
						<MousePointer class="h-4 w-4" />
						Pointer Tool
						<Menubar.Shortcut>V</Menubar.Shortcut>
					</Menubar.Item>
					<Menubar.Item class="flex items-center gap-2">
						<Square class="h-4 w-4" />
						Rectangle
						<Menubar.Shortcut>R</Menubar.Shortcut>
					</Menubar.Item>
					<Menubar.Item class="flex items-center gap-2">
						<Circle class="h-4 w-4" />
						Circle
						<Menubar.Shortcut>C</Menubar.Shortcut>
					</Menubar.Item>
					<Menubar.Item class="flex items-center gap-2">
						<Type class="h-4 w-4" />
						Text Tool
						<Menubar.Shortcut>T</Menubar.Shortcut>
					</Menubar.Item>
					<Menubar.Separator />
					<Menubar.Item class="flex items-center gap-2">
						<Eraser class="h-4 w-4" />
						Eraser
						<Menubar.Shortcut>E</Menubar.Shortcut>
					</Menubar.Item>
				</Menubar.Content>
			</Menubar.Menu>

			<Menubar.Menu>
				<Menubar.Trigger class="px-2 hover:bg-accent/20">Edit</Menubar.Trigger>
				<Menubar.Content class="glassmorphism border border-border/50">
					<Menubar.Item class="flex items-center gap-2">
						<Undo class="h-4 w-4" />
						Undo
						<Menubar.Shortcut>⌘Z</Menubar.Shortcut>
					</Menubar.Item>
					<Menubar.Item class="flex items-center gap-2">
						<Redo class="h-4 w-4" />
						Redo
						<Menubar.Shortcut>⌘⇧Z</Menubar.Shortcut>
					</Menubar.Item>
					<Menubar.Separator />
					<Menubar.Item>Copy</Menubar.Item>
					<Menubar.Item>Paste</Menubar.Item>
					<Menubar.Item>Delete</Menubar.Item>
				</Menubar.Content>
			</Menubar.Menu>

			<Menubar.Menu>
				<Menubar.Trigger class="px-2 hover:bg-accent/20">View</Menubar.Trigger>
				<Menubar.Content class="glassmorphism border border-border/50">
					<Menubar.Item class="flex items-center gap-2">
						<Layers class="h-4 w-4" />
						Show Layers
					</Menubar.Item>
					<Menubar.Item>Zoom In</Menubar.Item>
					<Menubar.Item>Zoom Out</Menubar.Item>
					<Menubar.Item>Fit to Screen</Menubar.Item>
				</Menubar.Content>
			</Menubar.Menu>

			<div class="flex items-center pl-4 pr-2 gap-2">
				<Popover.Root>
					<Popover.Trigger class="inline-flex items-center justify-center h-8 w-8 p-0 rounded-sm text-sm font-medium transition-colors hover:bg-accent/20 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
						<Settings class="h-4 w-4" />
					</Popover.Trigger>
					<Popover.Content class="glassmorphism border border-border/50 w-80">
						<div class="space-y-4">
							<div class="space-y-2">
								<h4 class="font-medium leading-none">Quick Settings</h4>
								<p class="text-sm text-muted-foreground">
									Adjust your workspace preferences
								</p>
							</div>
							<div class="grid gap-2">
								<div class="grid grid-cols-3 items-center gap-4">
									<label for="grid-size">Grid Size</label>
									<input
										id="grid-size"
										type="range"
										min="10"
										max="50"
										value="20"
										class="col-span-2"
									/>
								</div>
								<div class="grid grid-cols-3 items-center gap-4">
									<label for="opacity">Canvas Opacity</label>
									<input
										id="opacity"
										type="range"
										min="0"
										max="100"
										value="100"
										class="col-span-2"
									/>
								</div>
							</div>
						</div>
					</Popover.Content>
				</Popover.Root>

				<button class="inline-flex items-center justify-center h-8 w-8 p-0 rounded-sm text-sm font-medium transition-colors hover:bg-accent/20 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
					<Save class="h-4 w-4" />
				</button>
			</div>
		</Menubar.Root>
	</div>
</div>
