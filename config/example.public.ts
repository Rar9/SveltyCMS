import { createPublicConfig } from './types';

/**
 * The PUBLIC configuration for the application,
 * if changes are made please rebuild/restart your instance
 */
export const publicEnv = createPublicConfig({
	// The name of the site that this CMS should get.  (default: 'SveltyCMS')
	SITE_NAME: 'SveltyCMS',

	// The default language for the site. (default: 'en')
	DEFAULT_CONTENT_LANGUAGE: 'en',

	// The available languages for the site. (default: 'en', 'de')
	AVAILABLE_CONTENT_LANGUAGES: ['en', 'de'],

	// The default language for the user interface.  (default: 'en')
	DEFAULT_SYSTEM_LANGUAGE: 'en',

	// The available languages for the user interface. Restrict if Required (default: all).
	AVAILABLE_SYSTEM_LANGUAGES: ['en', 'de', 'es', 'fr', 'it', 'nl', 'pl', 'pt', 'hi', 'ka', 'sr', 'tr', 'ur', 'ne'],

	// The sizes of images that the site will generate. (default: 'sm: 600, md: 900, lg: 1200')
	IMAGE_SIZES: { sm: 600, md: 900, lg: 1200 } as const,

	// The folder where the site's media files will be stored. (default: 'mediaFiles')
	MEDIA_FOLDER: 'mediaFiles',

	// Format in where media files are saved on the server. (default: 'original')
	MEDIA_OUTPUT_FORMAT: 'original', // 'avif', 'webp', or 'original'

	// Defines body size limit (default: 100mb)
	BODY_SIZE_LIMIT: 104857600,

	// Define you hostname where you site is running in development/production
	HOST_DEV: 'http://localhost:5173',
	HOST_PROD: 'https://yourdomain.de',

	// Seasons/Events for login page (default: false)
	SEASONS: false, // Set to true to enable seasonal decorations
	SEASON_REGION: 'Europe' // Currently only 'Europe' is supported
});
