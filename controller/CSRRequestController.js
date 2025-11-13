import { ServiceRequest } from '../entities/ServiceRequest.js';
import { AuthorizationHelper } from '../helpers/AuthorizationHelper.js';
import { Permissions } from '../constants/Permissions.js';

export class CSRRequestController {

  // Endpoint logic to view all requests for CSR
  static async viewAllServiceRequests(sessionToken) {
    try {
      // Check if the user has CSR permissions
      const auth = await AuthorizationHelper.checkPermission(sessionToken, Permissions.VIEW_ALL_REQUESTS);
      if (!auth.authorized) {
        return { success: false, requests: [], message: auth.message };
      }

      const requests = await ServiceRequest.viewAllServiceRequests();

      // Map to plain objects with exactly the fields frontend expects
      const plainRequests = requests.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        status: r.status,
        owner: r.owner?.name || 'Unknown', // optional
        category: r.category?.title || 'Unknown' // optional
      }));

      return {
        success: true,
        requests: plainRequests,
        message: `Found ${plainRequests.length} service requests`
      };

    } catch (err) {
      return { success: false, requests: [], message: `Failed to fetch requests: ${err.message}` };
    }
  }
}
