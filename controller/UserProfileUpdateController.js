import { UserProfile } from '../entities/UserProfile.js';

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
   * Allows updating both roleName and description.
   */
  async updateUserProfile(newRoleName, newDescription) {
    try {
      const success = await this.#profile.updateUserProfile(newRoleName, newDescription);
      return success;
    } catch (error) {
      throw new Error(`User profile update failed: ${error.message}`);
    }
  }
}