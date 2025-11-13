import { ServiceRequest } from '../entities/ServiceRequest.js';
import { AuthorizationHelper } from '../helpers/AuthorizationHelper.js';
import { Permissions } from '../constants/Permissions.js';

export class PINMatchHistorySearchController {
  /**
   * Search completed matches by category and/or date range
   * Returns filtered service requests owned by the PIN with status "Complete"
   */
  async searchMatchHistory(sessionToken, filters = {}) {
    try {
      const auth = await AuthorizationHelper.checkPermission(
        sessionToken,
        Permissions.VIEW_OWN_REQUESTS
      );

      if (!auth.authorized) {
        return { success: false, matches: null, message: auth.message };
      }

      const pinUser = auth.userAccount;
      const { categoryTitle, startDate, endDate } = filters;

      // Validate filters
      const hasCategory = categoryTitle && categoryTitle.trim().length > 0;
      const hasStart = startDate && !isNaN(new Date(startDate).getTime());
      const hasEnd = endDate && !isNaN(new Date(endDate).getTime());

      if (!hasCategory && !hasStart && !hasEnd) {
        return {
          success: true,
          matches: [],
          message: "No valid filters provided — no results returned",
          filters
        };
      }

      // Pass only valid filters to entity
      const matches = await ServiceRequest.searchCompletedByOwner(
        pinUser.id,
        hasCategory ? categoryTitle : null,
        hasStart ? startDate : null,
        hasEnd ? endDate : null
      );

      return {
        success: true,
        matches,
        message: `Found ${matches.length} matching completed requests`,
        filters
      };
    } catch (error) {
      throw new Error(`Failed to search match history: ${error.message}`);
    }
  }
}