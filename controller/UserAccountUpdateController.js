import { UserAccount } from '../entities/UserAccount.js';
import { UserProfile } from '../entities/UserProfile.js';

export class UserAccountUpdateController {
  #userAccount;

  constructor(userAccount) {
    this.#userAccount = userAccount;
  }

  /**
   * Hydrate controller with an existing UserAccount by ID.
   */
  static async findById(userId) {
    const userAccount = await UserAccount.findById(userId);
    if (!(userAccount instanceof UserAccount)) {
      throw new Error(`UserAccount with ID ${userId} not found.`);
    }
    return new UserAccountUpdateController(userAccount);
  }

  /**
   * Update the hydrated UserAccount.
   * Hydrates UserProfile dynamically by roleName.
   */
  async updateUserAccount(username, name, email, rawPassword, roleName, isActive) {
    try {
      const profile = await UserProfile.findByRoleName(roleName);
      if (!profile) {
        throw new Error(`UserProfile with roleName '${roleName}' not found.`);
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