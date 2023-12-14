import { redirect } from '@sveltejs/kit';
import { auth } from '@src/routes/api/db';
import { validate } from '@src/utils/utils';
import { DEFAULT_SESSION_COOKIE_NAME } from 'lucia';

// // Load function that handles authentication, user validation, and data fetching
// Define load function as async function that takes an event parameter
export async function load(event) {
	// Get session cookie value as string
	const session = event.cookies.get(DEFAULT_SESSION_COOKIE_NAME) as string;
	// Validate user using auth and session value
	const user = await validate(auth, session);
	// If user status is 200, return user object
	if (user.status == 200) {
		return {
			user: user.user
		};
	} else {
		throw redirect(302, `/login`);
	}
}