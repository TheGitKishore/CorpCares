import { CSRShortlist } from '../entities/CSRShortlist.js';
import { AuthorizationHelper } from '../helpers/AuthorizationHelper.js';
import { Permissions } from '../constants/Permissions.js';

export class CSRShortlistCheckController {

  /**
   * Check if a specific service request is in the logged-in CSR's shortlist
   * Returns boolean indicating if the request is shortlisted
   */
  async checkIfShortlisted(sessionToken, serviceRequestId) {
    try {
      // Check authorization - must have VIEW_SHORTLISTED_REQUESTS permission
      const auth = await AuthorizationHelper.checkPermission(sessionToken, Permissions.VIEW_SHORTLISTED_REQUESTS);
      
      if (!auth.authorized) {
        return { success: false, isShortlisted: false, message: auth.message };
      }

      const csrUser = auth.userAccount;

      // Get shortlist
      const shortlist = await CSRShortlist.getByCSR(csrUser.id);

      if (!shortlist) {
        return { 
          success: true, 
          isShortlisted: false,
          message: "No shortlist exists yet" 
        };
      }

      // Check if service request is in the shortlist
      const isShortlisted = shortlist.serviceRequests.some(
        item => item.serviceRequestId === serviceRequestId
      );

      return { 
        success: true, 
        isShortlisted: isShortlisted,
        message: isShortlisted ? "Request is in your shortlist" : "Request is not in your shortlist" 
      };

    } catch (error) {
      throw new Error(`Failed to check shortlist status: ${error.message}`);
    }
  }
}