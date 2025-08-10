<script lang="ts">
	import { online, theme } from '../stores';
	import { api } from '../api';
	import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
	import { Moon, Sun } from '@lucide/svelte';
	import { watch } from 'runed';

	let name = $state('Screen');
	let width = $state(1920);
	let height = $state(1080);
	let dark = $state(theme.current === 'dark');

	watch(dark, (d) => (theme.current = d ? 'dark' : 'light'));
	watch(theme, (t) => (dark = t === 'dark'));

	function addScreen() {
		api('/screens', { method: 'POST', body: JSON.stringify({ name, width, height }) });
	}
</script>

<div class="navbar bg-base-300 shadow z-10">
	<div class="flex-1 px-2">Web Buddy – <span class="opacity-70 ml-2">multi-screen</span></div>
	<div class="flex gap-2 items-center">
		<label class="label cursor-pointer gap-2">
			<span class="label-text">Offline Mode</span>
			<input type="checkbox" class="toggle" bind:checked={online.current} />
		</label>
		<label class="swap swap-rotate">
			<input type="checkbox" class="theme-controller" value="dark" bind:checked={dark} />
			<Sun class="swap-off h-5 w-5" />
			<Moon class="swap-on h-5 w-5" />
		</label>
		<div class="divider divider-horizontal"></div>
		<Popover let:open>
			<PopoverTrigger>
				<button class="btn btn-primary">New Screen</button>
			</PopoverTrigger>
			<PopoverContent class="bg-base-200 rounded-box w-72 p-4 space-y-2">
				<input class="input input-bordered w-full" placeholder="Name" bind:value={name} />
				<div class="flex gap-2">
					<input class="input input-bordered w-1/2" type="number" bind:value={width} />
					<input class="input input-bordered w-1/2" type="number" bind:value={height} />
				</div>
				<button
					class="btn btn-primary w-full"
					on:click={() => {
						addScreen();
						open = false;
					}}
				>
					Add
				</button>
			</PopoverContent>
		</Popover>
	</div>
</div>
