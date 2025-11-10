import { UserProfile } from '../entities/UserProfile.js';
import { AuthorizationHelper } from '../helpers/AuthorizationHelper.js';
import { Permissions } from '../constants/Permissions.js';

export class UserProfileUpdateController {
  #profile;

  constructor(profile) {
    this.#profile = profile;
  }

  /**
   * Hydrate controller with an existing UserProfile by roleName.
   */
  static async findByRoleName(roleName) {
    const profile = await UserProfile.findByRoleName(roleName);
    if (!(profile instanceof UserProfile)) {
      throw new Error(`UserProfile with roleName '${roleName}' not found.`);
    }
    return new UserProfileUpdateController(profile);
  }

  /**
   * Update the hydrated UserProfile.
   * Allows updating roleName, description, and permissions.
   */
  async updateUserProfile(sessionToken, newRoleName, newDescription, newPermissions) {
    try {
      // Check authorization - must have UPDATE_PROFILE permission
      const auth = await AuthorizationHelper.checkPermission(sessionToken, Permissions.UPDATE_PROFILE);
      
      if (!auth.authorized) {
        return { success: false, message: auth.message };
      }

      const success = await this.#profile.updateUserProfile(newRoleName, newDescription, newPermissions);
      
      return { 
        success: success, 
        message: success ? "User profile updated successfully" : "Failed to update user profile" 
      };

    } catch (error) {
      throw new Error(`User profile update failed: ${error.message}`);
    }
  }
}