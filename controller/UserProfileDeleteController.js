import { UserProfile } from '../entities/UserProfile.js';
import { AuthorizationHelper } from '../helpers/AuthorizationHelper.js';
import { Permissions } from '../constants/Permissions.js';

export class UserProfileDeleteController {
  #profile;

  constructor(profile) {
    this.#profile = profile;
  }

  static async findByRoleName(roleName) {
    const profile = await UserProfile.findByRoleName(roleName);
    if (!(profile instanceof UserProfile)) {
      throw new Error(`UserProfile with roleName '${roleName}' not found.`);
    }
    return new UserProfileDeleteController(profile);
  }

  async deleteUserProfile(sessionToken) {
    try {
      // Check authorization - must have DELETE_PROFILE permission
      const auth = await AuthorizationHelper.checkPermission(sessionToken, Permissions.DELETE_PROFILE);
      
      if (!auth.authorized) {
        return { success: false, message: auth.message };
      }

      const success = await this.#profile.deleteUserProfile();
      
      return { 
        success: success, 
        message: success ? "User profile deleted successfully" : "Failed to delete user profile" 
      };

    } catch (error) {
      throw new Error(`User profile deletion failed: ${error.message}`);
    }
  }
}