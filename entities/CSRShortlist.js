import { Pool } from 'pg';
import { UserAccount } from './UserAccount.js';
import { ServiceRequest } from './ServiceRequest.js';
import { RoleNames } from '../constants/RoleNames.js';

export class CSRShortlist {
  static #pool = new Pool({
    user: '',
    host: '',
    database: '',
    password: '',
    port: 1234
  });

  #id;
  #csrOwner; // UserAccount
  #serviceRequests; // Array of { id, serviceRequestId, title, description, dateShortlisted }
  #dateCreated;

  constructor(csrOwner) {
    if (!(csrOwner instanceof UserAccount)) {
      throw new TypeError("Expected csrOwner to be UserAccount");
    }
    if (!csrOwner.id) {
      throw new Error("CSR owner must have a valid ID");
    }
    // Validate CSR role
    if (csrOwner.profile.roleName !== RoleNames.CSR_REP) {
      throw new Error("Owner must have 'CSR Rep' role to create shortlist");
    }
    this.#csrOwner = csrOwner;
    this.#serviceRequests = [];
    this.#dateCreated = new Date();
  }

  get id() { return this.#id; }
  get csrOwner() { return this.#csrOwner; }
  get serviceRequests() { return this.#serviceRequests; }
  get dateCreated() { return this.#dateCreated; }

  async createShortlist() {
    const client = await CSRShortlist.#pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO CSRShortlist (csrId, dateCreated)
         VALUES ($1, $2) RETURNING id`,
        [this.#csrOwner.id, this.#dateCreated.toISOString()]
      );
      this.#id = result.rows[0].id;
      return this.#id;
    } finally {
      client.release();
    }
  }

  async addServiceRequest(serviceRequest) {
    if (!(serviceRequest instanceof ServiceRequest)) {
      throw new TypeError("Expected serviceRequest to be ServiceRequest");
    }
    if (!serviceRequest.id) {
      throw new Error("ServiceRequest must have a valid ID");
    }

    const item = {
      serviceRequestId: serviceRequest.id,
      title: serviceRequest.title,
      description: serviceRequest.description,
      dateShortlisted: new Date()
    };

    const client = await CSRShortlist.#pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO CSRShortlistItem (shortlistId, serviceRequestId, title, description, dateShortlisted)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [this.#id, item.serviceRequestId, item.title, item.description, item.dateShortlisted.toISOString()]
      );
      item.id = result.rows[0].id;
      this.#serviceRequests.push(item);
      return item.id;
    } finally {
      client.release();
    }
  }

  async loadServiceRequests() {
    const client = await CSRShortlist.#pool.connect();
    try {
      const result = await client.query(
        `SELECT id, serviceRequestId, title, description, dateShortlisted
         FROM CSRShortlistItem WHERE shortlistId=$1`,
        [this.#id]
      );
      this.#serviceRequests = result.rows.map(row => ({
        id: row.id,
        serviceRequestId: row.servicerequestid,
        title: row.title,
        description: row.description,
        dateShortlisted: new Date(row.dateshortlisted)
      }));
      return this.#serviceRequests;
    } finally {
      client.release();
    }
  }

  static async removeItemById(itemId) {
    const client = await this.#pool.connect();
    try {
      const result = await client.query(
        `DELETE FROM CSRShortlistItem WHERE id = $1`,
        [itemId]
      );
      return result.rowCount === 1;
    } finally {
      client.release();
    }
  }

  static async getByCSR(csrId) {
    const client = await this.#pool.connect();
    try {
      const result = await client.query(
        `SELECT id, csrId, dateCreated FROM CSRShortlist WHERE csrId=$1`,
        [csrId]
      );
      if (result.rowCount === 0) return null;

      const row = result.rows[0];
      const csrOwner = await UserAccount.findById(row.csrid);
      
      if (!csrOwner) {
        throw new Error(`CSR owner with ID ${row.csrid} not found`);
      }
      
      // Validate CSR role
      if (csrOwner.profile.roleName !== RoleNames.CSR_REP) {
        throw new Error(`User ${csrOwner.id} is not a CSR Rep`);
      }
      
      const shortlist = new CSRShortlist(csrOwner);
      shortlist.#id = row.id;
      shortlist.#dateCreated = new Date(row.datecreated);
      await shortlist.loadServiceRequests();
      return shortlist;
    } finally {
      client.release();
    }
  }
}