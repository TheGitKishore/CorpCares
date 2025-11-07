import { ServiceCategory } from '../entities/ServiceCategory.js';

export class ServiceCategoryDeleteController {
  #category;
  constructor(category) { this.#category = category; }

  static async findServiceCategoryById(id) {
    const category = await ServiceCategory.getServiceCategoryById(id);
    if (!(category instanceof ServiceCategory)) throw new Error(`Category ${id} not found`);
    return new ServiceCategoryDeleteController(category);
  }

  async deleteServiceCategory() {
    return await this.#category.deleteServiceCategory();
  }
}
