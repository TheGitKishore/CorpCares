import { CSRShortlist } from '../entities/CSRShortlist.js';
import { ServiceRequest } from '../entities/ServiceRequest.js';
import { AuthorizationHelper } from '../helpers/AuthorizationHelper.js';
import { Permissions } from '../constants/Permissions.js';

export class CSRShortlistAddController {

  /**
   * Add a service request to the CSR's shortlist
   * Auto-creates shortlist if it doesn't exist
   * Increments the ServiceRequest's shortlistCount
   */
  async addToShortlist(sessionToken, serviceRequestId) {
    try {
      // Check authorization - must have SHORTLIST_REQUEST permission
      const auth = await AuthorizationHelper.checkPermission(sessionToken, Permissions.SHORTLIST_REQUEST);
      
      if (!auth.authorized) {
        return { success: false, itemId: null, message: auth.message };
      }

      const csrUser = auth.userAccount;

      // Get or create shortlist
      let shortlist = await CSRShortlist.getByCSR(csrUser.id);
      if (!shortlist) {
        shortlist = new CSRShortlist(csrUser);
        await shortlist.createShortlist();
      }

      // Find the service request
      const serviceRequest = await ServiceRequest.findById(serviceRequestId);
      if (!serviceRequest) {
        return { success: false, itemId: null, message: `Service request ${serviceRequestId} not found` };
      }

      // Check if already in shortlist
      const alreadyShortlisted = shortlist.serviceRequests.some(
        item => item.serviceRequestId === serviceRequestId
      );

      if (alreadyShortlisted) {
        return { success: false, itemId: null, message: "This request is already in your shortlist" };
      }

      // Add to shortlist
      const itemId = await shortlist.addServiceRequest(serviceRequest);

      // Increment shortlist count on ServiceRequest
      await serviceRequest.incrementShortlistCount();

      return { 
        success: true, 
        itemId: itemId,
        message: "Service request added to shortlist" 
      };

    } catch (error) {
      throw new Error(`Failed to add to shortlist: ${error.message}`);
    }
  }
}