// lucia
import { luciaVerifyAndReturnUser } from '$lib/server/lucia';

// sveltekit
import { sequence } from '@sveltejs/kit/hooks';
import { systemLanguage } from './stores/store';
import { dbConnect } from '$lib/utils/db';

// typesave-i18n
import { detectLocale, i18n, isLocale } from '$i18n/i18n-util';
import { loadAllLocales } from '$i18n/i18n-util.sync';
import type { Handle, RequestEvent } from '@sveltejs/kit';
import { initAcceptLanguageHeaderDetector } from 'typesafe-i18n/detectors';

loadAllLocales();
const L = i18n();

export const handle: Handle = sequence(dbConnect, async ({ event, resolve }) => {
console.log('auth', event.cookies.getAll());
	event.locals.user = await luciaVerifyAndReturnUser(event);
	

	// read language slug
	const [, lang] = event.url.pathname.split('/');

	// redirect to base locale if no locale slug was found
	if (!lang) {
		const locale = getPreferredLocale(event);

		if (locale == 'en') {
			return resolve(event);
		} else {
			return new Response(null, {
				status: 302,
				headers: { Location: `/${locale}` }
			});
		}
	}

	// if slug is not a locale, use base locale (e.g. api endpoints)
	//const locale = isLocale(lang) ? (lang as Locales) : getPreferredLocale(event)
	const locale = getPreferredLocale(event);
	const LL = L[locale];
	systemLanguage.set(getPreferredLocale(event));

	// bind locale and translation functions to current request
	event.locals.locale = locale;
	event.locals.LL = LL;

	//console.info(LL.log({ fileName: 'hooks.server.ts' }))

	// replace html lang attribute with correct language
	return resolve(event, { transformPageChunk: ({ html }) => html.replace('%lang%', locale) });
});

export const getPreferredLocale = ({ request }: RequestEvent) => {
	// detect the preferred language the user has configured in his browser
	// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Language
	const acceptLanguageDetector = initAcceptLanguageHeaderDetector(request);

	return detectLocale(acceptLanguageDetector);
};
