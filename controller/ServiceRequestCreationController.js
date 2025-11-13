import { ServiceRequest } from '../entities/ServiceRequest.js';
import { ServiceCategory } from '../entities/ServiceCategory.js';
import { AuthorizationHelper } from '../helpers/AuthorizationHelper.js';
import { Permissions } from '../constants/Permissions.js';

export class ServiceRequestCreationController {
  #serviceRequest;

  constructor() {
    this.#serviceRequest = null;
  }

async createServiceRequest(sessionToken, title, description, categoryId) {
  try {
    // Input validation
    if (!sessionToken || typeof sessionToken !== 'string' || sessionToken.trim().length === 0) {
      return { success: false, requestId: null, message: "Valid session token is required" };
    }

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return { success: false, requestId: null, message: "Request title is required and cannot be empty" };
    }

    if (title.length > 200) {
      return { success: false, requestId: null, message: "Request title cannot exceed 200 characters" };
    }

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return { success: false, requestId: null, message: "Request description is required and cannot be empty" };
    }

    if (description.length > 2000) {
      return { success: false, requestId: null, message: "Request description cannot exceed 2000 characters" };
    }

    if (!categoryId || typeof categoryId !== 'string' || categoryId.trim().length === 0) {
      return { success: false, requestId: null, message: "Category ID is required" };
    }

    // Check authorization
    const auth = await AuthorizationHelper.checkPermission(sessionToken, Permissions.CREATE_OWN_REQUEST);
    if (!auth.authorized) {
      return { success: false, requestId: null, message: auth.message };
    }

    const owner = auth.userAccount;

    const numericCategoryId = Number(categoryId);
    if (isNaN(numericCategoryId)) {
      return { success: false, requestId: null, message: "Category ID must be a valid number" };
    }
    
    console.log("Fetching category with ID:", numericCategoryId);
    // Find category by ID
    const category = await ServiceCategory.getServiceCategoryById(numericCategoryId);
    console.log("Fetched category:", category);
    if (!(category instanceof ServiceCategory)) {
      return { success: false, requestId: null, message: `Category with ID "${numericCategoryId}" not found.` };
    }

    this.#serviceRequest = new ServiceRequest(title.trim(), description.trim(), category, owner);
    const requestId = await this.#serviceRequest.createServiceRequest();

    return { success: true, requestId, message: "Service request created successfully" };

  } catch (error) {
    throw new Error(`Service request creation failed: ${error.message}`);
  }
}

}