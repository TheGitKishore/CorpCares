import { ServiceCategory } from '../entities/ServiceCategory.js';
import { AuthorizationHelper } from '../helpers/AuthorizationHelper.js';
import { Permissions } from '../constants/Permissions.js';

export class ServiceCategoryUpdateController {
  #category;
  
  constructor(category) { 
    this.#category = category; 
  }

  static async findServiceCategoryById(id) {
    const category = await ServiceCategory.getServiceCategoryById(id);
    if (!(category instanceof ServiceCategory)) {
      throw new Error(`Category ${id} not found`);
    }
    return new ServiceCategoryUpdateController(category);
  }

  async updateServiceCategory(sessionToken, title, description) {
    try {
      // Check authorization - must have UPDATE_CATEGORY permission
      const auth = await AuthorizationHelper.checkPermission(sessionToken, Permissions.UPDATE_CATEGORY);
      
      if (!auth.authorized) {
        return { success: false, message: auth.message };
      }

      const success = await this.#category.updateServiceCategory(title, description);
      
      return { 
        success: success, 
        message: success ? "Service category updated successfully" : "Failed to update service category" 
      };

    } catch (error) {
      throw new Error(`Service category update failed: ${error.message}`);
    }
  }
}