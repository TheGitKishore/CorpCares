import { UserAccount } from '../entities/UserAccount.js';

export class UserAccountDeleteController {
  #userAccount;

  constructor(userAccount) {
    this.#userAccount = userAccount;
  }

  /**
   * Hydrates controller with entity by userID.
   */
  static async findById(userId) {
    if (!userId || typeof userId !== 'number') {
      throw new TypeError("Invalid or missing userId.");
    }

    const userAccount = await UserAccount.findById(userId);
    if (!(userAccount instanceof UserAccount)) {
      throw new Error(`UserAccount with ID ${userId} not found.`);
    }

    return new UserAccountDeleteController(userAccount);
  }

  /**
   * Deletes the hydrated user account.
   */
  async deleteUserAccount() {
    try {
      const success = await this.#userAccount.deleteUserAccount();
      return success;
    } catch (error) {
      throw new Error(`User account deletion failed: ${error.message}`);
    }
  }
}

// Example Boundary Usage
// const controller = await UserAccountDeleteController.findById(userId);
// await controller.deleteUserAccount();