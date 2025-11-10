import { CSRSavedRequest } from '../entities/CSRSavedRequest.js';
import { AuthorizationHelper } from '../helpers/AuthorizationHelper.js';
import { Permissions } from '../constants/Permissions.js';

export class CSRSavedViewController {

  /**
   * View the logged-in CSR Rep's saved list with all saved service requests
   * Returns the full CSRSavedRequest entity with loaded items
   */
  async viewSaved(sessionToken) {
    try {
      // Check authorization - must have VIEW_SAVED_REQUESTS permission
      const auth = await AuthorizationHelper.checkPermission(sessionToken, Permissions.VIEW_SAVED_REQUESTS);
      
      if (!auth.authorized) {
        return { success: false, savedList: null, message: auth.message };
      }

      const csrUser = auth.userAccount;

      // Get saved list for this CSR
      const savedList = await CSRSavedRequest.getByCSR(csrUser.id);

      if (!savedList) {
        return { 
          success: true, 
          savedList: null,
          message: "No saved list found. Create one by saving your first request." 
        };
      }

      return { 
        success: true, 
        savedList: savedList,
        message: `Found ${savedList.serviceRequests.length} saved requests` 
      };

    } catch (error) {
      throw new Error(`Failed to retrieve saved list: ${error.message}`);
    }
  }
}