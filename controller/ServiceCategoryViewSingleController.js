import { ServiceCategory } from '../entities/ServiceCategory.js';
import { AuthorizationHelper } from '../helpers/AuthorizationHelper.js';
import { Permissions } from '../constants/Permissions.js';

export class ServiceCategoryViewSingleController {
  
  async viewServiceCategoryByTitle(sessionToken, categoryTitle) {
    try {
      // Check authorization - must have VIEW_CATEGORY permission
      const auth = await AuthorizationHelper.checkPermission(sessionToken, Permissions.VIEW_CATEGORY);
      
      if (!auth.authorized) {
        return { success: false, category: null, message: auth.message };
      }

      const category = await ServiceCategory.getServiceCategoryByTitle(categoryTitle);
      
      if (!(category instanceof ServiceCategory)) {
        return { 
          success: false, 
          category: null, 
          message: `ServiceCategory with title "${categoryTitle}" not found.` 
        };
      }

      return { 
        success: true, 
        category: category, 
        message: "Category retrieved successfully" 
      };

    } catch (error) {
      throw new Error(`Failed to retrieve category: ${error.message}`);
    }
  }
}