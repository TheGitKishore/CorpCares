import { UserProfile } from '../entities/UserProfile.js';
import { AuthorizationHelper } from '../helpers/AuthorizationHelper.js';
import { Permissions } from '../constants/Permissions.js';

export class UserProfileCreationController {
  #profile;

  constructor() {
    this.#profile = null;
  }

  /**
   * Creates a new UserProfile.
   */
  async createUserProfile(sessionToken, roleName, description, permissions = []) {
    try {
      // Check authorization - must have CREATE_PROFILE permission
      const auth = await AuthorizationHelper.checkPermission(sessionToken, Permissions.CREATE_PROFILE);
      
      if (!auth.authorized) {
        return { success: false, roleName: null, message: auth.message };
      }

      this.#profile = new UserProfile(roleName, description, permissions);
      const createdRoleName = await this.#profile.createUserProfile();
      
      return { 
        success: true, 
        roleName: createdRoleName, 
        message: "User profile created successfully" 
      };

    } catch (error) {
      throw new Error(`User profile creation failed: ${error.message}`);
    }
  }
}