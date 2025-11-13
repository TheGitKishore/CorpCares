import { CSRShortlist } from '../entities/CSRShortlist.js';
import { AuthorizationHelper } from '../helpers/AuthorizationHelper.js';
import { Permissions } from '../constants/Permissions.js';

export class CSRShortlistSearchController {
  /**
   * Get or create shortlist for the logged-in CSR Rep
   * Returns the CSRShortlist with all items loaded
  */
  async getShortlist(sessionToken) {
    try {
      const auth = await AuthorizationHelper.checkPermission(sessionToken, Permissions.VIEW_SHORTLISTED_REQUESTS);
      if (!auth.authorized) {
        return { success: false, shortlist: null, message: auth.message };
      }

      const csrUser = auth.userAccount;
      let shortlist = await CSRShortlist.getByCSR(csrUser.id);

      if (!shortlist) {
        shortlist = new CSRShortlist(csrUser);
        await shortlist.createShortlist();
      }

      return {
        success: true,
        shortlist,
        message: "Shortlist retrieved successfully"
      };
    } catch (error) {
      throw new Error(`Failed to retrieve shortlist: ${error.message}`);
    }
  }

  /**
   * Search shortlist items by keyword in title or description
   * Returns a plain array of matching items
  */   
  async searchShortlist(sessionToken, keyword) {
    const result = await this.getShortlist(sessionToken);
    if (!result.success || !result.shortlist) {
      return { success: false, requests: [], message: result.message };
    }

    const query = keyword?.toLowerCase() || '';
    const filtered = result.shortlist.serviceRequests.filter(item => {
      const title = item.title?.toLowerCase() || '';
      const description = item.description?.toLowerCase() || '';
      return title.includes(query) || description.includes(query);
    });

    return {
      success: true,
      requests: filtered.map(item => ({
        id: item.id,
        title: item.title,
        category: item.description // or replace with actual category if available
      })),
      message: `Found ${filtered.length} matching items`
    };
  }
}