<script lang="ts">
	import type { SvelteComponent } from 'svelte';
	import widgets from '@components/widgets';
	import InputSwitch from '../../../../routes/(app)/builder/InputSwitch.svelte';
	import { asAny } from '@utils/utils';
	export let addField: boolean = false;

	//ParaglideJS
	import * as m from '@src/paraglide/messages';

	// Stores
	import { getModalStore } from '@skeletonlabs/skeleton';
	const modalStore = getModalStore();

	// Props
	/** Exposes parent props to this component. */
	export let parent: SvelteComponent;

	// Form Data
	const formData = {
		selectedWidget: {
			...widgets[$modalStore[0].value],
			GuiFields: { ...widgets[$modalStore[0].value].GuiFields }
		}
	};

	console.log('formData:', formData);

	// Get the keys of the widgets object
	let widget_keys = Object.keys(widgets) as unknown as keyof typeof widgets;
	let guiSchema: (typeof widgets)[typeof widget_keys]['GuiSchema'];
	$: if ($modalStore[0]?.value) {
		guiSchema = widgets[$modalStore[0].value]?.GuiSchema;
	}

	// We've created a custom submit function to pass the response and close the modal.
	function onFormSubmit(): void {
		if ($modalStore[0].response) $modalStore[0].response(formData);
		modalStore.close();
	}

	// Function to delete the user's avatar
	function deleteWidget() {
		alert('Delete Widget');
	}

	// Base Classes
	const cBase = 'card p-4 w-modal shadow-xl space-y-4 bg-white';
	const cHeader = 'text-2xl font-bold';
	const cForm = 'border border-surface-500 p-4 space-y-4 rounded-container-token';
</script>

<!-- @component This example creates a simple form modal. -->

{#if $modalStore[0]}
	<div class="modal-example-form {cBase}">
		<header class={`text-center text-primary-500 ${cHeader}`}>
			{$modalStore[0]?.title ?? '(title missing)'}
		</header>
		<article class="text-center">{$modalStore[0].body ?? '(body missing)'}</article>

		<!-- Enable for debugging: -->
		<form class="modal-form {cForm}">
<<<<<<< HEAD
<<<<<<< HEAD
			<!-- <label class="label">
				<span>Name</span>

				<input
					class="autocomplete input"
					type="search"
					name="autocomplete-search"
					bind:value={$modalStore[0].value}
					use:popup={popupSettings}
					placeholder="Select Widget..."
				/> -->
			<!-- <div data-popup="popupAutocomplete" class="w-full bg-surface-500 text-white">
					<Autocomplete bind:input={inputPopupWidget} options={widgetOptions} on:selection={onPopupWidgetSelect} />
				</div> -->

			<!-- {#if $modalStore[0].value}
					<div class="mb-2 border-y text-center text-primary-500">
						<div class="text-xl text-primary-500">
							<span class="font-bold">{$modalStore[0].value}</span> Widget Input Options
						</div>
						<div class="text-xs text-error-500">* Required</div>
					</div>
					<div class="options-table">
						{#each Object.keys(widgetList[0][$modalStore[0].value]({})).filter((key) => key !== 'widget' && key !== 'display' && key !== 'schema') as option}
							{#if option === 'label'}
								<label for={option}>{option}: <span class="text-error-500">*</span></label>
								<input
									type="text"
									required
									name={option}
									id={option}
									placeholder={`Enter ${option}`}
									class="variant-filled-surface"
									bind:value={selectedWidgetOptions[option]}
								/>
							{:else}
								<label for={option}>{option}:</label>
								{#if option === 'minlength' || option === 'maxlength' || option === 'count'}
									<input
										type="number"
										name={option}
										id={option}
										placeholder={`Enter ${option}`}
										class="variant-filled-surface"
										bind:value={selectedWidgetOptions[option]}
									/>
								{:else if option === 'required' || option === 'readonly' || option === 'disabled' || option === 'localization'}
									<input type="checkbox" name={option} id={option} class="variant-filled-surface" bind:value={selectedWidgetOptions[option]} />
								{:else}
									<input
										type="text"
										name={option}
										id={option}
										placeholder={`Enter ${option}`}
										class="variant-filled-surface"
										bind:value={selectedWidgetOptions[option]}
									/>
								{/if}
							{/if}
						{/each}
					</div>
				{/if} -->

=======
>>>>>>> collectionbuilder
			<!-- update to use GuiSchema -->
=======
>>>>>>> collectionbuilder
			{#if $modalStore[0].value}
				<div class="mb-2 border-y text-center text-primary-500">
					<div class="text-xl text-primary-500">
						Widget <span class="font-bold text-black dark:text-white">{$modalStore[0].value}</span> Input Options
					</div>
					<div class="my-1 text-xs text-error-500">* Required</div>
				</div>
				<div class="options-table">
					{#each Object.entries(guiSchema) as [property, value]}
						<InputSwitch bind:value={formData.selectedWidget.GuiFields[property]} widget={asAny(value).widget} key={property} />
					{/each}
				</div>
			{/if}
<<<<<<< HEAD
			<!-- </label> -->
=======
>>>>>>> collectionbuilder
		</form>
		<!-- prettier-ignore -->
		<footer class="modal-footer {parent.regionFooter} justify-between">
			<!-- Delete Button -->
			<button type="button" on:click={deleteWidget} class="variant-filled-error btn">
				<iconify-icon icon="icomoon-free:bin" width="24" /><span class="hidden sm:block">Delete</span>
			</button>
	
		<div class="flex justify-between gap-2">
			<button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>{m.modalcategory_cancel()}</button>
			<button class="btn {parent.buttonPositive}" on:click={onFormSubmit}>{m.modalcategory_save()}</button>
		</div>

		</footer>
	</div>
{/if}
