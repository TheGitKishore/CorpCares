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
   */
  async updateUserProfile(description) {
    try {
      if (!description) {
        throw new Error("Description is required.");
      }
      const success = await this.#profile.updateUserProfile(description);
      return success;
    } catch (error) {
      throw new Error(`User profile update failed: ${error.message}`);
    }
  }
}