// Components
import Input from '@components/system/inputs/Input2.svelte';
import GuiField from './GuiField.svelte';
// import Toggles from '@components/system/inputs/Toggles.svelte';
import Permissions from '@src/components/Permissions.svelte';
import type { permissions } from '@src/collections/types';

import { getFieldName } from '@utils/utils';

import mongoose from 'mongoose';

/**
 * Defines Relation widget Parameters
 */
export type Params = {
	// default required parameters
	label: string;
	display?: DISPLAY;
	db_fieldName?: string;
	widget?: any;
	translated?: boolean;
	icon?: string;
	helper?: string;
	width?: number;
	permissions?: permissions;

	// Widget Specific parameters
	relation: string;
};

/**
 * Defines Relation GuiSchema
 */
export const GuiSchema = {
	label: { widget: Input, required: true },
	display: { widget: Input, required: true },
	db_fieldName: { widget: Input, required: true },
	permissions: { widget: Permissions, required: false },

	// Widget Specific parameters
	relation: {
		widget: GuiField,
		required: true,
		imports: ['import {relation} from "./{relation}"']
	}
};

/**
 * Define Relation GraphqlSchema function
 */
export const GraphqlSchema: GraphqlSchema = ({ field, collection }) => {
	// Return an object containing the type name and the GraphQL schema
	return {
		typeName: field.relation,
		graphql: '', // relation does not need its own graphql because it copies related collection type
		resolver: {
			[collection.name]: {
				async [getFieldName(field)](parent) {
					// console.log(getFieldName(field));
					const res = await mongoose.models[field.relation].findById(parent[getFieldName(field)]).lean();

					return res;
				}
			}
		}
	};
};
