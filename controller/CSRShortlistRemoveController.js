import { CSRShortlist } from '../entities/CSRShortlist.js';
import { ServiceRequest } from '../entities/ServiceRequest.js';
import { AuthorizationHelper } from '../helpers/AuthorizationHelper.js';
import { Permissions } from '../constants/Permissions.js';

export class CSRShortlistRemoveController {

  /**
   * Remove a service request from the CSR's shortlist
   * Decrements the ServiceRequest's shortlistCount
   */
  async removeFromShortlist(sessionToken, serviceRequestId) {
    try {
      // Check authorization - must have UNSHORTLIST_REQUEST permission
      const auth = await AuthorizationHelper.checkPermission(sessionToken, Permissions.UNSHORTLIST_REQUEST);
      
      if (!auth.authorized) {
        return { success: false, message: auth.message };
      }

      const csrUser = auth.userAccount;

      // Get shortlist
      const shortlist = await CSRShortlist.getByCSR(csrUser.id);
      if (!shortlist) {
        return { success: false, message: "No shortlist found" };
      }

      // Find the item in the shortlist
      const item = shortlist.serviceRequests.find(
        item => item.serviceRequestId === serviceRequestId
      );

      if (!item) {
        return { success: false, message: "Service request not found in shortlist" };
      }

      // Remove from database
      const success = await this.#removeShortlistItem(item.id);

      if (success) {
        // Decrement shortlist count on ServiceRequest
        const serviceRequest = await ServiceRequest.findById(serviceRequestId);
        if (serviceRequest) {
          await serviceRequest.decrementShortlistCount();
        }
      }

      return { 
        success: success, 
        message: success ? "Service request removed from shortlist" : "Failed to remove from shortlist" 
      };

    } catch (error) {
      throw new Error(`Failed to remove from shortlist: ${error.message}`);
    }
  }

  /**
   * Helper: Remove shortlist item by ID
   */
  async #removeShortlistItem(itemId) {
    const { Pool } = await import('pg');
    const pool = new Pool({
      user: '',
      host: '',
      database: '',
      password: '',
      port: 1234
    });

    const client = await pool.connect();
    try {
      const result = await client.query(
        `DELETE FROM CSRShortlistItem WHERE id = $1`,
        [itemId]
      );
      return result.rowCount === 1;
    } finally {
      client.release();
    }
  }
}