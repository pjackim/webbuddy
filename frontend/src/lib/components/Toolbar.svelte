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
	<div class="flex-1 px-2">PureRef Web – <span class="opacity-70 ml-2">multi-screen</span></div>
	<div class="flex gap-2 items-center">
		<label class="label cursor-pointer gap-2">
			<span class="label-text">Offline Mode</span>
			<input type="checkbox" class="toggle" bind:checked={$online} />
		</label>
		<div class="divider divider-horizontal"></div>
		<div class="form-control">
			<div class="input-group">
				<input class="input input-bordered w-40" placeholder="Name" bind:value={name} />
				<input class="input input-bordered w-28" type="number" bind:value={width} />
				<input class="input input-bordered w-28" type="number" bind:value={height} />
				<button class="btn btn-primary" on:click={addScreen}>Add Screen</button>
			</div>
		</div>
	</div>
</div>
