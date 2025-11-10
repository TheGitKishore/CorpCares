import { ServiceRequest } from '../entities/ServiceRequest.js';
import { AuthorizationHelper } from '../helpers/AuthorizationHelper.js';
import { Permissions } from '../constants/Permissions.js';

export class ServiceRequestViewSingleController {
  
  async viewServiceRequestById(sessionToken, requestId) {
    try {
      // Check authorization - must have VIEW_ALL_REQUESTS or VIEW_OWN_REQUESTS permission
      const auth = await AuthorizationHelper.checkAnyPermission(
        sessionToken, 
        [Permissions.VIEW_ALL_REQUESTS, Permissions.VIEW_OWN_REQUESTS]
      );
      
      if (!auth.authorized) {
        return { success: false, request: null, message: auth.message };
      }

      const request = await ServiceRequest.findById(requestId);
      
      if (!(request instanceof ServiceRequest)) {
        return { 
          success: false, 
          request: null, 
          message: `ServiceRequest with ID ${requestId} not found.` 
        };
      }

      // If user only has VIEW_OWN_REQUESTS, verify ownership
      if (auth.userAccount.profile.hasPermission(Permissions.VIEW_OWN_REQUESTS) && 
          !auth.userAccount.profile.hasPermission(Permissions.VIEW_ALL_REQUESTS)) {
        if (request.owner.id !== auth.userAccount.id) {
          return { 
            success: false, 
            request: null, 
            message: "Access denied. You can only view your own requests." 
          };
        }
      }

      return { 
        success: true, 
        request: request, 
        message: "Service request retrieved successfully" 
      };

    } catch (error) {
      throw new Error(`Failed to retrieve service request: ${error.message}`);
    }
  }
}