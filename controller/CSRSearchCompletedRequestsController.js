export class CSRSearchCompletedRequestsController {
  
  /**
   * Search completed requests by category and/or date range
   */
  async searchCompleted(sessionToken, filters = {}) {
    try {
      // Check authorization - must have VIEW_ALL_REQUESTS permission
      const auth = await AuthorizationHelper.checkPermission(
        sessionToken, 
        Permissions.VIEW_ALL_REQUESTS
      );
      
      if (!auth.authorized) {
        return { success: false, requests: null, message: auth.message };
      }

      // Extract filters
      const { categoryTitle, startDate, endDate } = filters;

      // Search completed requests with filters
      const requests = await ServiceRequest.searchCompleted(
        categoryTitle,
        startDate,
        endDate
      );
      
      return { 
        success: true, 
        requests: requests,
        message: `Found ${requests.length} completed requests`,
        filters: filters
      };

    } catch (error) {
      throw new Error(`Failed to search completed requests: ${error.message}`);
    }
  }
}