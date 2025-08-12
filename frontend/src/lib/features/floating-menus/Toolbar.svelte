<script lang="ts">
	import * as Menubar from '$lib/ui/menubar';
	import * as Popover from '$lib/ui/popover';
	import { Button } from '$lib/ui/button';
	import {
		MousePointer,
		Square,
		Circle,
		Eraser,
		Type,
		Image,
		Layers,
		Settings,
		Save,
		Undo,
		Redo
	} from '@lucide/svelte';

	let selectedTool = $state('pointer');
</script>

<div class="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
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