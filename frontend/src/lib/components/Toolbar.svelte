<script lang="ts">
	import * as NavigationMenu from '$lib/components/ui/navigation-menu/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { online } from '$lib/stores.svelte.ts';
	import { api } from '../api';
	import { toast } from 'svelte-sonner';
	import Loader2 from 'lucide-svelte/icons/loader-2';

	let name = 'Screen';
	let width = 1920 * 2;
	let height = 1080 * 2;
	let addScreenOpen = $state(false);
	let isAddingScreen = $state(false);

	async function addScreen() {
		isAddingScreen = true;
		try {
			await api('/screens', { method: 'POST', body: JSON.stringify({ name, width, height }) });
			toast.success('Screen added successfully!');
			addScreenOpen = false;
		} catch (error) {
			toast.error('Failed to add screen.');
		} finally {
			isAddingScreen = false;
		}
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
					<div class="p-4 w-64">
						<p class="text-sm text-muted-foreground mb-4">
							Manage your screens or add a new one.
						</p>
						<Button class="w-full" onclick={() => (addScreenOpen = true)}>Add New Screen</Button>
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
							<Switch id="offline-mode" bind:checked={online.current} />
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

	<Dialog.Root bind:open={addScreenOpen}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Add New Screen</Dialog.Title>
				<Dialog.Description>
					Configure the details for your new screen.
				</Dialog.Description>
			</Dialog.Header>
			<div class="grid gap-4 py-4">
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
			</div>
			<Dialog.Footer>
				<Button onclick={addScreen} disabled={isAddingScreen}>
					{#if isAddingScreen}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						Adding...
					{:else}
						Add Screen
					{/if}
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
</div>