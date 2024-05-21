import { privateEnv } from '@root/config/private';

// Store
import { collections } from '@stores/store';
import type { Unsubscriber } from 'svelte/store';

// Mongoose
import mongoose from 'mongoose';
import type { databaseAdapter } from './databaseAdapter';
import { mongooseSessionSchema, mongooseTokenSchema, mongooseUserSchema } from '@src/auth/types';

export class MongoDBAdapter implements databaseAdapter {
	private unsubscribe: Unsubscriber | undefined;

	// Connect to MongoDB database using imported environment variables
	async connect(): Promise<void> {
		console.log(`\n\x1b[33m\x1b[5m====> Trying to Connect to your defined ${privateEnv.DB_NAME} database ...\x1b[0m`);
		try {
			await mongoose.connect(privateEnv.DB_HOST, {
				authSource: 'admin',
				user: privateEnv.DB_USER,
				pass: privateEnv.DB_PASSWORD,
				dbName: privateEnv.DB_NAME
			});
			console.log(`\x1b[32m====> Connection to ${privateEnv.DB_NAME} database successful!\x1b[0m`);
		} catch (error) {
			console.error('\x1b[31mError connecting to database:\x1b[0m', error);
			throw new Error('Error connecting to database');
		}
	}

	// Set up collections in the database using imported schemas
	async getCollectionModels(): Promise<any> {
		return new Promise<any>((resolve) => {
			this.unsubscribe = collections.subscribe((collections) => {
				if (collections) {
					const collectionsModels: { [key: string]: mongoose.Model<any> } = {};

					collections.forEach((collection) => {
						if (!collection.name) return;

						// Create a detailed revisions schema
						const RevisionSchema = new mongoose.Schema(
							{
								revisionNumber: { type: Number, default: 0 },
								editedAt: { type: Date, default: Date.now },
								editedBy: { type: String, default: 'System' },
								changes: { type: Object, default: {} }
							},
							{ _id: false }
						);

						// Create a new mongoose schema using the collection's fields and timestamps
						const schemaObject = new mongoose.Schema(
							{
								createdAt: Date,
								updatedAt: Date,
								createdBy: String,
								__v: [RevisionSchema], // versionKey
								translationStatus: {}
							},
							{
								typeKey: '$type',
								strict: false,
								timestamps: true // Use the default Mongoose timestamp
							}
						);

						// Add the mongoose model for the collection to the collectionsModels object
						collectionsModels[collection.name] = mongoose.models[collection.name] || mongoose.model(collection.name, schemaObject);
					});

					this.unsubscribe && this.unsubscribe();
					this.unsubscribe = undefined;
					resolve(collectionsModels);
				}
			});
		});
	}

	// Set up authentication collections if they don't already exist
	setupAuthModels(): void {
		if (!mongoose.models['auth_tokens']) {
			mongoose.model('auth_tokens', mongooseTokenSchema);
		}
		if (!mongoose.models['auth_users']) {
			mongoose.model('auth_users', mongooseUserSchema);
		}
		if (!mongoose.models['auth_sessions']) {
			mongoose.model('auth_sessions', mongooseSessionSchema);
		}
	}

	// Set up Media collections if they don't already exist
	setupMediaModels(): void {
		const mediaSchemas = ['media_images', 'media_documents', 'media_audio', 'media_videos', 'media_remote'];
		mediaSchemas.forEach((schemaName) => {
			if (!mongoose.models[schemaName]) {
				mongoose.model(schemaName, new mongoose.Schema({}, { typeKey: '$type', strict: false, timestamps: true }));
			}
		});
	}
}
