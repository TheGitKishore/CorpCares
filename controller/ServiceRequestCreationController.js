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
      // Input validation
      if (!sessionToken || typeof sessionToken !== 'string' || sessionToken.trim().length === 0) {
        return { 
          success: false, 
          requestId: null, 
          message: "Valid session token is required" 
        };
      }

      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return { 
          success: false, 
          requestId: null, 
          message: "Request title is required and cannot be empty" 
        };
      }

      if (title.length > 200) {
        return { 
          success: false, 
          requestId: null, 
          message: "Request title cannot exceed 200 characters" 
        };
      }

      if (!description || typeof description !== 'string' || description.trim().length === 0) {
        return { 
          success: false, 
          requestId: null, 
          message: "Request description is required and cannot be empty" 
        };
      }

      if (description.length > 2000) {
        return { 
          success: false, 
          requestId: null, 
          message: "Request description cannot exceed 2000 characters" 
        };
      }

      if (!categoryTitle || typeof categoryTitle !== 'string' || categoryTitle.trim().length === 0) {
        return { 
          success: false, 
          requestId: null, 
          message: "Category title is required" 
        };
      }

      // Check authorization - must have CREATE_OWN_REQUEST permission
      const auth = await AuthorizationHelper.checkPermission(sessionToken, Permissions.CREATE_OWN_REQUEST);
      
      if (!auth.authorized) {
        return { success: false, requestId: null, message: auth.message };
      }

      const owner = auth.userAccount;

      // Find category
      const category = await ServiceCategory.getServiceCategoryByTitle(categoryTitle.trim());
      if (!(category instanceof ServiceCategory)) {
        return { 
          success: false, 
          requestId: null, 
          message: `Category with title "${categoryTitle.trim()}" not found.` 
        };
      }

      this.#serviceRequest = new ServiceRequest(title.trim(), description.trim(), category, owner);
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