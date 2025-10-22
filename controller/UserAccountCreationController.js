import { UserAccount } from '../entities/UserAccount.js';
import { Password } from '../entities/Password.js';
import { UserProfile } from '../entities/UserProfile.js';

export class UserAccountCreationController {
  #userAccount;

  constructor() {
    this.#userAccount = null;
  }

  createUserAccount(username, rawPassword, profile, email, name) {
    try {
      // Validate required fields before proceeding
      if (!username || !email || !rawPassword || !profile) {
        throw new Error("Missing required fields.");
      }

      // Ensure profile is a valid UserProfile instance
      if (!(profile instanceof UserProfile)) {
        throw new TypeError("Expected Profile to be an instance of UserProfile.");
      }

      if (rawPassword == null) {
      throw new TypeError("Password cannot be null or undefined");
      }

      // Create a Password object to hash and encapsulate the password
      const password = String(rawPassword)
      const passwordHash = new Password(password);

      // Create the UserAccount entity with hashed password and profile
      this.#userAccount = new UserAccount(username, name, passwordHash, email, profile);

      // Return the generated ID (via getter)
      return this.#userAccount.id;
    } catch (error) {
      // Wrap and rethrow with contextual message
      throw new Error(`User account creation failed: ${error.message}`);
    }
  }
}

//To add:
//Validate duplicate usernames
