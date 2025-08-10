<script lang="ts">
	import Bottomsheet from '@devantic/diaper';

	export let open = $state(false);
</script>

<Bottomsheet bind:open closeOnBackdropTap class="bg-base-100!">
	{#snippet header()}
		<slot name="header" />
	{/snippet}
	<slot />
</Bottomsheet>
