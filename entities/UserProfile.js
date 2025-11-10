import { Pool } from 'pg';

export class UserProfile {
  static #pool = new Pool({
    user: '',
    host: '',
    database: '',
    password: '',
    port: 1234
  });

  #roleName;
  #description;
  #permissions; 
  constructor(roleName, description, permissions = []) {
    this.#roleName = roleName;
    this.#description = description;
    this.#permissions = Array.isArray(permissions) ? permissions : [];
  }

  get roleName() { return this.#roleName; }
  set roleName(value) { this.#roleName = value; }

  get description() { return this.#description; }
  set description(value) { this.#description = value; }

  get permissions() { return [...this.#permissions]; } // Return copy to prevent external modification
  set permissions(value) { 
    this.#permissions = Array.isArray(value) ? value : [];
  }

  // Check if this profile has a specific permission
  hasPermission(action) {
    return this.#permissions.includes(action);
  }

  // Check if this profile has any of the given permissions
  hasAnyPermission(actions = []) {
    return actions.some(action => this.#permissions.includes(action));
  }

  // Check if this profile has all of the given permissions
  hasAllPermissions(actions = []) {
    return actions.every(action => this.#permissions.includes(action));
  }

  // ═══════════════ Create ═══════════════════════════════════════════════════
  async createUserProfile() {
    const client = await UserProfile.#pool.connect();
    try {
      await client.query(
        `INSERT INTO UserProfile (roleName, description, permissions)
         VALUES ($1, $2, $3)`,
        [this.#roleName, this.#description, this.#permissions]
      );
      return this.#roleName;
    } finally {
      client.release();
    }
  }

  // ═══════════════ Update ═══════════════════════════════════════════════════
  async updateUserProfile(newRoleName, newDescription, newPermissions) {
    const client = await UserProfile.#pool.connect();
    try {
      const result = await client.query(
        `UPDATE UserProfile
         SET roleName = $1, description = $2, permissions = $3
         WHERE roleName = $4`,
        [newRoleName, newDescription, newPermissions, this.#roleName]
      );
      if (result.rowCount === 1) {
        this.#roleName = newRoleName;
        this.#description = newDescription;
        this.#permissions = newPermissions;
        return true;
      }
      return false;
    } finally {
      client.release();
    }
  }

  // ═══════════════ Delete ═══════════════════════════════════════════════════
  async deleteUserProfile() {
    const client = await UserProfile.#pool.connect();
    try {
      const result = await client.query(
        `DELETE FROM UserProfile WHERE roleName = $1`,
        [this.#roleName]
      );
      return result.rowCount === 1;
    } finally {
      client.release();
    }
  }

  // ═══════════════ View All ══════════════════════════════════════════════════
  static async viewAllUserProfiles() {
    const client = await this.#pool.connect();
    try {
      const result = await client.query(`SELECT * FROM UserProfile`);
      return result.rows.map(row => 
        new UserProfile(row.rolename, row.description, row.permissions || [])
      );
    } finally {
      client.release();
    }
  }

  // ═══════════════ Find by RoleName ══════════════════════════════════════════
  static async findByRoleName(roleName) {
    const client = await this.#pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM UserProfile WHERE roleName = $1`,
        [roleName]
      );
      if (result.rowCount === 0) return null;
      const row = result.rows[0];
      return new UserProfile(row.rolename, row.description, row.permissions || []);
    } finally {
      client.release();
    }
  }
}