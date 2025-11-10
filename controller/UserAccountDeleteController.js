import { UserAccount } from '../entities/UserAccount.js';
import { AuthorizationHelper } from '../helpers/AuthorizationHelper.js';
import { Permissions } from '../constants/Permissions.js';

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
  async deleteUserAccount(sessionToken) {
    try {
      // Check authorization - must have DELETE_USER permission
      const auth = await AuthorizationHelper.checkPermission(sessionToken, Permissions.DELETE_USER);
      
      if (!auth.authorized) {
        return { success: false, message: auth.message };
      }

      const success = await this.#userAccount.deleteUserAccount();
      
      return { 
        success: success, 
        message: success ? "User account deleted successfully" : "Failed to delete user account" 
      };

    } catch (error) {
      throw new Error(`User account deletion failed: ${error.message}`);
    }
  }
}