import { UserAccount } from '../entities/UserAccount.js';
import { UserProfile } from '../entities/UserProfile.js';

export class UserAccountUpdateController {
  #userAccount;

  constructor(userAccount) {
    this.#userAccount = userAccount;
  }

  static async findById(userId) {
    if (!userId || typeof userId !== 'number') {
      throw new TypeError("Invalid or missing userId.");
    }

    const userAccount = await UserAccount.findById(userId);
    if (!(userAccount instanceof UserAccount)) {
      throw new Error(`UserAccount with ID ${userId} not found.`);
    }

    return new UserAccountUpdateController(userAccount);
  }

  async updateUserAccount(username, name, email, rawPassword, profile, isActive) {
    try {
      if (!username || !name || !email || !profile || rawPassword == null || typeof isActive !== 'boolean') {
        throw new Error("Missing or invalid fields.");
      }

      const success = await this.#userAccount.updateUserAccount(
        username,
        name,
        email,
        rawPassword,
        profile,
        isActive
      );

      return success;
    } catch (error) {
      throw new Error(`User account update failed: ${error.message}`);
    }
  }
}