import { UserAccount } from '../entities/UserAccount.js';
import { Password } from '../entities/Password.js';

/**
 * Controller responsible for authenticating users.
 */
export class UserAdminLoginController {
  #userAccount;

  constructor(userAccount) {
    this.#userAccount = userAccount;
  }

  /**
   * Authenticates a user by username and raw password.
   */
  static async authenticate(username, rawPassword) {
    if (!username || !rawPassword) {
      throw new Error("Username and password are required.");
    }

    const userAccount = await UserAccount.findByUsername(username);
    if (!(userAccount instanceof UserAccount)) {
      throw new Error(`User '${username}' not found.`);
    }

    const storedPassword = Password.fromHash(userAccount.passwordHash);
    const passwordValid = storedPassword.verify(rawPassword);
    if (!passwordValid) {
      throw new Error("Invalid password.");
    }

    return new UserAdminLoginController(userAccount);
  }

  /**
   * Returns the authenticated user's profile.
   */
  getAuthenticatedUser() {
    return this.#userAccount;
  }
}