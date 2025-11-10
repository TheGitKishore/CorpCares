export class PINMatchHistorySearchController {
  
  /**
   * Search completed matches by category and/or date range
   * Returns filtered service requests owned by the PIN with status "Complete"
   */
  async searchMatchHistory(sessionToken, filters = {}) {
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

      // Extract filters
      const { categoryTitle, startDate, endDate } = filters;

      // Get filtered completed matches
      const matches = await ServiceRequest.searchCompletedByOwner(
        pinUser.id,
        categoryTitle,
        startDate,
        endDate
      );
      
      return { 
        success: true, 
        matches: matches,
        message: `Found ${matches.length} matching completed requests`,
        filters: filters
      };

    } catch (error) {
      throw new Error(`Failed to search match history: ${error.message}`);
    }
  }
}