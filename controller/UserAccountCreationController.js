import { UserAccount } from '../entities/UserAccount.js';
import { Password } from '../entities/Password.js';
import { UserProfile } from '../entities/UserProfile.js';

export class UserAccountCreationController {
  #userAccount;

  constructor() {
    this.#userAccount = null;
  }

  /**
   * Creates a new UserAccount.
   * Hydrates UserProfile dynamically by roleName.
   */
  async createUserAccount(username, rawPassword, roleName, email, name) {
    try {
      const profile = await UserProfile.findByRoleName(roleName);
      if (!profile) {
        throw new Error(`UserProfile with roleName '${roleName}' not found.`);
      }

      const passwordHash = new Password(String(rawPassword));
      this.#userAccount = new UserAccount(username, name, passwordHash, email, profile);

      const userId = await this.#userAccount.createUserAccount();
      return userId;
    } catch (error) {
      throw new Error(`User account creation failed: ${error.message}`);
    }
  }
}