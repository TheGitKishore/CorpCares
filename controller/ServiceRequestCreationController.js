import { ServiceRequest } from '../entities/ServiceRequest.js';
import { ServiceCategory } from '../entities/ServiceCategory.js';
import { UserAccount } from '../entities/UserAccount.js';

export class ServiceRequestCreationController {
  #serviceRequest;

  constructor() {
    this.#serviceRequest = null;
  }

  async createServiceRequest(title, description, categoryTitle, owner) {
    try {
      const category = await ServiceCategory.getServiceCategoryByTitle(categoryTitle);
      if (!(category instanceof ServiceCategory)) {
        throw new Error(`Category with title "${categoryTitle}" not found.`);
      }

      this.#serviceRequest = new ServiceRequest(title, description, category, owner);
      const requestId = await this.#serviceRequest.createServiceRequest();
      return requestId;
    } catch (error) {
      throw new Error(`Service request creation failed: ${error.message}`);
    }
  }
}