import { CSRSavedRequest } from '../entities/CSRSavedRequest.js';
import { AuthorizationHelper } from '../helpers/AuthorizationHelper.js';
import { Permissions } from '../constants/Permissions.js';

export class CSRSearchSavedRequestsController {
  
  /**
   * Search within CSR's saved list by keyword
   * Searches title and description of saved requests
   */
  async searchSaved(sessionToken, searchTerm) {
    try {
      // Validate inputs
      if (!sessionToken || typeof sessionToken !== 'string' || sessionToken.trim().length === 0) {
        return { 
          success: false, 
          results: null, 
          message: "Valid session token is required" 
        };
      }

      if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim().length === 0) {
        return { 
          success: false, 
          results: null, 
          message: "Search term is required and must be a non-empty string" 
        };
      }

      // Check authorization - must have VIEW_SAVED_REQUESTS permission
      const auth = await AuthorizationHelper.checkPermission(
        sessionToken, 
        Permissions.VIEW_SAVED_REQUESTS
      );
      
      if (!auth.authorized) {
        return { success: false, results: null, message: auth.message };
      }

      const csrUser = auth.userAccount;

      // Get saved list
      const savedList = await CSRSavedRequest.getByCSR(csrUser.id);

      if (!savedList) {
        return { 
          success: true, 
          results: [],
          message: "No saved list found",
          searchTerm: searchTerm.trim()
        };
      }

      // Filter saved requests by search term (case-insensitive)
      const term = searchTerm.trim().toLowerCase();
      const results = savedList.serviceRequests.filter(item => 
        item.title.toLowerCase().includes(term) || 
        item.description.toLowerCase().includes(term)
      );
      
      return { 
        success: true, 
        results: results,
        message: `Found ${results.length} saved requests matching "${searchTerm.trim()}"`,
        searchTerm: searchTerm.trim()
      };

    } catch (error) {
      throw new Error(`Failed to search saved requests: ${error.message}`);
    }
  }
}