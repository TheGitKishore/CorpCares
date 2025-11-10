import { ServiceRequest } from '../entities/ServiceRequest.js';
import { AuthorizationHelper } from '../helpers/AuthorizationHelper.js';
import { Permissions } from '../constants/Permissions.js';

export class PINMatchHistoryViewController {
  
  /**
   * View completed matches for the logged-in PIN
   * Returns only service requests owned by the PIN with status "Complete"
   */
  async viewMatchHistory(sessionToken) {
    try {
      // Check authorization - must have VIEW_OWN_REQUESTS permission
      const auth = await AuthorizationHelper.checkPermission(
        sessionToken, 
        Permissions.VIEW_OWN_REQUESTS
      );
      
      if (!auth.authorized) {
        return { success: false, matches: null, message: auth.message };
      }

      const pinUser = auth.userAccount;

      // Get completed matches for this PIN
      const matches = await ServiceRequest.findCompletedByOwnerId(pinUser.id);
      
      return { 
        success: true, 
        matches: matches,
        message: `Found ${matches.length} completed matches` 
      };

    } catch (error) {
      throw new Error(`Failed to retrieve match history: ${error.message}`);
    }
  }
}
