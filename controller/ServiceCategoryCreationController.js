import { ServiceCategory } from '../entities/ServiceCategory.js';

export class ServiceCategoryCreationController {
  async createServiceCategory(title, description) {
    const category = new ServiceCategory(title, description);
    return await category.createServiceCategory();
  }
}