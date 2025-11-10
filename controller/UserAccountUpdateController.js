import { UserAccount } from '../entities/UserAccount.js';
import { UserProfile } from '../entities/UserProfile.js';
import { AuthorizationHelper } from '../helpers/AuthorizationHelper.js';
import { Permissions } from '../constants/Permissions.js';

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
  async updateUserAccount(sessionToken, username, name, email, rawPassword, roleName, isActive) {
    try {
      // Check authorization - must have UPDATE_USER permission
      const auth = await AuthorizationHelper.checkPermission(sessionToken, Permissions.UPDATE_USER);
      
      if (!auth.authorized) {
        return { success: false, message: auth.message };
      }

      // Find profile
      const profile = await UserProfile.findByRoleName(roleName);
      if (!profile) {
        return { 
          success: false, 
          message: `UserProfile with roleName '${roleName}' not found.` 
        };
      }

      const success = await this.#userAccount.updateUserAccount(
        username,
        name,
        email,
        rawPassword,
        profile,
        isActive
      );

      return { 
        success: success, 
        message: success ? "User account updated successfully" : "Failed to update user account" 
      };

    } catch (error) {
      throw new Error(`User account update failed: ${error.message}`);
    }
  }
}