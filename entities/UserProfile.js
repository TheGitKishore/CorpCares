import { Pool } from 'pg';

export class UserProfile {
  static #pool = new Pool({
    user: '',
    host: '',
    database: '',
    password: '',
    port: 1234
  });

  static #nextId = 1;

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

    this.#roleId = UserProfile.#nextId++;
    this.#roleName = roleName;
    this.#description = description;
  }

  get roleId() { return this.#roleId; }

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
        `SELECT roleId, roleName, description FROM UserProfile WHERE roleName = $1`,
        [roleName]
      );
      if (result.rowCount === 0) return null;
      const row = result.rows[0];
      const profile = new UserProfile(row.rolename, row.description);
      profile.#roleId = row.roleid; // Override auto-assigned ID with DB value
      return profile;
    } finally {
      client.release();
    }
  }

  static async getAllProfiles() {
    const client = await this.#pool.connect();
    try {
      const result = await client.query(`SELECT roleId, roleName, description FROM UserProfile`);
      return result.rows.map(row => {
        const profile = new UserProfile(row.rolename, row.description);
        profile.#roleId = row.roleid;
        return profile;
      });
    } finally {
      client.release();
    }
  }

  async createUserProfile() {
    const client = await UserProfile.#pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO UserProfile (roleId, roleName, description)
         VALUES ($1, $2, $3)
         RETURNING roleId`,
        [this.#roleId, this.#roleName, this.#description]
      );
      return result.rows[0].roleid;
    } finally {
      client.release();
    }
  }
}