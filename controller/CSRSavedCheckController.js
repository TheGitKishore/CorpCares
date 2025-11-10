import { CSRSavedRequest } from '../entities/CSRSavedRequest.js';
import { AuthorizationHelper } from '../helpers/AuthorizationHelper.js';
import { Permissions } from '../constants/Permissions.js';

export class CSRSavedCheckController {

  /**
   * Check if a specific service request is in the logged-in CSR's saved list
   * Returns boolean indicating if the request is saved
   */
  async checkIfSaved(sessionToken, serviceRequestId) {
    try {
      // Check authorization - must have VIEW_SAVED_REQUESTS permission
      const auth = await AuthorizationHelper.checkPermission(sessionToken, Permissions.VIEW_SAVED_REQUESTS);
      
      if (!auth.authorized) {
        return { success: false, isSaved: false, message: auth.message };
      }

      const csrUser = auth.userAccount;

      // Get saved list
      const savedList = await CSRSavedRequest.getByCSR(csrUser.id);

      if (!savedList) {
        return { 
          success: true, 
          isSaved: false,
          message: "No saved list exists yet" 
        };
      }

      // Check if service request is in the saved list
      const isSaved = savedList.serviceRequests.some(
        item => item.serviceRequestId === serviceRequestId
      );

      return { 
        success: true, 
        isSaved: isSaved,
        message: isSaved ? "Request is in your saved list" : "Request is not in your saved list" 
      };

    } catch (error) {
      throw new Error(`Failed to check save status: ${error.message}`);
    }
  }
}