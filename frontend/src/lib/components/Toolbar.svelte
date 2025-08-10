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
	<div class="flex-1 px-2 min-w-0 truncate">Web Buddy</div>

	<!-- Hamburger (small screens) -->
	<div class="flex-none lg:hidden">
		<div class="dropdown dropdown-end">
			<div tabindex="0" role="button" class="btn btn-ghost btn-square" aria-label="Open menu">
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
					<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
				</svg>
			</div>
			<div class="dropdown-content z-20 w-80 max-w-[90vw] p-4 bg-base-200 rounded-box shadow">
				<div class="flex flex-col gap-3">
					<div class="form-control">
						<div class="join">
							<label class="join-item label cursor-pointer gap-2 px-3">
								<span class="label-text">Online</span>
								<input
									type="radio"
									name="mode-mobile"
									class="radio radio-success"
									checked={$online}
									on:change={() => online.set(true)}
								/>
							</label>
							<label class="join-item label cursor-pointer gap-2 px-3">
								<span class="label-text">Offline</span>
								<input
									type="radio"
									name="mode-mobile"
									class="radio radio-error"
									checked={!$online}
									on:change={() => online.set(false)}
								/>
							</label>
						</div>
					</div>
					<div class="form-control w-full">
						<input class="input input-bordered w-full" placeholder="Name" bind:value={name} />
					</div>
					<div class="flex gap-2">
						<input class="input input-bordered w-1/2" type="number" placeholder="Width" bind:value={width} />
						<input class="input input-bordered w-1/2" type="number" placeholder="Height" bind:value={height} />
					</div>
					<button class="btn btn-primary w-full" on:click={addScreen}>Add Screen</button>
				</div>
			</div>
		</div>
	</div>

	<!-- Inline controls (large screens) -->
	<div class="flex-none hidden lg:flex items-center gap-4 px-2">
		<div class="form-control">
			<div class="label">
				<span class="label-text">Mode</span>
			</div>
			<div class="join">
				<label class="join-item label cursor-pointer gap-2 px-3">
					<span class="label-text">Online</span>
					<input
						type="radio"
						name="mode-desktop"
						class="radio radio-success"
						checked={$online}
						on:change={() => online.set(true)}
					/>
				</label>
				<label class="join-item label cursor-pointer gap-2 px-3">
					<span class="label-text">Offline</span>
					<input
						type="radio"
						name="mode-desktop"
						class="radio radio-error"
						checked={!$online}
						on:change={() => online.set(false)}
					/>
				</label>
			</div>
		</div>
		<div class="divider divider-horizontal"></div>
		<div class="form-control">
			<div class="flex items-center gap-2">
				<input class="input input-bordered w-40" placeholder="Name" bind:value={name} />
				<input class="input input-bordered w-28" type="number" bind:value={width} />
				<input class="input input-bordered w-28" type="number" bind:value={height} />
				<button class="btn btn-primary" on:click={addScreen}>Add Screen</button>
			</div>
		</div>
	</div>
</div>
