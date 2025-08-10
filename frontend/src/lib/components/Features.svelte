<script lang="ts">
	// Static features list for marketing using Pixel UI style
	interface Feature {
		title: string;
		description: string;
	}
	const features: Feature[] = [
		{
			title: 'Drag & Drop',
			description: 'Drop files directly onto the canvas to add assets.'
		},
		{
			title: 'Realtime Sync',
			description: 'Collaborate with teammates and see updates instantly.'
		},
		{
			title: 'Offline Mode',
			description: 'Keep working without internet; sync changes later.'
		}
	];
</script>

<section class="px-4 py-8">
	<div class="max-w-4xl mx-auto text-center flex flex-col gap-6">
		<h2 class="text-2xl font-bold">Why WebBuddy?</h2>
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each features as f (f.title)}
				<div class="border rounded-xl bg-base-100 p-6 text-left">
					<h3 class="font-semibold mb-2">{f.title}</h3>
					<p class="text-sm opacity-70">{f.description}</p>
				</div>
			{/each}
		</div>
	</div>
</section>
