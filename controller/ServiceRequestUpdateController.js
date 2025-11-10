import { ServiceRequest } from '../entities/ServiceRequest.js';
import { ServiceCategory } from '../entities/ServiceCategory.js';
import { AuthorizationHelper } from '../helpers/AuthorizationHelper.js';
import { Permissions } from '../constants/Permissions.js';

export class ServiceRequestUpdateController {
  #serviceRequest;

  constructor(serviceRequest) {
    this.#serviceRequest = serviceRequest;
  }

  static async findById(requestId) {
    const request = await ServiceRequest.findById(requestId);
    if (!(request instanceof ServiceRequest)) {
      throw new Error(`ServiceRequest with ID ${requestId} not found.`);
    }
    return new ServiceRequestUpdateController(request);
  }

  async updateServiceRequest(sessionToken, title, description, categoryTitle) {
    try {
      // Check if user is owner OR has permission to update any request
      const auth = await AuthorizationHelper.verifyOwnershipOrPermission(
        sessionToken, 
        this.#serviceRequest.owner.id,
        Permissions.UPDATE_OWN_REQUEST
      );

      if (!auth.authorized) {
        return { success: false, message: auth.message };
      }

      // Find category
      const category = await ServiceCategory.getServiceCategoryByTitle(categoryTitle);
      if (!(category instanceof ServiceCategory)) {
        return { 
          success: false, 
          message: `Category with title "${categoryTitle}" not found.` 
        };
      }

      const success = await this.#serviceRequest.updateServiceRequest(title, description, category);
      
      return { 
        success: success, 
        message: success ? "Service request updated successfully" : "Failed to update service request" 
      };

    } catch (error) {
      throw new Error(`Service request update failed: ${error.message}`);
    }
  }
}