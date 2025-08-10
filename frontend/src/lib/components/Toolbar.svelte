<script lang="ts">
	import { online, screens } from '../stores';
	import { api } from '../api';
	let name = 'Screen';
	let width = 1920;
	let height = 1080;
	function addScreen() {
		api('/screens', { method: 'POST', body: JSON.stringify({ name, width, height }) });
	}
</script>

<div class="navbar bg-base-300 shadow z-10 overflow-x-hidden">
	<div class="flex-1 px-2 min-w-0 truncate">Web Buddy</div>
	<div class="flex-1 min-w-0 max-w-full basis-full sm:basis-auto flex flex-wrap items-center gap-2 gap-y-2 justify-start sm:justify-end px-2 overflow-hidden">
		<label class="label cursor-pointer gap-2 w-full sm:w-auto justify-between sm:justify-normal order-last sm:order-none">
			<span class="label-text hidden sm:inline">Offline Mode</span>
			<input aria-label="Offline Mode" type="checkbox" class="toggle" bind:checked={$online} />
		</label>
		<div class="divider divider-horizontal hidden md:block"></div>
		<div class="form-control w-full md:w-auto min-w-0">
			<div class="grid grid-cols-1 sm:flex items-center gap-2 min-w-0 w-full">
				<input
			    class="input input-bordered min-w-0 grow sm:grow-0 w-full sm:w-40"
					placeholder="Name"
					bind:value={name}
				/>
				<input
			    class="input input-bordered w-full sm:w-28 min-w-0"
					type="number"
					bind:value={width}
				/>
				<input
			    class="input input-bordered w-full sm:w-28 min-w-0"
					type="number"
					bind:value={height}
				/>
				<button class="btn btn-primary w-full sm:w-auto" on:click={addScreen}>Add Screen</button>
			</div>
		</div>
	</div>
</div>
