<script lang="ts">
	// Stores
	import { contentLanguage, categories, collection, mode, modifyEntry } from '@stores/store';
	import { toggleSidebar, sidebarState, screenWidth } from '@stores/sidebarStore';

	import axios from 'axios';

	import Loading from './Loading.svelte';
	let isLoading = false;
	let loadingTimer: any; // recommended time of around 200-300ms

	// TanstackFilter
	import TanstackFilter from '@components/system/tanstack/TanstackFilter.svelte';
	let globalSearchValue = '';
	let searchShow = false;
	let filterShow = false;
	let columnShow = false;
	let density = 'normal';

	// TanstackTable
	import TanstackTable from '@components/system/tanstack/TanstackTable.svelte';
	import { flexRender } from '@tanstack/svelte-table';
	import TanstackStatus from './system/tanstack/TanstackStatus.svelte';

	import EntryListMultiButton from './EntryList_MultiButton.svelte';
	import { getFieldName } from '@utils/utils';
	import TranslationStatus from './TranslationStatus.svelte';
	import { get } from 'svelte/store';

	// let data: any = [];

	let data: { entryList: [any]; totalCount: number } | undefined;

	console.log('data', data);
	let tableData: any = [];
	let columnFields: any[] = []; // Declare columnFields variables

	// This function refreshes the data displayed in a table by fetching new data from an API endpoint and updating the tableData and options variables.
	let refresh = async (fetch: boolean = true) => {
		loadingTimer && clearTimeout(loadingTimer);

		if ($collection.name == '') return;

		if (fetch) {
			loadingTimer = setTimeout(() => {
				isLoading = true;
			}, 400);

			data = (await axios.get(`/api/${$collection.name}?page=${1}&length=${50}`).then((data) => data.data)) as {
				entryList: [any];
				totalCount: number;
			};

			isLoading = false;
			clearTimeout(loadingTimer);
		}

		data &&
			(tableData = await Promise.all(
				data.entryList.map(async (entry) => {
					let obj: { [key: string]: any } = {};
					for (let field of $collection.fields) {
						obj[field.label] = await field.display?.({
							data: entry[getFieldName(field)],
							collection: $collection.name,
							field,
							entry,
							contentLanguage: $contentLanguage
						});
					}
					obj.status = entry.status; //get status
					obj._id = entry._id; //get fields

					return obj;
				})
			));

		console.log('data', data);
	};

	$: refresh();

	// Tick Row - modify STATUS of an Entry
	let tickMap = {}; // Object to track ticked rows
	// console.log('mode', $mode);
	// console.log('$modifyEntry', $modifyEntry);
	// console.log('tickMap', tickMap);

	$modifyEntry = async (status: 'delete' | 'publish' | 'unpublish' | 'schedule' | 'clone' | 'test') => {
		console.log('modifyEntry called');

		// Initialize an array to store the IDs of the items to be modified
		let modifyList: Array<string> = [];

		// Loop over the tickMap object
		for (let item in tickMap) {
			// If the item is ticked, add its ID to the modifyList
			tickMap[item] && modifyList.push(tableData[item]._id);
			// Log each item in tickMap
			console.log(`tickMap[${item}]`, tickMap[item]);
		}

		// If no items are ticked, exit the function
		if (modifyList.length == 0) return;

		// Initialize a new FormData object
		let formData = new FormData();

		// Define a map from input status to output status
		let statusMap = {
			delete: 'deleted',
			publish: 'published',
			unpublish: 'unpublished',
			schedule: 'scheduled',
			clone: 'cloned',
			test: 'testing'
		};

		// Append the IDs of the items to be modified to formData
		formData.append('ids', JSON.stringify(modifyList));

		// Append the status to formData
		formData.append('status', statusMap[status]);

		// Use the status to determine which API endpoint to call and what HTTP method to use
		switch (status) {
			case 'delete':
				console.log('delete called');
				// If the status is 'Delete', call the delete endpoint
				await axios.delete(`/api/${$collection.name}`, { data: formData });
				break;
			case 'publish':
			case 'unpublish':
			case 'test':
				console.log('setStatus called');
				// If the status is 'publish', 'unpublish', 'schedule', or 'clone', call the patch endpoint
				await axios.patch(`/api/${$collection.name}/setStatus`, formData).then((res) => res.data);
				break;
			case 'clone':
				console.log('clone called');
				await axios.post(`/api/${$collection.name}/clone`, formData);
				break;
			case 'schedule':
				console.log('schedule called');
				await axios.post(`/api/${$collection.name}/schedule`, formData);
				break;
		}

		// Refresh the collection
		refresh();

		// Set the mode to 'view'
		mode.set('view');
	};

	// Data for the array of column fields
	$: columnFields = [
		{
			header: 'Status',
			accessorKey: 'status',
			id: 'status',
			cell: (info: any) => flexRender(TanstackStatus, { value: info.getValue('status') })
		},
		...$collection.fields.map((field) => ({
			header: field.label,
			accessorKey: field.label,
			id: field.label,
			cell: (info: any) => {
				if (field.label === 'Image') {
					// If the field is an image
					const imageUrl = info.getValue('Image')?.thumbnail?.url; // Adjust 'thumbnail' to the desired size
					return imageUrl ? `<img class='max-w-[200px] max-h-[150px] inline-block' src="${imageUrl}" />` : '';
				} else {
					return info.getValue(field.label); // Fallback to rendering the value directly
				}
			}
		}))
	];

	$: console.log('columnFields', columnFields);
