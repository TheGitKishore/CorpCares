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

  constructor(roleName, description) {
    this.#roleName = roleName;
    this.#description = description;
  }

  get roleName() { return this.#roleName; }
  set roleName(value) { this.#roleName = value; }

  get description() { return this.#description; }
  set description(value) { this.#description = value; }

  // ─── Create ───────────────────────────────────────────────
  async createUserProfile() {
    const client = await UserProfile.#pool.connect();
    try {
      await client.query(
        `INSERT INTO UserProfile (roleName, description)
         VALUES ($1, $2)`,
        [this.#roleName, this.#description]
      );
      return this.#roleName;
    } finally {
      client.release();
    }
  }

  // ─── Update ───────────────────────────────────────────────
  async updateUserProfile(newRoleName, newDescription) {
    const client = await UserProfile.#pool.connect();
    try {
      const result = await client.query(
        `UPDATE UserProfile
         SET roleName = $1, description = $2
         WHERE roleName = $3`,
        [newRoleName, newDescription, this.#roleName]
      );
      if (result.rowCount === 1) {
        this.#roleName = newRoleName;
        this.#description = newDescription;
        return true;
      }
      return false;
    } finally {
      client.release();
    }
  }

  // ─── Delete ───────────────────────────────────────────────
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

  // ─── View All ─────────────────────────────────────────────
  static async viewAllUserProfiles() {
    const client = await this.#pool.connect();
    try {
      const result = await client.query(`SELECT * FROM UserProfile`);
      return result.rows.map(row => new UserProfile(row.rolename, row.description));
    } finally {
      client.release();
    }
  }

  // ─── Find by RoleName ─────────────────────────────────────
  static async findByRoleName(roleName) {
    const client = await this.#pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM UserProfile WHERE roleName = $1`,
        [roleName]
      );
      if (result.rowCount === 0) return null;
      const row = result.rows[0];
      return new UserProfile(row.rolename, row.description);
    } finally {
      client.release();
    }
  }
}