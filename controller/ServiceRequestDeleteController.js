import { ServiceRequest } from '../entities/ServiceRequest.js';

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
   */
  async deleteServiceRequest() {
    try {
      const success = await this.#serviceRequest.deleteServiceRequest();
      return success;
    } catch (error) {
      throw new Error(`Service request deletion failed: ${error.message}`);
    }
  }
}