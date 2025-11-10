import { ServiceCategory } from '../entities/ServiceCategory.js';
import { AuthorizationHelper } from '../helpers/AuthorizationHelper.js';
import { Permissions } from '../constants/Permissions.js';

export class ServiceCategoryCreationController {
  
  async createServiceCategory(sessionToken, title, description) {
    try {
      // Input validation
      if (!sessionToken || typeof sessionToken !== 'string' || sessionToken.trim().length === 0) {
        return { 
          success: false, 
          categoryId: null, 
          message: "Valid session token is required" 
        };
      }

      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return { 
          success: false, 
          categoryId: null, 
          message: "Category title is required and cannot be empty" 
        };
      }

      if (title.length > 200) {
        return { 
          success: false, 
          categoryId: null, 
          message: "Category title cannot exceed 200 characters" 
        };
      }

      if (!description || typeof description !== 'string' || description.trim().length === 0) {
        return { 
          success: false, 
          categoryId: null, 
          message: "Category description is required and cannot be empty" 
        };
      }

      if (description.length > 1000) {
        return { 
          success: false, 
          categoryId: null, 
          message: "Category description cannot exceed 1000 characters" 
        };
      }

      // Check authorization - must have CREATE_CATEGORY permission
      const auth = await AuthorizationHelper.checkPermission(sessionToken, Permissions.CREATE_CATEGORY);
      
      if (!auth.authorized) {
        return { success: false, categoryId: null, message: auth.message };
      }

      const category = new ServiceCategory(title.trim(), description.trim());
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