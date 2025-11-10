import { ServiceRequest } from '../entities/ServiceRequest.js';
import { AuthorizationHelper } from '../helpers/AuthorizationHelper.js';
import { Permissions } from '../constants/Permissions.js';

/**
 * Controller responsible for deleting a service request.
 * Delegates persistence logic to the ServiceRequest entity.
 */
export class ServiceRequestDeleteController {
  #serviceRequest;

  constructor(serviceRequest) {
    this.#serviceRequest = serviceRequest;
  }

  /**
   * Factory method: hydrate controller from an existing request ID.
   */
  static async findById(requestId) {
    const request = await ServiceRequest.findById(requestId);
    if (!(request instanceof ServiceRequest)) {
      throw new Error(`ServiceRequest with ID ${requestId} not found.`);
    }
    return new ServiceRequestDeleteController(request);
  }

  /**
   * Delete the hydrated service request.
   * Checks if user is owner (PIN) OR has DELETE_ANY_REQUEST permission (CSR Rep)
   */
  async deleteServiceRequest(sessionToken) {
    try {
      // Check if user is owner OR has permission to delete any request
      const auth = await AuthorizationHelper.verifyOwnershipOrPermission(
        sessionToken, 
        this.#serviceRequest.owner.id,
        Permissions.DELETE_ANY_REQUEST
      );

      if (!auth.authorized) {
        return { success: false, message: auth.message };
      }

      const success = await this.#serviceRequest.deleteServiceRequest();
      
      return { 
        success: success, 
        message: success ? "Service request deleted successfully" : "Failed to delete service request" 
      };

    } catch (error) {
      throw new Error(`Service request deletion failed: ${error.message}`);
    }
  }
}