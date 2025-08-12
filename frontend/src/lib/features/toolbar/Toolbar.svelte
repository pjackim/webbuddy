<script lang="ts">
	import * as NavigationMenu from '$lib/ui/navigation-menu';
	import * as Dialog from '$lib/ui/dialog';
	import { Button } from '$lib/ui/button';
	import { Input } from '$lib/ui/input';
	import { Label } from '$lib/ui/label';
	import { Switch } from '$lib/ui/switch';
	import { online } from '$lib/stores';
	import { api } from '$lib/api';
	import { toast } from 'svelte-sonner';
	import { Loader2 } from '@lucide/svelte';

	let name = $state('Screen');
	let width = $state(1920 * 2);
	let height = $state(1080 * 2);
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

<div class="relative z-20 border-b glass">
	<div class="flex h-14 items-center justify-between px-4">
		<!-- Left: Brand -->
		<a href="/" class="font-bold text-lg hover:text-primary transition-colors">WebBuddy</a>

		<!-- Center: Navigation -->
		<div class="flex-1 flex justify-center">
			<NavigationMenu.Root>
				<NavigationMenu.List class="flex items-center gap-4">
					<NavigationMenu.Item>
						<NavigationMenu.Trigger class="glassmorphism">Screens</NavigationMenu.Trigger>
						<NavigationMenu.Content class="glassmorphism">
							<div class="p-4 w-64">
								<p class="text-sm text-muted-foreground mb-4">
									Manage your screens or add a new one.
								</p>
								<Button class="w-full glass" onclick={() => (addScreenOpen = true)}
									>Add New Screen</Button
								>
							</div>
						</NavigationMenu.Content>
					</NavigationMenu.Item>

					<NavigationMenu.Item>
						<NavigationMenu.Trigger class="glassmorphism">Settings</NavigationMenu.Trigger>
						<NavigationMenu.Content class="glassmorphism">
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

					<NavigationMenu.Item class="bg-transparent">
						<NavigationMenu.Trigger class="glassmorphism">Demos</NavigationMenu.Trigger>
						<NavigationMenu.Content class="glassmorphism">
							<div class="p-4 w-64 space-y-2 bg-transparent">
								<a href="/demo/error-panel" class="block p-2 rounded-lg glassmorphism">
									<div class="font-medium">Error Panel</div>
									<div class="text-sm text-muted-foreground">View error panel component</div>
								</a>
								<a href="/demo/error-testing" class="block p-2 rounded-lg glassmorphism">
									<div class="font-medium">Error Testing</div>
									<div class="text-sm text-muted-foreground">Test error handling</div>
								</a>
							</div>
						</NavigationMenu.Content>
					</NavigationMenu.Item>

					<NavigationMenu.Item>
						<NavigationMenu.Link href="/about" class="glassmorphism">About</NavigationMenu.Link>
					</NavigationMenu.Item>
				</NavigationMenu.List>
			</NavigationMenu.Root>
		</div>

		<!-- Right: spacer / actions area (reserved to keep center truly centered) -->
		<div class="w-[8rem] flex items-center justify-end"></div>
	</div>

	<!-- Dialog lives at root to avoid layout interference -->
	<Dialog.Root bind:open={addScreenOpen}>
		<Dialog.Content class="bg-transparent glassmorphism">
			<Dialog.Header>
				<Dialog.Title>Add New Screen</Dialog.Title>
				<Dialog.Description>Configure the details for your new screen.</Dialog.Description>
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
