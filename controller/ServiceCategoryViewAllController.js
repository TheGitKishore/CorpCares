import { ServiceCategory } from '../entities/ServiceCategory.js';

export class ServiceCategoryViewAllController {
  async viewAllServiceCategories() {
    try {
      const categories = await ServiceCategory.getAllServiceCategories();
      return categories;
    } catch (error) {
      throw new Error(`Failed to retrieve categories: ${error.message}`);
    }
  }
}
