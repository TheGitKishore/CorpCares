import { CSRSavedRequest } from '../entities/CSRSavedRequest.js';
import { AuthorizationHelper } from '../helpers/AuthorizationHelper.js';
import { Permissions } from '../constants/Permissions.js';

export class CSRSavedGetController {

  /**
   * Get or create saved list for the logged-in CSR Rep
   * Returns the CSRSavedRequest with all items loaded
   */
  async getSaved(sessionToken) {
    try {
      // Check authorization - must have VIEW_SAVED_REQUESTS permission
      const auth = await AuthorizationHelper.checkPermission(sessionToken, Permissions.VIEW_SAVED_REQUESTS);
      
      if (!auth.authorized) {
        return { success: false, savedList: null, message: auth.message };
      }

      const csrUser = auth.userAccount;

      // Try to find existing saved list
      let savedList = await CSRSavedRequest.getByCSR(csrUser.id);

      // If none exists, create one
      if (!savedList) {
        savedList = new CSRSavedRequest(csrUser);
        await savedList.createSavedList();
      }

      return { 
        success: true, 
        savedList: savedList,
        message: "Saved list retrieved successfully" 
      };

    } catch (error) {
      throw new Error(`Failed to retrieve saved list: ${error.message}`);
    }
  }
}