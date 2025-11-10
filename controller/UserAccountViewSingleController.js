import { UserAccount } from '../entities/UserAccount.js';
import { AuthorizationHelper } from '../helpers/AuthorizationHelper.js';
import { Permissions } from '../constants/Permissions.js';

/**
 * Controller responsible for retrieving a single user account by ID.
 * Assumes input has been validated by the boundary.
 */
export class UserAccountViewSingleController {
  /**
   * Fetches a single user account from the database.
   */
  async viewSingleUserAccount(sessionToken, userId) {
    try {
      // Check authorization - must have VIEW_USER permission
      const auth = await AuthorizationHelper.checkPermission(sessionToken, Permissions.VIEW_USER);
      
      if (!auth.authorized) {
        return { success: false, account: null, message: auth.message };
      }

      const account = await UserAccount.findById(userId);
      
      if (!(account instanceof UserAccount)) {
        return { 
          success: false, 
          account: null, 
          message: `UserAccount with ID ${userId} not found.` 
        };
      }

      return { 
        success: true, 
        account: account, 
        message: "User account retrieved successfully" 
      };

    } catch (error) {
      throw new Error(`Failed to retrieve user account: ${error.message}`);
    }
  }
}