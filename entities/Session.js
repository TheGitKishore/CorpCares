import { Pool } from 'pg';
import { UserAccount } from './UserAccount.js';
import crypto from 'crypto';

export class Session {
  static #pool = new Pool({
    user: '',
    host: '',
    database: '',
    password: '',
    port: 1234
  });

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

  // ─── Generate Secure Token ────────────────────────────
  #generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // ─── Create Session ───────────────────────────────────
  async createSession() {
    const client = await Session.#pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO Session (sessionToken, userId, loginTime, lastActivity, isActive)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
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

  // ─── Update Last Activity ─────────────────────────────
  async updateActivity() {
    this.#lastActivity = new Date();
    const client = await Session.#pool.connect();
    try {
      await client.query(
        `UPDATE Session SET lastActivity = $1 WHERE id = $2`,
        [this.#lastActivity.toISOString(), this.#id]
      );
    } finally {
      client.release();
    }
  }

  // ─── End Session ──────────────────────────────────────
  async endSession() {
    this.#isActive = false;
    const client = await Session.#pool.connect();
    try {
      const result = await client.query(
        `UPDATE Session SET isActive = false WHERE id = $1`,
        [this.#id]
      );
      return result.rowCount === 1;
    } finally {
      client.release();
    }
  }

  // ─── Find Session By Token ────────────────────────────
  static async findByToken(sessionToken) {
    const client = await this.#pool.connect();
    try {
      const result = await client.query(
        `SELECT id, sessionToken, userId, loginTime, lastActivity, isActive
         FROM Session WHERE sessionToken = $1 AND isActive = true`,
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

  // ─── Validate Session (Check Timeout) ─────────────────
  isValid(timeoutMinutes = 60) {
    if (!this.#isActive) return false;
    
    const now = new Date();
    const diffMinutes = (now - this.#lastActivity) / (1000 * 60);
    
    return diffMinutes < timeoutMinutes;
  }

  // ─── End All Sessions For User ────────────────────────
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
}