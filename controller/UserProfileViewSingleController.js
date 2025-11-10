import { UserProfile } from '../entities/UserProfile.js';
import { AuthorizationHelper } from '../helpers/AuthorizationHelper.js';
import { Permissions } from '../constants/Permissions.js';

export class UserProfileViewSingleController {
  /**
   * Retrieve a UserProfile by roleName.
   */
  async viewProfileByRoleName(sessionToken, roleName) {
    try {
      // Check authorization - must have VIEW_PROFILE permission
      const auth = await AuthorizationHelper.checkPermission(sessionToken, Permissions.VIEW_PROFILE);
      
      if (!auth.authorized) {
        return { success: false, profile: null, message: auth.message };
      }

      const profile = await UserProfile.findByRoleName(roleName);
      
      if (!(profile instanceof UserProfile)) {
        return { 
          success: false, 
          profile: null, 
          message: `UserProfile with roleName '${roleName}' not found.` 
        };
      }

      return { 
        success: true, 
        profile: profile, 
        message: "User profile retrieved successfully" 
      };

    } catch (error) {
      throw new Error(`Failed to retrieve profile: ${error.message}`);
    }
  }
}