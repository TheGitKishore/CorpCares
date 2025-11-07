import { UserAccount } from '../entities/UserAccount.js';
import { Password } from '../entities/Password.js';

export class UserAccountCreationController {
  #userAccount;

  constructor() {
    this.#userAccount = null;
  }

  async createUserAccount(username, rawPassword, profile, email, name) {
    try {
      const passwordHash = new Password(String(rawPassword));
      this.#userAccount = new UserAccount(username, name, passwordHash, email, profile);

      const userId = await this.#userAccount.createUserAccount();
      return userId;
    } catch (error) {
      throw new Error(`User account creation failed: ${error.message}`);
    }
  }
}