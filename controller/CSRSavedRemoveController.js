import { CSRSavedRequest } from '../entities/CSRSavedRequest.js';
import { ServiceRequest } from '../entities/ServiceRequest.js';
import { AuthorizationHelper } from '../helpers/AuthorizationHelper.js';
import { Permissions } from '../constants/Permissions.js';

export class CSRSavedRemoveController {

  /**
   * Remove a service request from the CSR's saved list
   * Decrements the ServiceRequest's saveCount
   */
  async removeFromSaved(sessionToken, serviceRequestId) {
    try {
      // Check authorization - must have UNSAVE_REQUEST permission
      const auth = await AuthorizationHelper.checkPermission(sessionToken, Permissions.UNSAVE_REQUEST);
      
      if (!auth.authorized) {
        return { success: false, message: auth.message };
      }

      const csrUser = auth.userAccount;

      // Get saved list
      const savedList = await CSRSavedRequest.getByCSR(csrUser.id);
      if (!savedList) {
        return { success: false, message: "No saved list found" };
      }

      // Find the item in the saved list
      const item = savedList.serviceRequests.find(
        item => item.serviceRequestId === serviceRequestId
      );

      if (!item) {
        return { success: false, message: "Service request not found in saved list" };
      }

      // Remove from database using entity method
      const success = await CSRSavedRequest.removeItemById(item.id);

      if (success) {
        // Decrement save count on ServiceRequest
        const serviceRequest = await ServiceRequest.findById(serviceRequestId);
        if (serviceRequest) {
          await serviceRequest.decrementSaveCount();
        }
      }

      return { 
        success: success, 
        message: success ? "Service request removed from saved list" : "Failed to remove from saved list" 
      };

    } catch (error) {
      throw new Error(`Failed to remove from saved list: ${error.message}`);
    }
  }
}