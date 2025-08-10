<script lang="ts">
	import * as NavigationMenu from '$lib/components/ui/navigation-menu/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { online } from '../stores';
	import { api } from '../api';

	let name = 'Screen';
	let width = 1920 * 2;
	let height = 1080 * 2;

	function addScreen() {
		api('/screens', { method: 'POST', body: JSON.stringify({ name, width, height }) });
	}
</script>

<div class="flex justify-center p-4 border-b">
	<NavigationMenu.Root>
		<NavigationMenu.List class="flex items-center gap-4">
			<NavigationMenu.Item>
				<NavigationMenu.Link href="/" class="font-bold text-lg">Web Buddy</NavigationMenu.Link>
			</NavigationMenu.Item>

			<NavigationMenu.Item>
				<NavigationMenu.Trigger>Screens</NavigationMenu.Trigger>
				<NavigationMenu.Content>
					<div class="p-4 w-96">
						<h3 class="text-lg font-medium mb-2">Add New Screen</h3>
						<div class="grid gap-4">
							<div class="grid gap-2">
								<Label for="screen-name">Name</Label>
								<Input id="screen-name" placeholder="My Awesome Screen" bind:value={name} />
							</div>
							<div class="grid grid-cols-2 gap-4">
								<div class="grid gap-2">
									<Label for="screen-width">Width</Label>
									<Input id="screen-width" type="number" placeholder="3840" bind:value={width} />
								</div>
								<div class="grid gap-2">
									<Label for="screen-height">Height</Label>
									<Input id="screen-height" type="number" placeholder="2160" bind:value={height} />
								</div>
							</div>
							<Button onclick={addScreen}>Add Screen</Button>
						</div>
					</div>
				</NavigationMenu.Content>
			</NavigationMenu.Item>

			<NavigationMenu.Item>
				<NavigationMenu.Trigger>Settings</NavigationMenu.Trigger>
				<NavigationMenu.Content>
					<div class="p-4 w-64">
						<h3 class="text-lg font-medium mb-4">Settings</h3>
						<div class="flex items-center justify-between">
							<Label for="offline-mode">Offline Mode</Label>
							<Switch id="offline-mode" bind:checked={$online} />
						</div>
						<p class="text-sm text-muted-foreground mt-2">
							When offline, assets are stored locally.
						</p>
					</div>
				</NavigationMenu.Content>
			</NavigationMenu.Item>

			<NavigationMenu.Item>
				<NavigationMenu.Link href="/about">About</NavigationMenu.Link>
			</NavigationMenu.Item>
		</NavigationMenu.List>
	</NavigationMenu.Root>
</div>