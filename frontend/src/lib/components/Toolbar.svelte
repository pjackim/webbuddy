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

<div class="navbar bg-base-300 shadow z-10">
	<div class="flex-1 px-2">Web Buddy</div>
	<div class="flex flex-wrap items-center gap-2 justify-end max-w-full px-2">
		<label class="label cursor-pointer gap-2">
			<span class="label-text hidden sm:inline">Offline Mode</span>
			<input aria-label="Offline Mode" type="checkbox" class="toggle" bind:checked={$online} />
		</label>
		<div class="divider divider-horizontal hidden md:block"></div>
		<div class="form-control w-full md:w-auto">
			<div class="flex flex-wrap items-center gap-2">
				<input
					class="input input-bordered min-w-0 grow sm:grow-0 w-[8rem] sm:w-40"
					placeholder="Name"
					bind:value={name}
				/>
				<input
					class="input input-bordered w-24 sm:w-28"
					type="number"
					bind:value={width}
				/>
				<input
					class="input input-bordered w-24 sm:w-28"
					type="number"
					bind:value={height}
				/>
				<button class="btn btn-primary w-full sm:w-auto" on:click={addScreen}>Add Screen</button>
			</div>
		</div>
	</div>
</div>
