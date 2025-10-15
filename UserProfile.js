import { Permissions } from './Permissions.js';

export class UserProfile {
  static #nextRoleId = 1;

  #roleId;
  #roleName;
  #description;
  #permissions;

  constructor(roleName, description, permissions) {
    
    if (typeof roleName !== 'string') {
      throw new TypeError("roleName must be a string");
    }
    if (typeof description !== 'string') {
      throw new TypeError("description must be a string");
    }
    if (!(permissions instanceof Permissions)) {
      throw new TypeError("permissions must be an instance of Permissions");
    }

    this.#roleId = UserProfile.#nextRoleId++;
    this.#roleName = roleName;
    this.#description = description;
    this.#permissions = permissions;
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

  get permissions() {
    return this.#permissions;
  }

  set permissions(value) {
    if (!(value instanceof Permissions)) {
      throw new TypeError("permissions must be an instance of Permissions");
    }
    this.#permissions = value;
  }
}