</script>

<!-- Header -->
<div class="sticky top-1 z-10 mb-2 flex justify-between pb-1 dark:text-white">
	<!-- Row 1 for Mobile -->
	<div class=" flex items-center justify-between">
		<!-- Hamburger -->
		{#if $sidebarState.left === 'hidden'}
			<button
				type="button"
				on:keydown
				on:click={() => toggleSidebar('left', get(screenWidth) === 'desktop' ? 'full' : 'collapsed')}
				class="variant-ghost-surface btn-icon mt-1"
			>
				<iconify-icon icon="mingcute:menu-fill" width="24" />
			</button>
		{/if}
		<!-- Collection type with icon -->
		<!-- TODO: Translate Collection Name -->
		<div class="mr-1 flex flex-col {!$sidebarState.left ? 'ml-2' : 'ml-1 sm:ml-2'}">
			{#if $categories.length}<div class="mb-2 text-xs capitalize text-surface-500 dark:text-surface-300">
					{$categories[0].name}
				</div>{/if}
			<div class="-mt-2 flex justify-start text-sm font-bold uppercase dark:text-white md:text-2xl lg:text-xl">
				{#if $collection.icon}<span> <iconify-icon icon={$collection.icon} width="24" class="mr-1 text-error-500 sm:mr-2" /></span>{/if}
				{#if $collection.name}
					<div class="flex max-w-[65px] whitespace-normal leading-3 sm:mr-2 sm:max-w-none md:mt-0 md:leading-none xs:mt-1">
						{$collection.name}
					</div>
				{/if}
			</div>
		</div>
	</div>

	<button type="button" on:keydown on:click={() => (searchShow = !searchShow)} class="variant-ghost-surface btn-icon sm:hidden">
		<iconify-icon icon="material-symbols:filter-list-rounded" width="30" />
	</button>

	<div class="relative hidden items-center justify-center gap-2 sm:flex">
		<TanstackFilter bind:globalSearchValue bind:filterShow bind:columnShow bind:density />
		<TranslationStatus />
	</div>

	<!-- MultiButton -->
	<EntryListMultiButton />

	<!-- Row 2 for Mobile  / Center on desktop -->
	<!-- TODO:add  expand transition -->
	<div class="relative flex h-14 items-center justify-center gap-1 py-2 dark:bg-surface-800 sm:gap-2 {!searchShow ? 'hidden' : 'block'} sm:hidden">
		<TanstackFilter bind:globalSearchValue bind:filterShow bind:columnShow bind:density />
		<TranslationStatus />
	</div>
</div>

{#if isLoading}
	<Loading />
{:else if tableData.length > 0}
	{#key tableData}
		<TanstackTable
			data={tableData}
			{columnFields}
			{tableData}
			dataSourceName="EntryList"
			bind:globalSearchValue
			bind:filterShow
			bind:columnShow
			bind:density
		/>
	{/key}
{/if}
