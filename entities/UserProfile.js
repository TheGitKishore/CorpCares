export class UserProfile {
  #roleName;
  #description;
  #permissions;

  constructor(roleName, description, permissions = {}) {
    this.#roleName = roleName;
    this.#description = description;
    this.#permissions = permissions;
  }

  get roleName() { return this.#roleName; }
  get description() { return this.#description; }
  get permissions() { return this.#permissions; }

  static #profiles = [
    new UserProfile("UserAdmin", "User administrator", {
      canExample1: true,
      canExample2: false
    }),
    new UserProfile("PIN", "Person-In-Need", {
      canExample1: false,
      canExample2: true
    }),
    new UserProfile("CSR Rep", "Corporate Social Responsibility Representative", {
      canExample1: true,
      canExample2: true
    }),
    new UserProfile("Platform Manager", "Platform manager", {
      canExample1: false,
      canExample2: false
    })
  ];

  static getAllProfiles() {
    return this.#profiles;
  }

  static getByRoleName(roleName) {
    return this.#profiles.find(p => p.roleName === roleName) || null;
  }
}