import { getCollections } from '@collections';
import { redirect, type Actions } from '@sveltejs/kit';
import { publicEnv } from '@root/config/public';

// auth
import { SESSION_COOKIE_NAME } from '@src/auth';
import { auth } from './api/db';

// paraglidejs
import { setLanguageTag, sourceLanguageTag, availableLanguageTags } from '@src/paraglide/runtime';

export async function load({ cookies }) {
	// Get the session cookie
	const session_id = cookies.get(SESSION_COOKIE_NAME) as string;

	// Validate the user's session
	const user = await auth.validateSession(session_id);

	// If validation fails, redirect the user to the login page.
	if (!user) throw redirect(302, `/login`);

	// Get the collections and filter based on reading permissions
	const _filtered = (await getCollections()).filter((c) => user && c?.permissions?.[user.role]?.read != false);

	// Redirect to first left collection
	redirect(302, `/${publicEnv.DEFAULT_CONTENT_LANGUAGE}/${_filtered[0].name}`);
}

export const actions = {
	default: async ({ cookies, request }) => {
		const data = await request.formData();
		const theme = data.get('theme') === 'light' ? 'light' : 'dark';
		// console.log(theme);

		let systemlanguage = data.get('systemlanguage') as string; // get the system language from the form data
		// console.log(systemlanguage);

		// Check if the provided system language is available, if not, default to source language
		if (!availableLanguageTags.includes(sourceLanguageTag)) {
			systemlanguage = sourceLanguageTag;
		}

		// Set the cookies
		cookies.set('theme', theme, { path: '/' });
		cookies.set('systemlanguage', systemlanguage, { path: '/' });

		// Update the language tag in paraglide
		setLanguageTag(systemlanguage as any);

		// Store the system language and theme color in local storage
		localStorage.setItem('systemlanguage', systemlanguage);
		localStorage.setItem('theme', theme);

		// Here you would also update these preferences on the server for the current user

		redirect(303, '/');
	}
} satisfies Actions;
