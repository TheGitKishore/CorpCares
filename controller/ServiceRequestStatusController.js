import { ServiceRequest } from '../entities/ServiceRequest.js';
import { AuthorizationHelper } from '../helpers/AuthorizationHelper.js';
import { Permissions } from '../constants/Permissions.js';

export class ServiceRequestStatusController {

  /**
   * Update service request status to "Matched"
   */
  async markAsMatched(sessionToken, serviceRequestId) {
    try {
      // Check authorization - must have UPDATE_REQUEST_STATUS permission
      const auth = await AuthorizationHelper.checkPermission(sessionToken, Permissions.UPDATE_REQUEST_STATUS);
      
      if (!auth.authorized) {
        return { success: false, message: auth.message };
      }

      // Find the service request
      const serviceRequest = await ServiceRequest.findById(serviceRequestId);
      if (!serviceRequest) {
        return { success: false, message: `Service request ${serviceRequestId} not found` };
      }

      // Update status
      const success = await serviceRequest.updateStatus("Matched");

      return { 
        success: success, 
        message: success ? "Service request marked as Matched" : "Failed to update status" 
      };

    } catch (error) {
      throw new Error(`Failed to mark as matched: ${error.message}`);
    }
  }

  /**
   * Update service request status to "Complete"
   */
  async markAsComplete(sessionToken, serviceRequestId) {
    try {
      // Check authorization - must have UPDATE_REQUEST_STATUS permission
      const auth = await AuthorizationHelper.checkPermission(sessionToken, Permissions.UPDATE_REQUEST_STATUS);
      
      if (!auth.authorized) {
        return { success: false, message: auth.message };
      }

      // Find the service request
      const serviceRequest = await ServiceRequest.findById(serviceRequestId);
      if (!serviceRequest) {
        return { success: false, message: `Service request ${serviceRequestId} not found` };
      }

      // Update status
      const success = await serviceRequest.updateStatus("Complete");

      return { 
        success: success, 
        message: success ? "Service request marked as Complete" : "Failed to update status" 
      };

    } catch (error) {
      throw new Error(`Failed to mark as complete: ${error.message}`);
    }
  }

  /**
   * Update service request status to any valid status
   */
  async updateStatus(sessionToken, serviceRequestId, newStatus) {
    try {
      // Check authorization - must have UPDATE_REQUEST_STATUS permission
      const auth = await AuthorizationHelper.checkPermission(sessionToken, Permissions.UPDATE_REQUEST_STATUS);
      
      if (!auth.authorized) {
        return { success: false, message: auth.message };
      }

      // Validate status
      const validStatuses = ["Pending", "Matched", "Complete"];
      if (!validStatuses.includes(newStatus)) {
        return { 
          success: false, 
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
        };
      }

      // Find the service request
      const serviceRequest = await ServiceRequest.findById(serviceRequestId);
      if (!serviceRequest) {
        return { success: false, message: `Service request ${serviceRequestId} not found` };
      }

      // Update status
      const success = await serviceRequest.updateStatus(newStatus);

      return { 
        success: success, 
        message: success ? `Service request status updated to ${newStatus}` : "Failed to update status" 
      };

    } catch (error) {
      throw new Error(`Failed to update status: ${error.message}`);
    }
  }
}