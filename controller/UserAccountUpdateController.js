import { UserAccount } from '../entities/UserAccount.js';
import { Password } from '../entities/Password.js';
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

  async updateUserAccount(name, email, rawPassword, profile, isActive) {
    try {
      if (!name || !email || !profile) {
        throw new Error("Missing required fields.");
      }

      if (!(profile instanceof UserProfile)) {
        throw new TypeError("Expected profile to be an instance of UserProfile.");
      }

      if (rawPassword == null) {
        throw new TypeError("Password cannot be null or undefined.");
      }

      if (typeof isActive !== 'boolean') {
        throw new TypeError("isActive must be a boolean.");
      }

      const success = await this.#userAccount.updateUserAccount(
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

// Example boundary usage
// const controller = await UserAccountUpdateController.findById(userId);
// await controller.updateUserAccount(name, email, rawPassword, profile, isActive);