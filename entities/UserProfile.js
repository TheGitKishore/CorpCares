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
    if (typeof roleName !== 'string') {
      throw new TypeError("roleName must be a string");
    }
    if (typeof description !== 'string') {
      throw new TypeError("description must be a string");
    }

    this.#roleName = roleName;
    this.#description = description;
  }

  get roleName() { return this.#roleName; }
  set roleName(value) {
    if (typeof value !== 'string') {
      throw new TypeError("roleName must be a string");
    }
    this.#roleName = value;
  }

  get description() { return this.#description; }
  set description(value) {
    if (typeof value !== 'string') {
      throw new TypeError("description must be a string");
    }
    this.#description = value;
  }

  static async getByRoleName(roleName) {
    const client = await this.#pool.connect();
    try {
      const result = await client.query(
        `SELECT roleName, description FROM UserProfile WHERE roleName = $1`,
        [roleName]
      );
      if (result.rowCount === 0) return null;
      const row = result.rows[0];
      return new UserProfile(row.rolename, row.description);
    } finally {
      client.release();
    }
  }

  static async getAllProfiles() {
    const client = await this.#pool.connect();
    try {
      const result = await client.query(`SELECT roleName, description FROM UserProfile`);
      return result.rows.map(row =>
        new UserProfile(row.rolename, row.description)
      );
    } finally {
      client.release();
    }
  }

  async createUserProfile() {
    const client = await UserProfile.#pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO UserProfile (roleName, description)
         VALUES ($1, $2)
         RETURNING roleName`,
        [this.#roleName, this.#description]
      );
      return result.rows[0].rolename;
    } finally {
      client.release();
    }
  }
}