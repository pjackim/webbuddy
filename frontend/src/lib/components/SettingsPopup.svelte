<script lang="ts">
	import * as Popover from '$lib/ui/popover';
	import { Button } from '$lib/ui/button';
	import { Input } from '$lib/ui/input';
	import { Label } from '$lib/ui/label';
	import { Switch } from '$lib/ui/switch';
	import * as Separator from '$lib/ui/separator';
	import * as Slider from '$lib/ui/slider';
	import {
		gridSettings,
		styleSettings, 
		performanceSettings,
		debugSettings,
		updateGridSettings,
		updateStyleSettings,
		updatePerformanceSettings,
		updateDebugSettings,
		resetAllSettings
	} from '$lib/stores/settings';
	import { Settings, Grid3X3, Palette, Zap, Bug, RotateCcw, ChevronDown, ChevronRight } from '@lucide/svelte';
	import { onDestroy } from 'svelte';
	// Access store values directly from PersistedState.current to avoid circular reactivity
	let currentGridSettings = $derived(gridSettings.current);
	let currentStyleSettings = $derived(styleSettings.current);
	let currentPerformanceSettings = $derived(performanceSettings.current);
	let currentDebugSettings = $derived(debugSettings.current);
	// Section expansion states
	let gridExpanded = $state(true);
	let styleExpanded = $state(false);
	let performanceExpanded = $state(false);
	let debugExpanded = $state(false);
	// Helper function to handle slider values with proper typing and throttling
	let updateTimeouts: Record<string, ReturnType<typeof setTimeout>> = {};
	const handleSliderChange = (key: string, value: number[], callback: (val: number) => void) => {
		// Clear existing timeout for this key
		if (updateTimeouts[key]) {
			clearTimeout(updateTimeouts[key]);
		}
		// Throttle updates to prevent rapid-fire changes
		updateTimeouts[key] = setTimeout(() => {
			callback(value[0]);
			delete updateTimeouts[key];
		}, 16); // ~60fps update rate
	};
	// Clean up timeouts on component destroy
	onDestroy(() => {
		Object.values(updateTimeouts).forEach(clearTimeout);
	});
