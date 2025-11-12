import { Pool } from 'pg';
import { Password } from './Password.js';
import { UserProfile } from './UserProfile.js';
import { RolePermissions } from "../constants/Permissions.js";

export class UserAccount {
  static #pool = new Pool({
    user: "UserAdmin",
    host: "localhost",
    database: "taigawarriors",
    password: "useradmin1234",
    port: 5432  //default postgres port
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
  set dateCreated(v) {
    if (!(v instanceof Date)) throw new TypeError("dateCreated must be a Date");
    this.#dateCreated = v;
  }

  get isActive() { return this.#isActive; }
  set isActive(v) {
    if (typeof v !== "boolean") {
      throw new TypeError("isActive must be a boolean");
    }
    this.#isActive = v;
  } 

  get passwordHash() { return this.#passwordHash; }

  // ═══════════════════════ Create ═══════════════════════
  async createUserAccount() {
    const client = await UserAccount.#pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO UserAccount (username, password, profile, email, fullname, dateCreated, isActive)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
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
      this.#id = result.rows[0].id;
      return this.#id;
    } finally {
      client.release();
    }
  }

  // ═══════════════════════ Update (with optional password) ═══════════════════════
  /**
   * Update user account information
   * Password parameter is optional - pass null or undefined to keep existing password
   * Pass empty string to skip password update
   * Pass valid string to update password
   * Returns: { passwordUpdated: boolean, accountUpdated: boolean }
   */
  async updateUserAccount(username, name, email, rawPassword, profile, isActive) {
    this.#username = username;
    this.#name = name;
    this.#email = email;
    this.#isActive = isActive;
    this.#profile = profile;

    let passwordUpdated = false;

    // Only update password if a valid non-empty string is provided
    if (rawPassword !== null && rawPassword !== undefined && 
        typeof rawPassword === 'string' && rawPassword.trim().length > 0) {
      this.#passwordHash = new Password(rawPassword.trim());
      passwordUpdated = true;
    }

    const client = await UserAccount.#pool.connect();
    try {
      const result = await client.query(
        `UPDATE UserAccount
         SET username = $1, fullname = $2, email = $3, password = $4, profile = $5, isActive = $6
         WHERE id = $7`,
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
      
      const accountUpdated = result.rowCount === 1;
      
      return {
        passwordUpdated: passwordUpdated,
        accountUpdated: accountUpdated
      };
    } finally {
      client.release();
    }
  }

  // ═══════════════════════ Delete (with cascade cleanup) ═══════════════════════
  /**
   * Delete user account with cascade cleanup of all related data
   * Deletion order is important to maintain referential integrity:
   * 1. Sessions (references id)
   * 2. CSRSavedRequestItem (references savedListId)
   * 3. CSRSavedRequest (references csrId)
   * 4. CSRShortlistItem (references shortlistId)
   * 5. CSRShortlist (references csrId)
   * 6. ServiceRequest (references ownerId)
   * 7. UserAccount (main entity)
   */
  async deleteUserAccount() {
    const client = await UserAccount.#pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Delete all sessions for this user
      await client.query(
        `DELETE FROM Session WHERE id = $1`,
        [this.#id]
      );

      // 2. Delete saved request items (child records first)
      await client.query(
        `DELETE FROM CSRSavedRequestItem WHERE savedListId IN 
         (SELECT id FROM CSRSavedRequest WHERE csrId = $1)`,
        [this.#id]
      );

      // 3. Delete saved request lists
      await client.query(
        `DELETE FROM CSRSavedRequest WHERE csrId = $1`,
        [this.#id]
      );

      // 4. Delete shortlist items (child records first)
      await client.query(
        `DELETE FROM CSRShortlistItem WHERE shortlistId IN 
         (SELECT id FROM CSRShortlist WHERE csrId = $1)`,
        [this.#id]
      );

      // 5. Delete shortlists
      await client.query(
        `DELETE FROM CSRShortlist WHERE csrId = $1`,
        [this.#id]
      );

      // 6. Delete service requests owned by this user
      await client.query(
        `DELETE FROM ServiceRequest WHERE ownerId = $1`,
        [this.#id]
      );

      // 7. Finally, delete the user account
      const result = await client.query(
        `DELETE FROM UserAccount WHERE id = $1`,
        [this.#id]
      );

      await client.query('COMMIT');
      return result.rowCount === 1;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // ═══════════════════════ View All ═══════════════════════
  static async viewUserAccounts() {
    const client = await this.#pool.connect();
    try {
      const result = await client.query(
        `SELECT ua.*, up.roleName, up.description, up.permissions
          FROM UserAccount ua
          LEFT JOIN UserProfile up ON ua.profile = up.roleName`
      );

      return result.rows.map(row => {
        const profile =
        row.rolename != null
          ? new UserProfile(row.rolename, row.description)
          : (row.profilekey ? new UserProfile(row.profilekey) : null);
        const passwordHash = Password.fromHash(row.password);
        const account = new UserAccount(row.username, row.fullname, passwordHash, row.email, profile);
        account.#id = row.id;
        account.#dateCreated = new Date(row.datecreated);
        account.#isActive = row.isactive;
        return account;
      });
    } finally {
      client.release();
    }
  }

  // ═══════════════════════ View Single By ID ═══════════════════════
  static async findById(userId) {
    const client = await this.#pool.connect();
    try {
      const result = await client.query(
        `SELECT ua.*, up.roleName, up.description, up.permissions
          FROM UserAccount ua
          LEFT JOIN UserProfile up ON ua.profile = up.roleName
          WHERE ua.id = $1 `,
        [userId]
      );

      if (result.rowCount === 0) return null;
      const row = result.rows[0];

      const profile =
        row.rolename != null
          ? new UserProfile(row.rolename, row.description)
          : (row.profilekey ? new UserProfile(row.profilekey) : null);
      const passwordHash = Password.fromHash(row.password);
      const account = new UserAccount(row.username, row.fullname, passwordHash, row.email, profile);
      account.#id = row.id;
      account.#dateCreated = new Date(row.datecreated);
      account.#isActive = row.isactive;
      return account;
    } finally {
      client.release();
    }
  }

  // ═══════════════════════ Find By Username ═══════════════════════
  static async findByUsername(username) {
    const client = await this.#pool.connect();
    try {
      const result = await client.query(
        `SELECT ua.*, up.roleName, up.description, up.permissions
          FROM UserAccount ua
          LEFT JOIN UserProfile up ON ua.profile = up.roleName
          WHERE ua.username = $1`,
        [username]
      );

      if (result.rowCount === 0) return null;
      const row = result.rows[0];

      const profile = new UserProfile(
        row.rolename,                     // from SELECT alias
        row.description ?? "",
        row.permissions ?? RolePermissions[row.rolename] ?? []
      );
      
      //new addition
      if (!row.password) {
        throw new Error(`Password is NULL/empty for user '${row.username}' (id ${row.id})`);
      }
      //
      const passwordHash = Password.fromHash(row.password);
      
      const account = new UserAccount(row.username, row.fullname, passwordHash, row.email, profile);
      account.#id = row.id;
      account.#dateCreated = new Date(row.datecreated);
      account.#isActive = row.isactive;
      return account;
    } finally {
      client.release();
    }
  }

  // ═══════════════════════ Exists by ID ═══════════════════════
  static async existsById(userId) {
    const client = await this.#pool.connect();
    try {
      const result = await client.query(
        `SELECT 1 FROM UserAccount WHERE id = $1`,
        [userId]
      );
      return result.rowCount > 0;
    } finally {
      client.release();
    }
  }

  // ═══════════════════════ Exists by Username ═══════════════════════
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

  // ═══════════════════════ Verify Password ═══════════════════════
  /**
   * Verify a raw password against this user account's stored hash
   * Returns: boolean indicating if password is correct
   */
  verifyPassword(rawPassword) {
    const passwordObj = Password.fromHash(this.#passwordHash.hash);
    return passwordObj.verify(rawPassword);
  }
}