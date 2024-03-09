import { publicEnv } from '@root/config/public';
import { error, redirect } from '@sveltejs/kit';

//Auth
import { auth } from '@api/db';
import { SESSION_COOKIE_NAME } from '@src/auth';

//ParaglideJS
import { languageTag } from '@src/paraglide/runtime';

import { getCollections } from '@collections';

export async function load({ cookies, route, params }) {
	const collections = await getCollections();
	const session_id = cookies.get(SESSION_COOKIE_NAME) as string;
	const user = await auth.validateSession(session_id);
	const collection = collections.find((c: any) => c.name == params.collection);

	// Redirect to user page
	if (user?.lastAuthMethod == 'token') {
		redirect(302, `/user`);
	}

	//  Check if language and collection both set in url
	if (!languageTag().includes(params.language as any) || (!collection && params.collection)) {
		// if collection is set in url but does not exists.
		error(404, {
			message: 'Not found'
		});
	}

	// If user is logged in
	if (user) {
		if (route.id != '/(app)/[language]/[collection]') {
			// filters collection based on reading permissions and redirects to first left one
			const _filtered = collections.filter((c: any) => user && c?.permissions?.[user.role]?.read != false); // filters collection  based on reading permissions  and redirects to first left one
			throw redirect(302, `/${params.language || publicEnv.DEFAULT_CONTENT_LANGUAGE}/${_filtered[0].name}`);
		}

		if (collection?.permissions?.[user.role]?.read == false) {
			error(404, {
				message: 'No Access to this collection'
			});
		}
		return {
			user: user
		};
	} else {
		redirect(302, `/login`);
	}
}
