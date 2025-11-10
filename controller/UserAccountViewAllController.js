import { UserAccount } from '../entities/UserAccount.js';
import { AuthorizationHelper } from '../helpers/AuthorizationHelper.js';
import { Permissions } from '../constants/Permissions.js';

/**
 * Controller responsible for retrieving all user accounts from the database.
 * Delegates to the UserAccount entity's static method `viewUserAccounts()`.
 * Each account includes a static UserProfile object based on roleName.
 */
export class UserAccountViewAllController {
  /**
   * Fetches all user accounts from the database.
   * Returns: Array of UserAccount instances with static UserProfile
   * Throws: Error if retrieval fails
   */
  async viewUserAccounts(sessionToken) {
    try {
      // Check authorization - must have VIEW_ALL_USERS permission
      const auth = await AuthorizationHelper.checkPermission(sessionToken, Permissions.VIEW_ALL_USERS);
      
      if (!auth.authorized) {
        return { success: false, accounts: null, message: auth.message };
      }

      const accounts = await UserAccount.viewUserAccounts();
      
      return { 
        success: true, 
        accounts: accounts, 
        message: `Found ${accounts.length} user accounts` 
      };

    } catch (error) {
      throw new Error(`Failed to retrieve user accounts: ${error.message}`);
    }
  }
}