<script lang="ts">
	import * as ContextMenu from '$lib/ui/context-menu';
	import * as Sidebar from '$lib/ui/sidebar';
	import {
		Copy,
		Eye,
		EyeOff,
		Image,
		Layers,
		Lock,
		Square,
		Trash2,
		Type,
		Unlock
	} from '@lucide/svelte';

	let isCollapsed = $state(false);
	let layers = $state([
		{ id: 1, name: 'Background Image', type: 'image', visible: true, locked: false },
		{ id: 2, name: 'Logo', type: 'image', visible: true, locked: false },
		{ id: 3, name: 'Heading Text', type: 'text', visible: true, locked: false },
		{ id: 4, name: 'Rectangle Shape', type: 'shape', visible: false, locked: true },
		{ id: 5, name: 'Circle Element', type: 'shape', visible: true, locked: false }
	]);

	function toggleLayerVisibility(layerId: number) {
		layers = layers.map((layer) =>
			layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
		);
	}

	function toggleLayerLock(layerId: number) {
		layers = layers.map((layer) =>
			layer.id === layerId ? { ...layer, locked: !layer.locked } : layer
		);
	}

	function deleteLayer(layerId: number) {
		layers = layers.filter((layer) => layer.id !== layerId);
	}

	function duplicateLayer(layerId: number) {
		const layer = layers.find((l) => l.id === layerId);
		if (layer) {
			const newLayer = {
				...layer,
				id: Math.max(...layers.map((l) => l.id)) + 1,
				name: `${layer.name} Copy`
			};
			layers = [...layers, newLayer];
		}
	}

	function getIconForType(type: string) {
		switch (type) {
			case 'image':
				return Image;
			case 'text':
				return Type;
			case 'shape':
				return Square;
			default:
				return Layers;
		}
	}
</script>

<div class="fixed top-1/2 transform -translate-y-1/2 z-40">
	<Sidebar.Provider>
		<div class="glassmorphism border border-border/50 shadow-2xl backdrop-blur-md w-64">
			<Sidebar.Root class="bg-transparent border-0 w-full">
				<Sidebar.Header class="border-b border-border/20 px-4 py-3">
					<div class="flex items-center gap-2">
						<Layers class="h-5 w-5" />
						<h2 class="font-semibold text-sm">Layers</h2>
					</div>
				</Sidebar.Header>

				<Sidebar.Content class="px-2 py-2">
					<Sidebar.Group>
						<Sidebar.GroupLabel class="px-2 text-xs text-muted-foreground"
							>Canvas Layers</Sidebar.GroupLabel
						>
						<Sidebar.GroupContent>
							<Sidebar.Menu>
								{#each layers as layer (layer.id)}
									{@const Icon = getIconForType(layer.type)}
									<Sidebar.MenuItem class="group">
										<ContextMenu.Root>
											<ContextMenu.Trigger class="w-full">
												<Sidebar.MenuButton
													class="w-full justify-start px-2 py-1.5 h-auto hover:bg-accent/20"
												>
													<div class="flex items-center gap-2 flex-1 min-w-0">
														<Icon class="h-4 w-4 shrink-0" />
														<span class="text-sm truncate">{layer.name}</span>
													</div>
													<div
														class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
													>
														<button
															class="p-1 hover:bg-accent/40 rounded"
															onclick={() => toggleLayerVisibility(layer.id)}
														>
															{#if layer.visible}
																<Eye class="h-3 w-3" />
															{:else}
																<EyeOff class="h-3 w-3" />
															{/if}
														</button>
														<button
															class="p-1 hover:bg-accent/40 rounded"
															onclick={() => toggleLayerLock(layer.id)}
														>
															{#if layer.locked}
																<Lock class="h-3 w-3" />
															{:else}
																<Unlock class="h-3 w-3" />
															{/if}
														</button>
													</div>
												</Sidebar.MenuButton>
											</ContextMenu.Trigger>
											<ContextMenu.Content class="glassmorphism border border-border/50">
												<ContextMenu.Item onclick={() => duplicateLayer(layer.id)}>
													<Copy class="h-4 w-4 mr-2" />
													Duplicate Layer
												</ContextMenu.Item>
												<ContextMenu.Item onclick={() => toggleLayerVisibility(layer.id)}>
													{#if layer.visible}
														<EyeOff class="h-4 w-4 mr-2" />
														Hide Layer
													{:else}
														<Eye class="h-4 w-4 mr-2" />
														Show Layer
													{/if}
												</ContextMenu.Item>
												<ContextMenu.Item onclick={() => toggleLayerLock(layer.id)}>
													{#if layer.locked}
														<Unlock class="h-4 w-4 mr-2" />
														Unlock Layer
													{:else}
														<Lock class="h-4 w-4 mr-2" />
														Lock Layer
													{/if}
												</ContextMenu.Item>
												<ContextMenu.Separator />
												<ContextMenu.Item
													class="text-destructive focus:text-destructive"
													onclick={() => deleteLayer(layer.id)}
												>
													<Trash2 class="h-4 w-4 mr-2" />
													Delete Layer
												</ContextMenu.Item>
											</ContextMenu.Content>
										</ContextMenu.Root>
									</Sidebar.MenuItem>
								{/each}
							</Sidebar.Menu>
						</Sidebar.GroupContent>
					</Sidebar.Group>

					<Sidebar.Separator class="my-2" />

					<Sidebar.Group>
						<Sidebar.GroupLabel class="px-2 text-xs text-muted-foreground"
							>Properties</Sidebar.GroupLabel
						>
						<Sidebar.GroupContent>
							<div class="px-2 space-y-3">
								<div class="space-y-1">
									<label class="text-xs font-medium">Position</label>
									<div class="grid grid-cols-2 gap-2">
										<div class="space-y-1">
											<label class="text-xs text-muted-foreground">X</label>
											<input
												type="number"
												class="w-full h-6 text-xs px-2 rounded bg-background/50 border border-border/30"
												value="100"
											/>
										</div>
										<div class="space-y-1">
											<label class="text-xs text-muted-foreground">Y</label>
											<input
												type="number"
												class="w-full h-6 text-xs px-2 rounded bg-background/50 border border-border/30"
												value="50"
											/>
										</div>
									</div>
								</div>

								<div class="space-y-1">
									<label class="text-xs font-medium">Size</label>
									<div class="grid grid-cols-2 gap-2">
										<div class="space-y-1">
											<label class="text-xs text-muted-foreground">W</label>
											<input
												type="number"
												class="w-full h-6 text-xs px-2 rounded bg-background/50 border border-border/30"
												value="200"
											/>
										</div>
										<div class="space-y-1">
											<label class="text-xs text-muted-foreground">H</label>
											<input
												type="number"
												class="w-full h-6 text-xs px-2 rounded bg-background/50 border border-border/30"
												value="150"
											/>
										</div>
									</div>
								</div>

								<div class="space-y-1">
									<label class="text-xs font-medium">Rotation</label>
									<input
										type="range"
										min="0"
										max="360"
										value="0"
										class="w-full h-2 bg-background/50 rounded appearance-none cursor-pointer"
									/>
									<div class="text-xs text-muted-foreground text-center">0°</div>
								</div>
							</div>
						</Sidebar.GroupContent>
					</Sidebar.Group>
				</Sidebar.Content>

				<Sidebar.Footer class="border-t border-border/20 p-2">
					<div class="text-xs text-muted-foreground text-center">
						{layers.length} layers • {layers.filter((l) => l.visible).length} visible
					</div>
				</Sidebar.Footer>
			</Sidebar.Root>
		</div>
	</Sidebar.Provider>
</div>
