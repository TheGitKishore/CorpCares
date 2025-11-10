import { ServiceRequest } from '../entities/ServiceRequest.js';
import { AuthorizationHelper } from '../helpers/AuthorizationHelper.js';
import { Permissions } from '../constants/Permissions.js';

export class CSRCompletedRequestsViewController {
  
  /**
   * View all completed service requests (system-wide)
   */
  async viewCompleted(sessionToken) {
    try {
      // Check authorization - must have VIEW_ALL_REQUESTS permission
      const auth = await AuthorizationHelper.checkPermission(
        sessionToken, 
        Permissions.VIEW_ALL_REQUESTS
      );
      
      if (!auth.authorized) {
        return { success: false, requests: null, message: auth.message };
      }

      // Get all completed requests
      const requests = await ServiceRequest.findAllCompleted();
      
      return { 
        success: true, 
        requests: requests,
        message: `Found ${requests.length} completed requests`
      };

    } catch (error) {
      throw new Error(`Failed to retrieve completed requests: ${error.message}`);
    }
  }
}