import { UserProfile } from '../entities/UserProfile.js';
import { AuthorizationHelper } from '../helpers/AuthorizationHelper.js';
import { Permissions } from '../constants/Permissions.js';

export class UserProfileViewAllController {
  /**
   * Retrieve all UserProfiles.
   */
  async viewAllProfiles(sessionToken) {
    try {
      // Check authorization - must have VIEW_ALL_PROFILES permission
      const auth = await AuthorizationHelper.checkPermission(sessionToken, Permissions.VIEW_ALL_PROFILES);
      
      if (!auth.authorized) {
        return { success: false, profiles: null, message: auth.message };
      }

      const profiles = await UserProfile.viewAllUserProfiles();
      
      return { 
        success: true, 
        profiles: profiles, 
        message: `Found ${profiles.length} user profiles` 
      };

    } catch (error) {
      throw new Error(`Failed to retrieve profiles: ${error.message}`);
    }
  }
}