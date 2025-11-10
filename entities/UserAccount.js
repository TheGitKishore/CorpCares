import { Pool } from 'pg';
import { Password } from './Password.js';
import { UserProfile } from './UserProfile.js';

export class UserAccount {
  static #pool = new Pool({
    user: '',
    host: '',
    database: '',
    password: '',
    port: 1234
  });

  #id;
  #username;
  #name;
  #passwordHash;
  #email;
  #profile;
  #dateCreated;
  #isActive;

  constructor(username, name, passwordHash, email, profile) {
    this.#id = null;
    this.#username = username;
    this.#name = name;
    this.#passwordHash = passwordHash;
    this.#email = email;
    this.#profile = profile;
    this.#dateCreated = new Date();
    this.#isActive = true;
  }

  get id() { return this.#id; }
  get username() { return this.#username; }
  get name() { return this.#name; }
  get email() { return this.#email; }
  get profile() { return this.#profile; }
  get dateCreated() { return this.#dateCreated; }
  get isActive() { return this.#isActive; }
  get passwordHash() { return this.#passwordHash.hash; } // Expose hash for verification

  // ═══════════════ Create ═══════════════════════════════════════════════════
  async createUserAccount() {
    const client = await UserAccount.#pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO UserAccount (username, password, userProfileRoleName, email, name, dateCreated, isActive)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING userID`,
        [
          this.#username,
          this.#passwordHash.hash,
          this.#profile.roleName,
          this.#email,
          this.#name,
          this.#dateCreated.toISOString(),
          this.#isActive
        ]
      );
      this.#id = result.rows[0].userid;
      return this.#id;
    } finally {
      client.release();
    }
  }

  // ═══════════════ Update ═══════════════════════════════════════════════════
  async updateUserAccount(username, name, email, rawPassword, profile, isActive) {
    this.#username = username;
    this.#name = name;
    this.#email = email;
    this.#isActive = isActive;
    this.#profile = profile;
    this.#passwordHash = new Password(String(rawPassword));

    const client = await UserAccount.#pool.connect();
    try {
      const result = await client.query(
        `UPDATE UserAccount
         SET username = $1, name = $2, email = $3, password = $4, userProfileRoleName = $5, isActive = $6
         WHERE userID = $7`,
        [
          this.#username,
          this.#name,
          this.#email,
          this.#passwordHash.hash,
          this.#profile.roleName,
          this.#isActive,
          this.#id
        ]
      );
      return result.rowCount === 1;
    } finally {
      client.release();
    }
  }

  // ═══════════════ Delete ═══════════════════════════════════════════════════
  async deleteUserAccount() {
    const client = await UserAccount.#pool.connect();
    try {
      const result = await client.query(
        `DELETE FROM UserAccount WHERE userID = $1`,
        [this.#id]
      );
      return result.rowCount === 1;
    } finally {
      client.release();
    }
  }

  // ═══════════════ View All ══════════════════════════════════════════════════
  static async viewUserAccounts() {
    const client = await this.#pool.connect();
    try {
      const result = await client.query(
        `SELECT ua.*, up.roleName, up.description, up.permissions
         FROM UserAccount ua
         JOIN UserProfile up ON ua.userProfileRoleName = up.roleName`
      );

      return result.rows.map(row => {
        const profile = new UserProfile(row.rolename, row.description, row.permissions || []);
        const passwordHash = Password.fromHash(row.password);
        const account = new UserAccount(row.username, row.name, passwordHash, row.email, profile);
        account.#id = row.userid;
        account.#dateCreated = new Date(row.datecreated);
        account.#isActive = row.isactive;
        return account;
      });
    } finally {
      client.release();
    }
  }

  // ═══════════════ View Single By ID ════════════════════════════════════════
  static async findById(userId) {
    const client = await this.#pool.connect();
    try {
      const result = await client.query(
        `SELECT ua.*, up.roleName, up.description, up.permissions
         FROM UserAccount ua
         JOIN UserProfile up ON ua.userProfileRoleName = up.roleName
         WHERE ua.userID = $1`,
        [userId]
      );

      if (result.rowCount === 0) return null;
      const row = result.rows[0];

      const profile = new UserProfile(row.rolename, row.description, row.permissions || []);
      const passwordHash = Password.fromHash(row.password);
      const account = new UserAccount(row.username, row.name, passwordHash, row.email, profile);
      account.#id = row.userid;
      account.#dateCreated = new Date(row.datecreated);
      account.#isActive = row.isactive;
      return account;
    } finally {
      client.release();
    }
  }

  // ═══════════════ Find By Username ══════════════════════════════════════════
  static async findByUsername(username) {
    const client = await this.#pool.connect();
    try {
      const result = await client.query(
        `SELECT ua.*, up.roleName, up.description, up.permissions
         FROM UserAccount ua
         JOIN UserProfile up ON ua.userProfileRoleName = up.roleName
         WHERE ua.username = $1`,
        [username]
      );

      if (result.rowCount === 0) return null;
      const row = result.rows[0];

      const profile = new UserProfile(row.rolename, row.description, row.permissions || []);
      const passwordHash = Password.fromHash(row.password);
      const account = new UserAccount(row.username, row.name, passwordHash, row.email, profile);
      account.#id = row.userid;
      account.#dateCreated = new Date(row.datecreated);
      account.#isActive = row.isactive;
      return account;
    } finally {
      client.release();
    }
  }

  // ═══════════════ Exists by ID ══════════════════════════════════════════════
  static async existsById(userId) {
    const client = await this.#pool.connect();
    try {
      const result = await client.query(
        `SELECT 1 FROM UserAccount WHERE userID = $1`,
        [userId]
      );
      return result.rowCount > 0;
    } finally {
      client.release();
    }
  }

  // ═══════════════ Exists by Username ════════════════════════════════════════
  static async existsByUsername(username) {
    const client = await this.#pool.connect();
    try {
      const result = await client.query(
        `SELECT 1 FROM UserAccount WHERE username = $1`,
        [username]
      );
      return result.rowCount > 0;
    } finally {
      client.release();
    }
  }

  // ═══════════════ Verify Password ═══════════════════════════════════════════
  /**
   * Verify a raw password against this user account's stored hash
   * Returns: boolean indicating if password is correct
   */
  verifyPassword(rawPassword) {
    const passwordObj = Password.fromHash(this.#passwordHash.hash);
    return passwordObj.verify(rawPassword);
  }
}