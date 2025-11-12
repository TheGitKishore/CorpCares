// ServiceCategory.js
import { Pool } from 'pg';

export class ServiceCategory {
  static #pool = new Pool({
    user: "UserAdmin",
    host: "localhost",
    database: "taigawarriors",
    password: "useradmin1234",
    port: 5432  //default postgres port
  });

  #id;
  #title;
  #description;

  constructor(title, description) {
    this.#id = null;
    this.#title = title;
    this.#description = description;
  }

  get id() { return this.#id; }
  get title() { return this.#title; }
  set title(value) { this.#title = value; }

  get description() { return this.#description; }
  set description(value) { this.#description = value; }

  // ─── Create ───────────────────────────────
  async createServiceCategory() {
    const client = await ServiceCategory.#pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO ServiceCategory (title, description)
         VALUES ($1, $2) RETURNING id`,
        [this.#title, this.#description]
      );
      this.#id = result.rows[0].id;
      return this.#id;
    } finally {
      client.release();
    }
  }

  // ─── Update ───────────────────────────────
  async updateServiceCategory(title, description) {
    this.#title = title;
    this.#description = description;
    const client = await ServiceCategory.#pool.connect();
    try {
      const result = await client.query(
        `UPDATE ServiceCategory SET title=$1, description=$2 WHERE id=$3`,
        [this.#title, this.#description, this.#id]
      );
      return result.rowCount === 1;
    } finally {
      client.release();
    }
  }

  // ─── Delete ───────────────────────────────
  async deleteServiceCategory() {
    const client = await ServiceCategory.#pool.connect();
    try {
      const result = await client.query(
        `DELETE FROM ServiceCategory WHERE id=$1`,
        [this.#id]
      );
      return result.rowCount === 1;
    } finally {
      client.release();
    }
  }

  // ─── View All ─────────────────────────────
  static async getAllServiceCategories() {
    const client = await this.#pool.connect();
    try {
      const result = await client.query(`SELECT id, title, description FROM ServiceCategory`);
      return result.rows.map(row => {
        const cat = new ServiceCategory(row.title, row.description);
        cat.#id = row.id;
        return cat;
      });
    } finally {
      client.release();
    }
  }

  // ─── View Single By Id ────────────────────
  static async getServiceCategoryById(id) {
    const client = await this.#pool.connect();
    try {
      const result = await client.query(
        `SELECT id, title, description FROM ServiceCategory WHERE id=$1`,
        [id]
      );
      if (result.rowCount === 0) return null;
      const row = result.rows[0];
      const cat = new ServiceCategory(row.title, row.description);
      cat.#id = row.id;
      return cat;
    } finally {
      client.release();
    }
  }

  // ─── View Single By Title ─────────────────
  static async getServiceCategoryByTitle(title) {
    const client = await this.#pool.connect();
    try {
      const result = await client.query(
        `SELECT id, title, description FROM ServiceCategory WHERE title=$1`,
        [title]
      );
      if (result.rowCount === 0) return null;
      const row = result.rows[0];
      const cat = new ServiceCategory(row.title, row.description);
      cat.#id = row.id;
      return cat;
    } finally {
      client.release();
    }
  }
}