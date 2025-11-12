import { Pool } from 'pg';
import { UserAccount } from './UserAccount.js';
import crypto from 'crypto';

export class Session {
  static #pool = new Pool({
    user: "UserAdmin",
    host: "localhost",
    database: "taigawarriors",
    password: "useradmin1234",
    port: 5432  //default postgres port
  });

  // Configurable session timeout (in minutes)
  static SESSION_TIMEOUT_MINUTES = 60;

  #id;
  #sessionToken;
  #userAccount; // UserAccount instance
  #loginTime;
  #lastActivity;
  #isActive;

  constructor(userAccount) {
    if (!(userAccount instanceof UserAccount)) {
      throw new TypeError("Expected userAccount to be UserAccount");
    }
    this.#userAccount = userAccount;
    this.#sessionToken = this.#generateToken();
    this.#loginTime = new Date();
    this.#lastActivity = new Date();
    this.#isActive = true;
  }

  get id() { return this.#id; }
  get sessionToken() { return this.#sessionToken; }
  get userAccount() { return this.#userAccount; }
  get loginTime() { return this.#loginTime; }
  get lastActivity() { return this.#lastActivity; }
  get isActive() { return this.#isActive; }

  // ═══════════════════════════════════ Generate Secure Token ══════════════════════════════════════════════════
  #generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // ═══════════════════════════════════ Create Session ═════════════════════════════════════════════════════════
  async createSession() {
    const client = await Session.#pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO session (sessiontoken, userid, logintime, lastactivity, isactive)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [
          this.#sessionToken,
          this.#userAccount.id,
          this.#loginTime.toISOString(),
          this.#lastActivity.toISOString(),
          this.#isActive
        ]
      );
      this.#id = result.rows[0].id;
      return this.#sessionToken;
    } finally {
      client.release();
    }
  }

  // ═══════════════════════════════════ Update Last Activity ═══════════════════════════════════════════════════
  async updateActivity() {
    this.#lastActivity = new Date();
    const client = await Session.#pool.connect();
    try {
      await client.query(
        `UPDATE session SET lastactivity = $1 WHERE id = $2`,
        [this.#lastActivity.toISOString(), this.#id]
      );
    } finally {
      client.release();
    }
  }

  // ═══════════════════════════════════ End Session ════════════════════════════════════════════════════════════
  async endSession() {
    this.#isActive = false;
    const client = await Session.#pool.connect();
    try {
      const result = await client.query(
        `UPDATE session SET isactive = false WHERE id = $1`,
        [this.#id]
      );
      return result.rowCount === 1;
    } finally {
      client.release();
    }
  }

  // ═══════════════════════════════════ Find Session By Token ══════════════════════════════════════════════════
  static async findByToken(sessionToken) {
    const client = await this.#pool.connect();
    try {
      const result = await client.query(
        `SELECT id, sessiontoken, userid, logintime, lastactivity, isactive
          FROM session
          WHERE sessiontoken = $1 AND isactive = true`,
        [sessionToken]
      );

      if (result.rowCount === 0) return null;

      const row = result.rows[0];
      const userAccount = await UserAccount.findById(row.userid);
      if (!userAccount) return null;

      const session = new Session(userAccount);
      session.#id = row.id;
      session.#sessionToken = row.sessiontoken;
      session.#loginTime = new Date(row.logintime);
      session.#lastActivity = new Date(row.lastactivity);
      session.#isActive = row.isactive;

      return session;
    } finally {
      client.release();
    }
  }

  // ═══════════════════════════════════ Validate Session (Check Timeout) ══════════════════════════════════════
  isValid(timeoutMinutes = null) {
    if (!this.#isActive) return false;
    
    // Use provided timeout or default from class
    const timeout = timeoutMinutes !== null ? timeoutMinutes : Session.SESSION_TIMEOUT_MINUTES;
    
    const now = new Date();
    const diffMinutes = (now - this.#lastActivity) / (1000 * 60);
    
    return diffMinutes < timeout;
  }

  // ═══════════════════════════════════ End All Sessions For User ═════════════════════════════════════════════
  static async endAllSessionsForUser(userId) {
    const client = await this.#pool.connect();
    try {
      const result = await client.query(
        `UPDATE Session SET isActive = false WHERE userId = $1 AND isActive = true`,
        [userId]
      );
      return result.rowCount;
    } finally {
      client.release();
    }
  }

  // ═══════════════════════════════════ Cleanup Expired Sessions (Background Job) ═════════════════════════════
  static async cleanupExpiredSessions(timeoutMinutes = null) {
    const timeout = timeoutMinutes !== null ? timeoutMinutes : Session.SESSION_TIMEOUT_MINUTES;
    const client = await this.#pool.connect();
    try {
      const cutoffTime = new Date(Date.now() - timeout * 60 * 1000);
      const result = await client.query(
        `UPDATE Session SET isActive = false 
         WHERE isActive = true AND lastActivity < $1`,
        [cutoffTime.toISOString()]
      );
      return result.rowCount;
    } finally {
      client.release();
    }
  }
}