</script>
<Popover.Root>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="outline" size="icon" class="glassmorphism border-border/50">
				<Settings class="h-4 w-4" />
				<span class="sr-only">Open Settings</span>
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="glassmorphism border border-border/50 w-96 max-h-[600px] overflow-y-auto" side="left" sideOffset={8}>
		<div class="space-y-4">
			<div class="space-y-2">
				<h4 class="font-medium leading-none flex items-center gap-2">
					<Settings class="h-4 w-4" />
					Settings
				</h4>
				<p class="text-sm text-muted-foreground">
					Configure your workspace preferences
				</p>
			</div>
			<!-- Grid Settings Section -->
			<div class="space-y-2">
				<button
					class="flex items-center justify-between w-full p-2 rounded-md hover:bg-accent/10 transition-colors"
					onclick={() => gridExpanded = !gridExpanded}
				>
					<div class="flex items-center gap-2">
						<Grid3X3 class="h-4 w-4" />
						<span class="font-medium text-sm">Grid Settings</span>
					</div>
					{#if gridExpanded}
						<ChevronDown class="h-4 w-4" />
					{:else}
						<ChevronRight class="h-4 w-4" />
					{/if}
				</button>
				{#if gridExpanded}
					<div class="space-y-3 pl-6">
						<div class="flex items-center justify-between">
							<Label for="grid-visible" class="text-sm">Show Grid</Label>
							<Switch 
								id="grid-visible"
								checked={currentGridSettings.visible}
								onCheckedChange={(checked) => updateGridSettings({ visible: checked })}
							/>
						</div>
						<div class="space-y-2">
							<Label for="grid-pattern" class="text-sm">Pattern</Label>
							<select 
								id="grid-pattern"
								value={currentGridSettings.pattern}
								onchange={(e) => {
									const target = e.target as HTMLSelectElement;
									updateGridSettings({ pattern: target.value as 'dots' | 'grid' });
								}}
								class="w-full px-3 py-2 text-sm border rounded-md bg-background"
							>
								<option value="grid">Grid Lines</option>
								<option value="dots">Dots</option>
							</select>
						</div>
						<div class="space-y-2">
							<Label for="grid-size" class="text-sm">Size: {currentGridSettings.size}px</Label>
							<Slider.Root type="single"
								value={[currentGridSettings.size]}
								onValueChange={(value: number[]) => handleSliderChange('grid-size', value, (val) => updateGridSettings({ size: val }))}
								max={100}
								min={10}
								step={5}
								class="w-full"
							/>
						</div>
						<div class="space-y-2">
							<Label for="grid-opacity" class="text-sm">Opacity: {Math.round(currentGridSettings.opacity * 100)}%</Label>
							<Slider.Root type="single"
								value={[currentGridSettings.opacity * 100]}
								onValueChange={(value: number[]) => handleSliderChange('grid-opacity', value, (val) => updateGridSettings({ opacity: val / 100 }))}
								max={100}
								min={0}
								step={5}
								class="w-full"
							/>
						</div>
						{#if currentGridSettings.pattern === 'grid'}
							<div class="space-y-2">
								<Label for="line-thickness" class="text-sm">Line Thickness: {currentGridSettings.lineThickness}px</Label>
								<Slider.Root type="single"
									value={[currentGridSettings.lineThickness]}
									onValueChange={(value: number[]) => handleSliderChange('line-thickness', value, (val) => updateGridSettings({ lineThickness: val }))}
									max={3}
									min={0.1}
									step={0.1}
									class="w-full"
								/>
							</div>
						{:else}
							<div class="space-y-2">
								<Label for="dot-radius" class="text-sm">Dot Radius: {currentGridSettings.dotRadius}px</Label>
								<Slider.Root type="single"
									value={[currentGridSettings.dotRadius]}
									onValueChange={(value: number[]) => handleSliderChange('dot-radius', value, (val) => updateGridSettings({ dotRadius: val }))}
									max={3}
									min={0.1}
									step={0.1}
									class="w-full"
								/>
							</div>
						{/if}
						<div class="space-y-2">
							<Label for="major-interval" class="text-sm">Major Line Interval: {currentGridSettings.majorLineInterval}</Label>
							<Slider.Root type="single"
								value={[currentGridSettings.majorLineInterval]}
								onValueChange={(value: number[]) => handleSliderChange('major-interval', value, (val) => updateGridSettings({ majorLineInterval: val }))}
								max={10}
								min={2}
								step={1}
								class="w-full"
							/>
						</div>
					</div>
				{/if}
			</div>
			<Separator.Root class="opacity-50" />
			<!-- Style Settings Section -->
			<div class="space-y-2">
				<button
					class="flex items-center justify-between w-full p-2 rounded-md hover:bg-accent/10 transition-colors"
					onclick={() => styleExpanded = !styleExpanded}
				>
					<div class="flex items-center gap-2">
						<Palette class="h-4 w-4" />
						<span class="font-medium text-sm">Style Settings</span>
					</div>
					{#if styleExpanded}
						<ChevronDown class="h-4 w-4" />
					{:else}
						<ChevronRight class="h-4 w-4" />
					{/if}
				</button>
				{#if styleExpanded}
					<div class="space-y-3 pl-6">
						<div class="space-y-2">
							<Label for="corner-radius" class="text-sm">Corner Radius: {currentStyleSettings.cornerRadius}px</Label>
							<Slider.Root type="single"
								value={[currentStyleSettings.cornerRadius]}
								onValueChange={(value: number[]) => handleSliderChange('corner-radius', value, (val) => updateStyleSettings({ cornerRadius: val }))}
								max={24}
								min={0}
								step={1}
								class="w-full"
							/>
						</div>
						<div class="space-y-2">
							<Label class="text-sm font-medium">Glassmorphism</Label>
							<div class="space-y-2">
								<Label for="glass-blur" class="text-xs text-muted-foreground">Blur: {currentStyleSettings.glassBlur}px</Label>
								<Slider.Root type="single"
									value={[currentStyleSettings.glassBlur]}
									onValueChange={(value: number[]) => handleSliderChange('glass-blur', value, (val) => updateStyleSettings({ glassBlur: val }))}
									max={32}
									min={0}
									step={2}
									class="w-full"
								/>
							</div>
							<div class="space-y-2">
								<Label for="glass-opacity" class="text-xs text-muted-foreground">Background Opacity: {Math.round(currentStyleSettings.glassOpacity * 100)}%</Label>
								<Slider.Root type="single"
									value={[currentStyleSettings.glassOpacity * 100]}
									onValueChange={(value: number[]) => handleSliderChange('glass-opacity', value, (val) => updateStyleSettings({ glassOpacity: val / 100 }))}
									max={80}
									min={0}
									step={5}
									class="w-full"
								/>
							</div>
							<div class="space-y-2">
								<Label for="border-opacity" class="text-xs text-muted-foreground">Border Opacity: {Math.round(currentStyleSettings.borderOpacity * 100)}%</Label>
								<Slider.Root type="single"
									value={[currentStyleSettings.borderOpacity * 100]}
									onValueChange={(value: number[]) => handleSliderChange('border-opacity', value, (val) => updateStyleSettings({ borderOpacity: val / 100 }))}
									max={50}
									min={0}
									step={5}
									class="w-full"
								/>
							</div>
						</div>
					</div>
				{/if}
			</div>
			<Separator.Root class="opacity-50" />
			<!-- Performance Settings Section -->
			<div class="space-y-2">
				<button
					class="flex items-center justify-between w-full p-2 rounded-md hover:bg-accent/10 transition-colors"
					onclick={() => performanceExpanded = !performanceExpanded}
				>
					<div class="flex items-center gap-2">
						<Zap class="h-4 w-4" />
						<span class="font-medium text-sm">Performance</span>
					</div>
					{#if performanceExpanded}
						<ChevronDown class="h-4 w-4" />
					{:else}
						<ChevronRight class="h-4 w-4" />
					{/if}
				</button>
				{#if performanceExpanded}
					<div class="space-y-3 pl-6">
						<div class="flex items-center justify-between">
							<Label for="enable-animations" class="text-sm">Enable Animations</Label>
							<Switch 
								id="enable-animations"
								checked={currentPerformanceSettings.enableAnimations}
								onCheckedChange={(checked) => updatePerformanceSettings({ enableAnimations: checked })}
							/>
						</div>
						<div class="space-y-2">
							<Label for="animation-damping" class="text-sm">Animation Damping: {currentPerformanceSettings.animationDamping.toFixed(2)}</Label>
							<Slider.Root type="single"
								value={[currentPerformanceSettings.animationDamping * 100]}
								onValueChange={(value: number[]) => handleSliderChange('animation-damping', value, (val) => updatePerformanceSettings({ animationDamping: val / 100 }))}
								max={50}
								min={1}
								step={1}
								class="w-full"
							/>
						</div>
						<div class="space-y-2">
							<Label for="zoom-sensitivity" class="text-sm">Zoom Sensitivity: {(currentPerformanceSettings.zoomSensitivity * 1000).toFixed(1)}</Label>
							<Slider.Root type="single"
								value={[currentPerformanceSettings.zoomSensitivity * 1000]}
								onValueChange={(value: number[]) => handleSliderChange('zoom-sensitivity', value, (val) => updatePerformanceSettings({ zoomSensitivity: val / 1000 }))}
								max={5}
								min={0.1}
								step={0.1}
								class="w-full"
							/>
						</div>
						<div class="grid grid-cols-2 gap-3">
							<div class="space-y-2">
								<Label for="min-zoom" class="text-sm">Min Zoom: {currentPerformanceSettings.minZoom.toFixed(1)}x</Label>
								<Slider.Root type="single"
									value={[currentPerformanceSettings.minZoom * 10]}
									onValueChange={(value: number[]) => handleSliderChange('min-zoom', value, (val) => updatePerformanceSettings({ minZoom: val / 10 }))}
									max={10}
									min={1}
									step={1}
									class="w-full"
								/>
							</div>
							<div class="space-y-2">
								<Label for="max-zoom" class="text-sm">Max Zoom: {currentPerformanceSettings.maxZoom}x</Label>
								<Slider.Root type="single"
									value={[currentPerformanceSettings.maxZoom]}
									onValueChange={(value: number[]) => handleSliderChange('max-zoom', value, (val) => updatePerformanceSettings({ maxZoom: val }))}
									max={20}
									min={2}
									step={1}
									class="w-full"
								/>
							</div>
						</div>
					</div>
				{/if}
			</div>
			<Separator.Root class="opacity-50" />
			<!-- Debug Settings Section -->
			<div class="space-y-2">
				<button
					class="flex items-center justify-between w-full p-2 rounded-md hover:bg-accent/10 transition-colors"
					onclick={() => debugExpanded = !debugExpanded}
				>
					<div class="flex items-center gap-2">
						<Bug class="h-4 w-4" />
						<span class="font-medium text-sm">Debug & Developer</span>
					</div>
					{#if debugExpanded}
						<ChevronDown class="h-4 w-4" />
					{:else}
						<ChevronRight class="h-4 w-4" />
					{/if}
				</button>
				{#if debugExpanded}
					<div class="space-y-3 pl-6">
						<div class="flex items-center justify-between">
							<Label for="debug-mode" class="text-sm">Debug Mode</Label>
							<Switch 
								id="debug-mode"
								checked={currentDebugSettings.debugMode}
								onCheckedChange={(checked) => updateDebugSettings({ debugMode: checked })}
							/>
						</div>
						<div class="flex items-center justify-between">
							<Label for="show-fps" class="text-sm">Show FPS</Label>
							<Switch 
								id="show-fps"
								checked={currentDebugSettings.showFPS}
								onCheckedChange={(checked) => updateDebugSettings({ showFPS: checked })}
							/>
						</div>
						<div class="flex items-center justify-between">
							<Label for="show-coordinates" class="text-sm">Show Coordinates</Label>
							<Switch 
								id="show-coordinates"
								checked={currentDebugSettings.showCoordinates}
								onCheckedChange={(checked) => updateDebugSettings({ showCoordinates: checked })}
							/>
						</div>
						<div class="flex items-center justify-between">
							<Label for="show-grid-debug" class="text-sm">Show Grid Debug</Label>
							<Switch 
								id="show-grid-debug"
								checked={currentDebugSettings.showGrid}
								onCheckedChange={(checked) => updateDebugSettings({ showGrid: checked })}
							/>
						</div>
						<div class="pt-2">
							<p class="text-xs text-muted-foreground mb-2">Debug info will appear when enabled</p>
							{#if currentDebugSettings.debugMode}
								<div class="text-xs font-mono bg-muted/50 p-2 rounded space-y-1">
									<div>Grid: {currentGridSettings.visible ? 'ON' : 'OFF'}</div>
									<div>Pattern: {currentGridSettings.pattern}</div>
									<div>Size: {currentGridSettings.size}px</div>
									<div>FPS: {currentDebugSettings.showFPS ? 'VISIBLE' : 'HIDDEN'}</div>
								</div>
							{/if}
						</div>
					</div>
				{/if}
			</div>
			<Separator.Root class="opacity-50" />
			<div class="flex justify-between items-center pt-2">
				<Button
					variant="outline"
					size="sm"
					onclick={resetAllSettings}
					class="text-xs"
				>
					<RotateCcw class="h-3 w-3 mr-1" />
					Reset All
				</Button>
				<div class="text-xs text-muted-foreground">
					Settings auto-save
				</div>
			</div>
		</div>
	</Popover.Content>
</Popover.Root>