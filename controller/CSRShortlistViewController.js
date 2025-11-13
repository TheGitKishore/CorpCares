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
        console.log('Authorization failed');
        return { success: false, shortlist: null, message: auth.message };
      }

      const csrUser = auth.userAccount;
      console.log(`Fetching shortlist for CSR user with ID: ${csrUser.id}`);

      // Get shortlist for this CSR
      const shortlist = await CSRShortlist.getByCSR(csrUser.id);

      if (!shortlist) {
        console.log('No shortlist found');
        return { 
          success: true, 
          shortlist: { serviceRequests: [] }, // Always return an empty array if no shortlist found
          message: "No shortlist found. Create one by shortlisting your first request." 
        };
      }

      console.log(`Found ${shortlist.serviceRequests.length} shortlisted requests`);

      // Return shortlist object with serviceRequests explicitly placed inside the object
      return { 
        success: true, 
        shortlist: { 
          serviceRequests: shortlist.serviceRequests || []  // Ensure it's always an array
        },
        message: `Found ${shortlist.serviceRequests.length} shortlisted requests` 
      };

    } catch (error) {
      console.error('Error in viewShortlist:', error);
      throw new Error(`Failed to retrieve shortlist: ${error.message}`);
    }
  }
}