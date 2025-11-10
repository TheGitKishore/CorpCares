import { CSRShortlist } from '../entities/CSRShortlist.js';
import { AuthorizationHelper } from '../helpers/AuthorizationHelper.js';
import { Permissions } from '../constants/Permissions.js';

export class CSRShortlistViewController {

  /**
   * View the logged-in CSR Rep's shortlist with all shortlisted service requests
   * Returns the full CSRShortlist entity with loaded items
   */
  async viewShortlist(sessionToken) {
    try {
      // Check authorization - must have VIEW_SHORTLISTED_REQUESTS permission
      const auth = await AuthorizationHelper.checkPermission(sessionToken, Permissions.VIEW_SHORTLISTED_REQUESTS);
      
      if (!auth.authorized) {
        return { success: false, shortlist: null, message: auth.message };
      }

      const csrUser = auth.userAccount;

      // Get shortlist for this CSR
      const shortlist = await CSRShortlist.getByCSR(csrUser.id);

      if (!shortlist) {
        return { 
          success: true, 
          shortlist: null,
          message: "No shortlist found. Create one by shortlisting your first request." 
        };
      }

      return { 
        success: true, 
        shortlist: shortlist,
        message: `Found ${shortlist.serviceRequests.length} shortlisted requests` 
      };

    } catch (error) {
      throw new Error(`Failed to retrieve shortlist: ${error.message}`);
    }
  }
}