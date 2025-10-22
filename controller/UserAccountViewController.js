import { UserAccount } from '../entities/UserAccount.js';

/**
 * Controller responsible for retrieving all user accounts from the database.
 * Delegates to the UserAccount entity's static method `viewUserAccounts()`.
 */
export class UserAccountViewController {
  /**
   * Fetches all user accounts from the database.
   * returns  Array of UserAccount instances
   * throws error If retrieval fails
   */
  async viewUserAccounts() {
    try {
      // Call the entity's static method to retrieve all accounts
      const accounts = await UserAccount.viewUserAccounts();

      // Return the list to the boundary or caller
      return accounts;
    } catch (error) {
      // Wrap and rethrow with contextual message
      throw new Error(`Failed to retrieve user accounts: ${error.message}`);
    }
  }
}