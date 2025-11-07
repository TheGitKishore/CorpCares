import { UserAccount } from '../entities/UserAccount.js';
import { UserProfile } from '../entities/UserProfile.js';

/**
 * Controller responsible for retrieving all user accounts from the database.
 * Delegates to the UserAccount entity's static method `viewUserAccounts()`.
 * Each account includes a static UserProfile object based on roleName.
 */
export class UserAccountViewController {
  /**
   * Fetches all user accounts from the database.
   * Returns: Array of UserAccount instances with static UserProfile
   * Throws: Error if retrieval fails
   */
  async viewUserAccounts() {
    try {
      const accounts = await UserAccount.viewUserAccounts();
      return accounts;
    } catch (error) {
      throw new Error(`Failed to retrieve user accounts: ${error.message}`);
    }
  }
}