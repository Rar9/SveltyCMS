<script lang="ts">
	// Stores
	import { mode, entryData, contentLanguage, defaultContentLanguage } from '@stores/store';

	import type { FieldType } from '.';

	import { getFieldName } from '@utils/utils';

	export let field: FieldType;

	let fieldName = getFieldName(field);
	export let value = $entryData[fieldName] || {};
	//console.log('value: ', value);

	let _data = $mode == 'create' ? {} : value;
	let _language = field?.translated ? $contentLanguage : defaultContentLanguage;

	export const WidgetData = async () => _data;

	// zod validation
	import * as z from 'zod';

	// Customize the error messages for each rule
	const validateSchema = z.object({
		db_fieldName: z.string(),
		icon: z.string().optional(),
		color: z.string().optional(),
		size: z.string().optional(),
		width: z.number().optional(),
		required: z.boolean().optional()
	});

	let validationError: string | null = null;

	function validateInput() {
		try {
			// Change .parseAsync to .parse
			validateSchema.parse(_data[_language]);
			validationError = '';
		} catch (error: unknown) {
			if (error instanceof z.ZodError) {
				validationError = error.errors[0].message;
			}
		}
	}
</script>

<div class="mb-4 flex items-center">
	<input
		id="default-checkbox"
		type="checkbox"
		color={field.color}
		bind:value={_data[_language]}
		on:input={validateInput}
		class="h-[${field.size}] w-[${field.size}] rounded border-surface-300 bg-surface-100 text-tertiary-600 focus:ring-2 focus:ring-tertiary-500 dark:border-surface-600 dark:bg-surface-700 dark:ring-offset-surface-800 dark:focus:ring-tertiary-600"
		bind:checked={value}
	/>
	<label for="default-checkbox" class="ml-2 text-sm font-medium text-surface-900 dark:text-surface-300"
		>{field.label ? field.label : field.db_fieldName}</label
	>
	{#if validationError !== null}
		<p class="text-center text-sm text-error-500">{validationError}</p>
	{/if}
</div>
