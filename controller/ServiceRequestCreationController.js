import { ServiceRequest } from '../entities/ServiceRequest.js';

export class ServiceRequestCreationController {
  #serviceRequest;

  constructor() {
    this.#serviceRequest = null;
  }

  async createServiceRequest(title, description, category, owner) {
    try {
      this.#serviceRequest = new ServiceRequest(title, description, category, owner);
      const requestId = await this.#serviceRequest.createServiceRequest();
      return requestId;
    } catch (error) {
      throw new Error(`Service request creation failed: ${error.message}`);
    }
  }
}