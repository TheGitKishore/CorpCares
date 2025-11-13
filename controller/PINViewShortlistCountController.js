import { ServiceRequest } from '../entities/ServiceRequest.js';
import { AuthorizationHelper } from '../helpers/AuthorizationHelper.js';
import { Permissions } from '../constants/Permissions.js';

export class PINViewShortlistCountController {
  /**
   * View shortlist counts for all service requests owned by the logged-in PIN
   */
  async viewShortlistCounts(sessionToken) {
    try {
      // Must have VIEW_OWN_REQUESTS permission
      const auth = await AuthorizationHelper.checkPermission(
        sessionToken,
        Permissions.VIEW_OWN_REQUESTS
      );

      if (!auth.authorized) {
        return { success: false, counts: null, message: auth.message };
      }

      const pinUser = auth.userAccount;

      // Retrieve all requests with shortlist counts
      const counts = await ServiceRequest.getShortlistCountsByOwner(pinUser.id);

      return {
        success: true,
        counts,
        message: `Found ${counts.length} requests with shortlist counts`
      };
    } catch (error) {
      throw new Error(`Failed to retrieve shortlist counts: ${error.message}`);
    }
  }
}