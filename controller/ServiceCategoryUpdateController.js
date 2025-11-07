import { ServiceCategory } from '../entities/ServiceCategory.js';

export class ServiceCategoryUpdateController {
  #category;
  constructor(category) { this.#category = category; }

  static async findServiceCategoryById(id) {
    const category = await ServiceCategory.getServiceCategoryById(id);
    if (!(category instanceof ServiceCategory)) throw new Error(`Category ${id} not found`);
    return new ServiceCategoryUpdateController(category);
  }

  async updateServiceCategory(title, description) {
    return await this.#category.updateServiceCategory(title, description);
  }
}
