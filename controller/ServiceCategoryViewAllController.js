import { ServiceCategory } from '../entities/ServiceCategory.js';
import { AuthorizationHelper } from '../helpers/AuthorizationHelper.js';
import { Permissions } from '../constants/Permissions.js';

export class ServiceCategoryViewAllController {
  
  async viewAllServiceCategories(sessionToken) {
    try {
      // Check authorization - must have VIEW_ALL_CATEGORIES permission
      const auth = await AuthorizationHelper.checkPermission(sessionToken, Permissions.VIEW_ALL_CATEGORIES);

      if (!auth.authorized) {
        return { success: false, categories: null, message: auth.message };
      }

      const categories = await ServiceCategory.getAllServiceCategories();
      
      return { 
        success: true, 
        categories: categories, 
        message: `Found ${categories.length} categories` 
      };

    } catch (error) {
      throw new Error(`Failed to retrieve categories: ${error.message}`);
    }
  }
}