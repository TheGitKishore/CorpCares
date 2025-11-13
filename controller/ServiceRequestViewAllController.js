import { ServiceRequest } from '../entities/ServiceRequest.js';
import { AuthorizationHelper } from '../helpers/AuthorizationHelper.js';
import { Permissions } from '../constants/Permissions.js';

export class ServiceRequestViewAllController {
  
  async viewAllServiceRequests(sessionToken) {
    try {
      // Check authorization - must have VIEW_ALL_REQUESTS permission
      const auth = await AuthorizationHelper.checkPermission(sessionToken, Permissions.VIEW_ALL_REQUESTS);
      
      if (!auth.authorized) {
        return { success: false, requests: null, message: auth.message };
      }

      const requests = await ServiceRequest.viewAllServiceRequests();
      console.log('Requests before return:', requests);
      
      return { 
        success: true, 
        requests: requests, 
        message: `Found ${requests.length} service requests` 
      };

    } catch (error) {
      throw new Error(`Failed to retrieve service requests: ${error.message}`);
    }
  }
}