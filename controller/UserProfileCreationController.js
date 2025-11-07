import { UserProfile } from '../entities/UserProfile.js';

export class UserProfileCreationController {
  #profile;

  constructor() {
    this.#profile = null;
  }

  /**
   * Creates a new UserProfile.
   */
  async createUserProfile(roleName, description) {
    try {
      this.#profile = new UserProfile(roleName, description);
      const createdRoleName = await this.#profile.createUserProfile();
      return createdRoleName;
    } catch (error) {
      throw new Error(`User profile creation failed: ${error.message}`);
    }
  }
}