import { ServiceRequest } from '../entities/ServiceRequest.js';

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

  async updateServiceRequest(title, description, category) {
    try {
      const success = await this.#serviceRequest.updateServiceRequest(title, description, category);
      return success;
    } catch (error) {
      throw new Error(`Service request update failed: ${error.message}`);
    }
  }
}