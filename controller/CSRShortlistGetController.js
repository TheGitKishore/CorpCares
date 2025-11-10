import { CSRShortlist } from '../entities/CSRShortlist.js';
import { AuthorizationHelper } from '../helpers/AuthorizationHelper.js';
import { Permissions } from '../constants/Permissions.js';

export class CSRShortlistGetController {

  /**
   * Get or create shortlist for the logged-in CSR Rep
   * Returns the CSRShortlist with all items loaded
   */
  async getShortlist(sessionToken) {
    try {
      // Check authorization - must have VIEW_SHORTLISTED_REQUESTS permission
      const auth = await AuthorizationHelper.checkPermission(sessionToken, Permissions.VIEW_SHORTLISTED_REQUESTS);
      
      if (!auth.authorized) {
        return { success: false, shortlist: null, message: auth.message };
      }

      const csrUser = auth.userAccount;

      // Try to find existing shortlist
      let shortlist = await CSRShortlist.getByCSR(csrUser.id);

      // If none exists, create one
      if (!shortlist) {
        shortlist = new CSRShortlist(csrUser);
        await shortlist.createShortlist();
      }

      return { 
        success: true, 
        shortlist: shortlist,
        message: "Shortlist retrieved successfully" 
      };

    } catch (error) {
      throw new Error(`Failed to retrieve shortlist: ${error.message}`);
    }
  }
}