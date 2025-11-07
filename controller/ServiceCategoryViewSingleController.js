// ServiceCategoryViewSingleController.js
import { ServiceCategory } from '../entities/ServiceCategory.js';

export class ServiceCategoryViewSingleController {
  async viewServiceCategoryByTitle(categoryTitle) {
    try {
      const category = await ServiceCategory.getServiceCategoryByTitle(categoryTitle);
      if (!(category instanceof ServiceCategory)) {
        throw new Error(`ServiceCategory with title "${categoryTitle}" not found.`);
      }
      return category;
    } catch (error) {
      throw new Error(`Failed to retrieve category: ${error.message}`);
    }
  }
}