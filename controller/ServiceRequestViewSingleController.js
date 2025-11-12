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

      // If user does NOT have VIEW_ALL_REQUESTS, they can only view their own
      if (!auth.userAccount.profile.hasPermission(Permissions.VIEW_ALL_REQUESTS)) {
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

    } 
    catch (error) {
      throw new Error(`Failed to retrieve service request: ${error.message}`);
    }
  }

  async viewOwnRequests(sessionToken) {
  try {
    const auth = await AuthorizationHelper.checkPermission(sessionToken, Permissions.VIEW_OWN_REQUESTS);
    if (!auth.authorized) {
      return { success: false, requests: [], message: auth.message };
    }

    const requests = await ServiceRequest.findByOwnerId(auth.userAccount.id);
    return {
      success: true,
      requests: requests.map(req => ({
        id: req.id,
        title: req.title,
        description: req.description,
        categoryTitle: req.category.title,
        status: req.status,
        datePosted: req.datePosted
      })),
      message: "Own service requests retrieved successfully"
    };
  } catch (error) {
    return { success: false, requests: [], message: `Failed to retrieve own requests: ${error.message}` };
  }
}

}