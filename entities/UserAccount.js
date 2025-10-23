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

    if (!(passwordHash instanceof Password)) {
      throw new TypeError("Expected passwordHash to be an instance of Password");
    }
    this.#passwordHash = passwordHash;

    this.#email = email;
    this.#profile = profile;
    this.#dateCreated = new Date();
    this.#isActive = true;
  }

  // ─── Getters and Setters ─────
  get id() { return this.#id; }
  get username() { return this.#username; }
  set username(value) { this.#username = value; }

  get name() { return this.#name; }
  set name(value) { this.#name = value; }

  get email() { return this.#email; }
  set email(value) { this.#email = value; }

  get profile() { return this.#profile; }
  set profile(value) {
    if (!(value instanceof UserProfile)) {
      throw new TypeError("Expected profile to be an instance of UserProfile");
    }
    this.#profile = value;
  }

  get dateCreated() { return this.#dateCreated; }
  set dateCreated(value) {
    if (!(value instanceof Date)) {
      throw new TypeError("Expected value to be a Date object");
    }
    this.#dateCreated = value;
  }

  get isActive() { return this.#isActive; }
  set isActive(value) {
    if (typeof value !== 'boolean') {
      throw new TypeError("isActive must be a boolean");
    }
    this.#isActive = value;
  }

  get passwordHash() {
    return this.#passwordHash;
  }

  // ─── Static Hydration ─────
  static async findById(userId) {
    const client = await this.#pool.connect();
    try {
      const result = await client.query(
        `SELECT 
           ua.userID,
           ua.username,
           ua.name,
           ua.password,
           ua.email,
           ua.dateCreated,
           ua.isActive,
           up.roleName,
           up.description
         FROM UserAccount ua
         JOIN UserProfile up ON ua.userProfile = up.roleName
         WHERE ua.userID = $1`,
        [userId]
      );

      if (result.rowCount === 0) return null;

      const row = result.rows[0];

      const password = new Password();
      Object.defineProperty(password, 'hash', {
        value: row.password,
        writable: false
      });

      const profile = new UserProfile(row.rolename, row.description);

      const account = new UserAccount(
        row.username,
        row.name,
        password,
        row.email,
        profile
      );
      account.#id = row.userid;
      account.dateCreated = new Date(row.datecreated);
      account.isActive = row.isactive;

      return account;
    } finally {
      client.release();
    }
  }

  // ─── Update Logic ─────
  async updateUserAccount(name, email, rawPassword, profile, isActive) {
    this.#name = name;
    this.#email = email;
    this.#isActive = isActive;

    const passwordHash = new Password(String(rawPassword));
    Object.defineProperty(this.#passwordHash, 'hash', {
      value: passwordHash.hash,
      writable: false
    });

    this.#profile = profile;

    const client = await UserAccount.#pool.connect();
    try {
      const result = await client.query(
        `UPDATE UserAccount
         SET name = $1,
             email = $2,
             password = $3,
             userProfile = $4,
             isActive = $5
         WHERE userID = $6`,
        [
          this.#name,
          this.#email,
          this.#passwordHash.hash,
          this.#profile.name,
          this.#isActive,
          this.#id
        ]
      );
      return result.rowCount === 1;
    } finally {
      client.release();
    }
  }

  // ─── Utility Methods ────────
  toString() {
    return `[UserAccount: ${this.#username}]`;
  }

  equals(other) {
    return other instanceof UserAccount && other.id === this.#id;
  }
}