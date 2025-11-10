import { ServiceRequest } from '../entities/ServiceRequest.js';
import { AuthorizationHelper } from '../helpers/AuthorizationHelper.js';
import { Permissions } from '../constants/Permissions.js';

export class CSRSearchRequestsByCategoryController {
  
  /**
   * Search service requests by category
   * Returns all "Pending" or "Matched" requests in specified category
   */
  async searchByCategory(sessionToken, categoryTitle) {
    try {
      // Check authorization - must have VIEW_ALL_REQUESTS permission
      const auth = await AuthorizationHelper.checkPermission(
        sessionToken, 
        Permissions.VIEW_ALL_REQUESTS
      );
      
      if (!auth.authorized) {
        return { success: false, requests: null, message: auth.message };
      }

      if (!categoryTitle) {
        return { 
          success: false, 
          requests: null, 
          message: "Category title is required" 
        };
      }

      // Search requests by category (excluding completed)
      const requests = await ServiceRequest.searchByCategory(categoryTitle);
      
      return { 
        success: true, 
        requests: requests,
        message: `Found ${requests.length} requests in category "${categoryTitle}"`,
        category: categoryTitle
      };

    } catch (error) {
      throw new Error(`Failed to search requests by category: ${error.message}`);
    }
  }
}