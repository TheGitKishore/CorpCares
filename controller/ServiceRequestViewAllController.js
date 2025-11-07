import { ServiceRequest } from '../entities/ServiceRequest.js';

export class ServiceRequestViewAllController {
  async viewAllServiceRequests() {
    try {
      const requests = await ServiceRequest.viewAllServiceRequest();
      return requests;
    } catch (error) {
      throw new Error(`Failed to retrieve service requests: ${error.message}`);
    }
  }
}