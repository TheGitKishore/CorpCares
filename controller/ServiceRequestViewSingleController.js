import { ServiceRequest } from '../entities/ServiceRequest.js';

export class ServiceRequestViewSingleController {
  async viewServiceRequestById(requestId) {
    try {
      const request = await ServiceRequest.findById(requestId);
      if (!(request instanceof ServiceRequest)) {
        throw new Error(`ServiceRequest with ID ${requestId} not found.`);
      }
      return request;
    } catch (error) {
      throw new Error(`Failed to retrieve service request: ${error.message}`);
    }
  }
}