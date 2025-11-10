import { ServiceCategory } from '../entities/ServiceCategory.js';
import { AuthorizationHelper } from '../helpers/AuthorizationHelper.js';
import { Permissions } from '../constants/Permissions.js';

export class ServiceCategoryDeleteController {
  #category;
  
  constructor(category) { 
    this.#category = category; 
  }

  static async findServiceCategoryById(id) {
    const category = await ServiceCategory.getServiceCategoryById(id);
    if (!(category instanceof ServiceCategory)) {
      throw new Error(`Category ${id} not found`);
    }
    return new ServiceCategoryDeleteController(category);
  }

  async deleteServiceCategory(sessionToken) {
    try {
      // Check authorization - must have DELETE_CATEGORY permission
      const auth = await AuthorizationHelper.checkPermission(sessionToken, Permissions.DELETE_CATEGORY);
      
      if (!auth.authorized) {
        return { success: false, message: auth.message };
      }

      const success = await this.#category.deleteServiceCategory();
      
      return { 
        success: success, 
        message: success ? "Service category deleted successfully" : "Failed to delete service category" 
      };

    } catch (error) {
      throw new Error(`Service category deletion failed: ${error.message}`);
    }
  }
}