<script lang="ts">
	import { roles } from '@auth/types';

	export let value: string;
	// Grab Users from one Location only

	let classes = `${
		value === 'admin'
			? 'badge gradient-primary'
			: value === 'developer'
				? 'badge gradient-pink'
				: value === 'editor'
					? 'badge gradient-tertiary'
					: value === 'user'
						? 'badge gradient-secondary'
						: 'text-white'
	} rounded-full text-white`;
</script>

<div class={classes}>
	{#if value === 'admin'}
		<iconify-icon icon="material-symbols:verified-outline" width="20" class="mr-2" /> {value}
	{:else if value === 'developer'}
		<iconify-icon icon="material-symbols:supervised-user-circle" width="20" class="mr-2" /> {value}
	{:else if value === 'editor'}
		<iconify-icon icon="mdi:user-edit" width="20" class="mr-2" /> {value}
	{:else if value === 'user'}
		<iconify-icon icon="material-symbols:supervised-user-circle" width="20" class="mr-2" /> {value}
	{/if}
</div>
