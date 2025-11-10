import { ServiceCategory } from '../entities/ServiceCategory.js';
import { AuthorizationHelper } from '../helpers/AuthorizationHelper.js';
import { Permissions } from '../constants/Permissions.js';

export class ServiceCategoryCreationController {
  
  async createServiceCategory(sessionToken, title, description) {
    try {
      // Check authorization - must have CREATE_CATEGORY permission
      const auth = await AuthorizationHelper.checkPermission(sessionToken, Permissions.CREATE_CATEGORY);
      
      if (!auth.authorized) {
        return { success: false, categoryId: null, message: auth.message };
      }

      const category = new ServiceCategory(title, description);
      const categoryId = await category.createServiceCategory();
      
      return { 
        success: true, 
        categoryId: categoryId, 
        message: "Service category created successfully" 
      };

    } catch (error) {
      throw new Error(`Service category creation failed: ${error.message}`);
    }
  }
}