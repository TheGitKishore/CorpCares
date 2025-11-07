import { UserProfile } from '../entities/UserProfile.js';

export class UserProfileViewSingleController {
  /**
   * Retrieve a UserProfile by roleName.
   */
  async viewProfileByRoleName(roleName) {
    try {
      const profile = await UserProfile.findByRoleName(roleName);
      if (!(profile instanceof UserProfile)) {
        throw new Error(`UserProfile with roleName '${roleName}' not found.`);
      }
      return profile;
    } catch (error) {
      throw new Error(`Failed to retrieve profile: ${error.message}`);
    }
  }
}