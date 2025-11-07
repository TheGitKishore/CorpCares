import { UserAccount } from '../entities/UserAccount.js';

/**
 * Controller responsible for retrieving a single user account by ID.
 * Assumes input has been validated by the boundary.
 */
export class UserAccountViewSingleController {
  /**
   * Fetches a single user account from the database.
   */
  async viewUserAccountById(userId) {
    try {
      const account = await UserAccount.findById(userId);
      if (!(account instanceof UserAccount)) {
        throw new Error(`UserAccount with ID ${userId} not found.`);
      }
      return account;
    } catch (error) {
      throw new Error(`Failed to retrieve user account: ${error.message}`);
    }
  }
}