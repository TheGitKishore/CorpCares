import { UserAccount } from '../entities/UserAccount.js';
import { Password } from '../entities/Password.js';
import { UserProfile } from '../entities/UserProfile.js';

export class UserAccountCreationController {
  #userAccount;

  constructor() {
    this.#userAccount = null;
  }

  async createUserAccount(username, rawPassword, profile, email, name) {
    try {
      // Validate required fields
      if (!username || !email || !rawPassword || !profile) {
        throw new Error("Missing required fields.");
      }

      if (!(profile instanceof UserProfile)) {
        throw new TypeError("Expected profile to be an instance of UserProfile.");
      }

      if (rawPassword == null) {
        throw new TypeError("Password cannot be null or undefined");
      }

      // Check for duplicate username using static method on the entity
      const exists = await UserAccount.existsByUsername(username);
      if (exists) {
        throw new Error(`Username '${username}' is already taken.`);
      }

      // Create the UserAccount entity
      const passwordHash = new Password(String(rawPassword));
      this.#userAccount = new UserAccount(username, name, passwordHash, email, profile);

      // Persist using the entity's own method
      const userId = await this.#userAccount.createUserAccount();

      return userId;
    } catch (error) {
      throw new Error(`User account creation failed: ${error.message}`);
    }
  }
}