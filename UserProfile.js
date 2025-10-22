import { Permissions } from './Permissions.js';

export class UserProfile {
  static #nextRoleId = 1;

  #roleId;
  #roleName;
  #description;

  constructor(roleName, description) {
    
    if (typeof roleName !== 'string') {
      throw new TypeError("roleName must be a string");
    }
    if (typeof description !== 'string') {
      throw new TypeError("description must be a string");
    }

    this.#roleId = UserProfile.#nextRoleId++;
    this.#roleName = roleName;
    this.#description = description;
  }

  get roleId() {
    return this.#roleId;
  }

  get roleName() {
    return this.#roleName;
  }

  set roleName(value) {
    if (typeof value !== 'string') {
      throw new TypeError("roleName must be a string");
    }
    this.#roleName = value;
  }

  get description() {
    return this.#description;
  }

  set description(value) {
    if (typeof value !== 'string') {
      throw new TypeError("description must be a string");
    }
    this.#description = value;
  }

}