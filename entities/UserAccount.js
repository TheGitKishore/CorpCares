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

  static #nextId = 1;

  #id;
  #username;
  #name;
  #passwordHash;
  #email;
  #profile;
  #dateCreated;
  #isActive;

  constructor(username, name, passwordHash, email, profile) {
    this.#id = UserAccount.#nextId++;
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
      throw new TypeError("Expected profile to be a instance of UserProfile");
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

  // ─── Persistence Logic ─────

  static async existsByUsername(username) {
    const client = await this.#pool.connect();
    try {
      const result = await client.query(
        'SELECT 1 FROM UserAccount WHERE username = $1 LIMIT 1',
        [username]
      );
      return result.rowCount > 0;
    } finally {
      client.release();
    }
  }

  async createUserAccount() {
    const client = await UserAccount.#pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO UserAccount (username, password, userProfile, email, name, dateCreated, isActive)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING userID`,
        [
          this.#username,
          this.#passwordHash.hash,
          this.#profile.name,
          this.#email,
          this.#name,
          this.#dateCreated.toISOString(),
          this.#isActive
        ]
      );
      return result.rows[0].userid;
    } finally {
      client.release();
    }
  }

  static async viewUserAccounts() {
    const client = await this.#pool.connect();
    try {
      const result = await client.query(
        `SELECT username, name, password, userProfile, email, dateCreated, isActive
         FROM UserAccount`
      );

      return result.rows.map(row => {
        const password = new Password();
        Object.defineProperty(password, 'hash', {
          value: row.password,
          writable: false
        });

        //const profile = new UserProfile(row.userprofile); // Adjust constructor if needed

        const account = new UserAccount(
          row.username,
          row.name,
          password,
          row.email,
          profile
        );
        account.dateCreated = new Date(row.datecreated);
        account.isActive = row.isactive;
        return account;
      });
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