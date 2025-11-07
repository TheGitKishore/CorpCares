import { UserProfile } from '../entities/UserProfile.js';

export class UserProfileViewAllController {
  /**
   * Retrieve all UserProfiles.
   */
  async viewAllProfiles() {
    try {
      const profiles = await UserProfile.viewAllUserProfiles();
      return profiles;
    } catch (error) {
      throw new Error(`Failed to retrieve profiles: ${error.message}`);
    }
  }
}