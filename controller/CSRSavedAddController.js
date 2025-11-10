import { CSRSavedRequest } from '../entities/CSRSavedRequest.js';
import { ServiceRequest } from '../entities/ServiceRequest.js';
import { AuthorizationHelper } from '../helpers/AuthorizationHelper.js';
import { Permissions } from '../constants/Permissions.js';

export class CSRSavedAddController {

  /**
   * Add a service request to the CSR's saved list
   * Auto-creates saved list if it doesn't exist
   * Increments the ServiceRequest's saveCount
   */
  async addToSaved(sessionToken, serviceRequestId) {
    try {
      // Input validation
      if (!sessionToken || typeof sessionToken !== 'string' || sessionToken.trim().length === 0) {
        return { 
          success: false, 
          itemId: null, 
          message: "Valid session token is required" 
        };
      }

      if (!serviceRequestId || typeof serviceRequestId !== 'number' || serviceRequestId <= 0) {
        return { 
          success: false, 
          itemId: null, 
          message: "Valid service request ID is required" 
        };
      }

      // Check authorization - must have SAVE_REQUEST permission
      const auth = await AuthorizationHelper.checkPermission(sessionToken, Permissions.SAVE_REQUEST);
      
      if (!auth.authorized) {
        return { success: false, itemId: null, message: auth.message };
      }

      const csrUser = auth.userAccount;

      // Get or create saved list
      let savedList = await CSRSavedRequest.getByCSR(csrUser.id);
      if (!savedList) {
        savedList = new CSRSavedRequest(csrUser);
        await savedList.createSavedList();
      }

      // Find the service request
      const serviceRequest = await ServiceRequest.findById(serviceRequestId);
      if (!serviceRequest) {
        return { success: false, itemId: null, message: `Service request ${serviceRequestId} not found` };
      }

      // Check if already in saved list
      const alreadySaved = savedList.serviceRequests.some(
        item => item.serviceRequestId === serviceRequestId
      );

      if (alreadySaved) {
        return { success: false, itemId: null, message: "This request is already in your saved list" };
      }

      // Add to saved list
      const itemId = await savedList.addServiceRequest(serviceRequest);

      // Increment save count on ServiceRequest
      await serviceRequest.incrementSaveCount();

      return { 
        success: true, 
        itemId: itemId,
        message: "Service request added to saved list" 
      };

    } catch (error) {
      throw new Error(`Failed to add to saved list: ${error.message}`);
    }
  }
}