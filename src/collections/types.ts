import type widgets from '@components/widgets';

// Define a new `Schema` interface that represents the shape of an object with several properties
export interface Schema {
	name?: string;
	slug?: string;
	icon: string;
	description?: string;
	status?: 'published' | 'unpublished' | 'draft' | 'schedule' | 'cloned';
	permissions?: permissions;
	fields: ReturnType<(typeof widgets)[keyof typeof widgets]>[];
	strict?: boolean;
	revision?: boolean;
}

export type CollectionLabels = 'ImageArray' | 'Media' | 'Menu' | 'Post' | 'Products' | 'Posts1' | 'Posts2' | 'Names' | 'Relation' | 'WidgetTest';
