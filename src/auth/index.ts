export const SESSION_COOKIE_NAME = 'auth_sessions';
import crypto from 'crypto';
import { consumeToken, createToken, validateToken } from './tokens';
import type { Cookie, User, UserParams, Session, Model } from './types';

export class Auth {
	private User: Model;
	private Token: Model;
	private Session: Model;

	constructor({ User, Token, Session }) {
		// Initialize the User, Token, and Session models
		this.User = User;
		this.Token = Token;
		this.Session = Session;
	}

	async createUser({ email, password, username, role, lastAuthMethod, is_registered }: Omit<User, UserParams>) {
		try {
			// Generate a unique ID for the user
			const id = crypto.createHash('sha256').update(email).digest('hex').slice(0, 15);

			// Hash the password
			let hashed_password: string | undefined = undefined;
			if (password) hashed_password = crypto.createHash('sha256').update(password).digest('hex');

			// Create the user document
			const user = (
				await this.User.insertMany({
					id,
					email,
					password: hashed_password,
					username,
					role,
					lastAuthMethod,
					is_registered
				})
			)?.[0];

			// Delete the _id field from the user object
			user._id && delete user._id;

			// Return the user object
			return user as User;
		} catch (err) {
			console.error(err);
			throw new Error('Error creating user');
		}
	}

	async updateUserAttributes(user: User, attributes: Partial<User>) {
		// Hash the password if it was provided
		if (attributes.password) attributes.password = crypto.createHash('sha256').update(attributes.password).digest('hex');

		// Update the user document
		await this.User.updateOne({ id: user.id }, { $set: attributes });
	}

	async deleteUser(id: string) {
		// Delete the user document
		await this.User.deleteOne({ id });
	}

	async createSession({ user_id, expires = 60 * 60 * 1000 }: { user_id: string; expires?: number }) {
		// Generate a unique ID for the session
		const id = crypto
			.createHash('sha256')
			.update(user_id + new Date().getTime().toString())
			.digest('hex')
			.slice(0, 16);

		// Create the session document
		const session = (
			await this.Session.insertMany({
				id,
				user_id,
				expires: Date.now() + expires
			})
		)?.[0];

		// Return the session object with the ID field renamed to `id`
		return session as typeof session & { id: string };
	}

	async checkUser(fields: { email?: string; id?: string }): Promise<User | null>;
	async checkUser(fields: { email: string; id: string }): Promise<User | null> {
		// Find the user document
		const user = await this.User.findOne(fields);

		// Return the user object or null if not found
		return user;
	}

	async getUserCount(): Promise<number> {
		// Get the number of user documents
		return await this.User.countDocuments();
	}

	async getAllUsers(): Promise<User[]> {
		// Find all user documents
		return await this.User.find({});
	}

	async destroySession(session_id: string) {
		// Delete the session document
		await this.Session.deleteOne({ id: session_id });
	}

	createSessionCookie(session: Session): Cookie {
		// Create a cookie object
		const cookie: Cookie = {
			name: SESSION_COOKIE_NAME,
			value: session.id,
			attributes: {
				sameSite: 'lax',
				path: '/',
				httpOnly: true,
				expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
				secure: true
			}
		};

		// Return the cookie object
		return cookie;
	}

	async login(email: string, password: string): Promise<User | null> {
		// Hash the password
		const hashed_password = crypto.createHash('sha256').update(password).digest('hex');

		// Find the user document
		const user = await this.User.findOne({ email, password: hashed_password });

		// Delete the _id field from the user object
		user && delete user._id;

		// Return the user object or null if not found
		return user as User;
	}

	async logOut(session_id: string) {
		// Delete the session document
		await this.Session.deleteOne({ id: session_id });
	}

	async validateSession(session_id: string): Promise<User | null> {
		// Aggregate the Session collection to join with the User collection
		const resp = (
			await this.Session.aggregate([
				{
					$match: {
						id: session_id
					}
				},
				{
					$lookup: {
						from: this.User.collection.name,
						localField: 'user_id',
						foreignField: 'id',
						as: 'user'
					}
				},
				{
					$unwind: '$user'
				}
			])
		)?.[0];

		// If no session was found, return null
		if (!resp) return null;

		// Delete the _id field from the user object
		resp.user._id && delete resp.user._id;

		// Return the user object
		return resp.user;
	}

	async createToken(user_id: string, expires = 60 * 60 * 1000) {
		// Create a token
		return await createToken(this.Token, user_id, expires);
	}

	async validateToken(token: string, user_id: string) {
		// Validate the token
		return await validateToken(this.Token, token, user_id);
	}

	async consumeToken(token, user_id) {
		// Consume the token
		return await consumeToken(this.Token, token, user_id);
	}

	async invalidateAllUserSessions(user_id: string) {
		// Get all sessions for the given user ID
		const sessions = await this.Session.find({ user_id });

		// Delete all the sessions
		await Promise.all(sessions.map((session) => this.Session.deleteOne({ _id: session._id })));
	}

	async updateKeyPassword(providerId: string, providerUserId: string, newPassword: string) {
		// Get the key document for the given provider ID and provider user ID
		const user = await this.User.findOne({ providerId, providerUserId });

		// If no key was found, return an error
		if (!user) {
			return { status: false, message: 'Key not found' };
		}

		// Update the password for the key
		user.password = newPassword;

		// Save the updated key document
		await user.save();

		// Return a success message
		return { status: true, message: 'Password updated successfully' };
	}
}
