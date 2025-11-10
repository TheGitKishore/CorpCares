import { ServiceRequest } from '../entities/ServiceRequest.js';
import { ServiceCategory } from '../entities/ServiceCategory.js';
import { AuthorizationHelper } from '../helpers/AuthorizationHelper.js';
import { Permissions } from '../constants/Permissions.js';

export class ServiceRequestCreationController {
  #serviceRequest;

  constructor() {
    this.#serviceRequest = null;
  }

  async createServiceRequest(sessionToken, title, description, categoryTitle) {
    try {
      // Check authorization - must have CREATE_OWN_REQUEST permission
      const auth = await AuthorizationHelper.checkPermission(sessionToken, Permissions.CREATE_OWN_REQUEST);
      
      if (!auth.authorized) {
        return { success: false, requestId: null, message: auth.message };
      }

      const owner = auth.userAccount;

      // Find category
      const category = await ServiceCategory.getServiceCategoryByTitle(categoryTitle);
      if (!(category instanceof ServiceCategory)) {
        return { 
          success: false, 
          requestId: null, 
          message: `Category with title "${categoryTitle}" not found.` 
        };
      }

      this.#serviceRequest = new ServiceRequest(title, description, category, owner);
      const requestId = await this.#serviceRequest.createServiceRequest();
      
      return { 
        success: true, 
        requestId: requestId, 
        message: "Service request created successfully" 
      };

    } catch (error) {
      throw new Error(`Service request creation failed: ${error.message}`);
    }
  }
}