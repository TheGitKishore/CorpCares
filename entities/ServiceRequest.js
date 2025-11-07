// ServiceRequest.js

import { Pool } from 'pg';
import { ServiceCategory } from './ServiceCategory.js';
import { UserAccount } from './UserAccount.js';

export class ServiceRequest {
  static #pool = new Pool({
    user: '',
    host: '',
    database: '',
    password: '',
    port: 1234
  });

  #id;
  #title;
  #description;
  #category;
  #owner;
  #datePosted;

  constructor(title, description, category, owner) {
    this.#id = null;
    this.#title = title;
    this.#description = description;

    if (!(category instanceof ServiceCategory)) {
      throw new TypeError("Expected category to be an instance of ServiceCategory");
    }
    this.#category = category;

    if (!(owner instanceof UserAccount)) {
      throw new TypeError("Expected owner to be an instance of UserAccount");
    }
    this.#owner = owner;

    this.#datePosted = new Date();
  }

  get id() { return this.#id; }
  get title() { return this.#title; }
  set title(value) { this.#title = value; }

  get description() { return this.#description; }
  set description(value) { this.#description = value; }

  get category() { return this.#category; }
  set category(value) {
    if (!(value instanceof ServiceCategory)) {
      throw new TypeError("Expected category to be ServiceCategory");
    }
    this.#category = value;
  }

  get owner() { return this.#owner; }
  set owner(value) {
    if (!(value instanceof UserAccount)) {
      throw new TypeError("Expected owner to be UserAccount");
    }
    this.#owner = value;
  }

  get datePosted() { return this.#datePosted; }

  // ─── Create ───────────────────────────────────────────────
  async createServiceRequest() {
    const client = await ServiceRequest.#pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO ServiceRequest (title, description, categoryTitle, ownerId, datePosted)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [
          this.#title,
          this.#description,
          this.#category.title,   // use category title as FK
          this.#owner.id,
          this.#datePosted.toISOString()
        ]
      );
      this.#id = result.rows[0].id;
      return this.#id;
    } finally {
      client.release();
    }
  }

  // ─── Update ───────────────────────────────────────────────
  async updateServiceRequest(title, description, category) {
    this.#title = title;
    this.#description = description;
    this.category = category; // setter enforces type

    const client = await ServiceRequest.#pool.connect();
    try {
      const result = await client.query(
        `UPDATE ServiceRequest
         SET title = $1, description = $2, categoryTitle = $3
         WHERE id = $4`,
        [this.#title, this.#description, this.#category.title, this.#id]
      );
      return result.rowCount === 1;
    } finally {
      client.release();
    }
  }

  // ─── Delete ───────────────────────────────────────────────
  async deleteServiceRequest() {
    const client = await ServiceRequest.#pool.connect();
    try {
      const result = await client.query(
        `DELETE FROM ServiceRequest WHERE id = $1`,
        [this.#id]
      );
      return result.rowCount === 1;
    } finally {
      client.release();
    }
  }

  // ─── View All ─────────────────────────────────────────────
  static async viewAllServiceRequests() {
    const client = await this.#pool.connect();
    try {
      const result = await client.query(
        `SELECT id, title, description, categoryTitle, ownerId, datePosted
         FROM ServiceRequest`
      );

      return await Promise.all(result.rows.map(async row => {
        const category = await ServiceCategory.getServiceCategoryByTitle(row.categorytitle);
        const owner = await UserAccount.findById(row.ownerid);

        const request = new ServiceRequest(row.title, row.description, category, owner);
        request.#id = row.id;
        request.#datePosted = new Date(row.dateposted);
        return request;
      }));
    } finally {
      client.release();
    }
  }

  // ─── View Single By Id ────────────────────────────────────
  static async findById(id) {
    const client = await this.#pool.connect();
    try {
      const result = await client.query(
        `SELECT id, title, description, categoryTitle, ownerId, datePosted
         FROM ServiceRequest WHERE id = $1`,
        [id]
      );

      if (result.rowCount === 0) return null;
      const row = result.rows[0];

      const category = await ServiceCategory.getServiceCategoryByTitle(row.categorytitle);
      const owner = await UserAccount.findById(row.ownerid);

      const request = new ServiceRequest(row.title, row.description, category, owner);
      request.#id = row.id;
      request.#datePosted = new Date(row.dateposted);
      return request;
    } finally {
      client.release();
    }
  }

  // ─── View Single By Title ─────────────────────────────────
  static async findByTitle(title) {
    const client = await this.#pool.connect();
    try {
      const result = await client.query(
        `SELECT id, title, description, categoryTitle, ownerId, datePosted
         FROM ServiceRequest WHERE title = $1`,
        [title]
      );

      if (result.rowCount === 0) return null;
      const row = result.rows[0];

      const category = await ServiceCategory.getServiceCategoryByTitle(row.categorytitle);
      const owner = await UserAccount.findById(row.ownerid);

      const request = new ServiceRequest(row.title, row.description, category, owner);
      request.#id = row.id;
      request.#datePosted = new Date(row.dateposted);
      return request;
    } finally {
      client.release();
    }
  }
}