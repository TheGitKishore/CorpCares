import { UserAccount } from '../entities/UserAccount.js';
import { Password } from '../entities/Password.js';
import { UserProfile } from '../entities/UserProfile.js';
import { AuthorizationHelper } from '../helpers/AuthorizationHelper.js';
import { Permissions } from '../constants/Permissions.js';

export class UserAccountCreationController {
  #userAccount;

  constructor() {
    this.#userAccount = null;
  }

  /**
   * Creates a new UserAccount.
   * Hydrates UserProfile dynamically by roleName.
   */
  async createUserAccount(sessionToken, username, rawPassword, roleName, email, name) {
    try {
      // Check authorization - must have CREATE_USER permission
      const auth = await AuthorizationHelper.checkPermission(sessionToken, Permissions.CREATE_USER);
      
      if (!auth.authorized) {
        return { success: false, userId: null, message: auth.message };
      }

      // Find profile
      const profile = await UserProfile.findByRoleName(roleName);
      if (!profile) {
        return { 
          success: false, 
          userId: null, 
          message: `UserProfile with roleName '${roleName}' not found.` 
        };
      }

      const passwordHash = new Password(String(rawPassword));
      this.#userAccount = new UserAccount(username, name, passwordHash, email, profile);

      const userId = await this.#userAccount.createUserAccount();
      
      return { 
        success: true, 
        userId: userId, 
        message: "User account created successfully" 
      };

    } catch (error) {
      throw new Error(`User account creation failed: ${error.message}`);
    }
  }
}