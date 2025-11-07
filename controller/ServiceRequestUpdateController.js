import { ServiceRequest } from '../entities/ServiceRequest.js';
import { ServiceCategory } from '../entities/ServiceCategory.js';

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

  async updateServiceRequest(title, description, categoryTitle) {
    try {
      const category = await ServiceCategory.getServiceCategoryByTitle(categoryTitle);
      if (!(category instanceof ServiceCategory)) {
        throw new Error(`Category with title "${categoryTitle}" not found.`);
      }
      const success = await this.#serviceRequest.updateServiceRequest(title, description, category);
      return success;
    } catch (error) {
      throw new Error(`Service request update failed: ${error.message}`);
    }
  }
}