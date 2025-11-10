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
  #status; // "Pending" | "Matched" | "Complete"
  #shortlistCount;
  #saveCount;

  constructor(title, description, category, owner) {
    // Validation
    if (!title || title.trim().length === 0) {
      throw new Error("Title cannot be empty");
    }
    if (title.length > 200) {
      throw new Error("Title cannot exceed 200 characters");
    }
    if (!description || description.trim().length === 0) {
      throw new Error("Description cannot be empty");
    }
    if (description.length > 2000) {
      throw new Error("Description cannot exceed 2000 characters");
    }

    // Validation
    if (!title || title.trim().length === 0) {
      throw new Error("Title cannot be empty");
    }
    if (title.length > 200) {
      throw new Error("Title cannot exceed 200 characters");
    }
    if (!description || description.trim().length === 0) {
      throw new Error("Description cannot be empty");
    }
    if (description.length > 2000) {
      throw new Error("Description cannot exceed 2000 characters");
    }

    this.#id = null;
    this.#title = title.trim();
    this.#description = description.trim();
    this.#title = title.trim();
    this.#description = description.trim();

    if (!(category instanceof ServiceCategory)) {
      throw new TypeError("Expected category to be an instance of ServiceCategory");
    }
    if (!category.id) {
      throw new Error("ServiceCategory must have a valid ID");
    }
    this.#category = category;

    if (!(owner instanceof UserAccount)) {
      throw new TypeError("Expected owner to be an instance of UserAccount");
    }
    if (!owner.id) {
      throw new Error("UserAccount owner must have a valid ID");
    }
    this.#owner = owner;

    this.#datePosted = new Date();
    this.#status = "Pending"; // Default status
    this.#shortlistCount = 0;
    this.#saveCount = 0;
  }

  get id() { return this.#id; }
  get title() { return this.#title; }
  set title(value) { 
    if (!value || value.trim().length === 0) {
      throw new Error("Title cannot be empty");
    }
    if (value.length > 200) {
      throw new Error("Title cannot exceed 200 characters");
    }
    this.#title = value.trim(); 
  }
  set title(value) { 
    if (!value || value.trim().length === 0) {
      throw new Error("Title cannot be empty");
    }
    if (value.length > 200) {
      throw new Error("Title cannot exceed 200 characters");
    }
    this.#title = value.trim(); 
  }

  get description() { return this.#description; }
  set description(value) { 
    if (!value || value.trim().length === 0) {
      throw new Error("Description cannot be empty");
    }
    if (value.length > 2000) {
      throw new Error("Description cannot exceed 2000 characters");
    }
    this.#description = value.trim(); 
  }
  set description(value) { 
    if (!value || value.trim().length === 0) {
      throw new Error("Description cannot be empty");
    }
    if (value.length > 2000) {
      throw new Error("Description cannot exceed 2000 characters");
    }
    this.#description = value.trim(); 
  }

  get category() { return this.#category; }
  set category(value) {
    if (!(value instanceof ServiceCategory)) {
      throw new TypeError("Expected category to be ServiceCategory");
    }
    if (!value.id) {
      throw new Error("ServiceCategory must have a valid ID");
    }
    this.#category = value;
  }

  get owner() { return this.#owner; }
  set owner(value) {
    if (!(value instanceof UserAccount)) {
      throw new TypeError("Expected owner to be UserAccount");
    }
    if (!value.id) {
      throw new Error("UserAccount owner must have a valid ID");
    }
    this.#owner = value;
  }

  get datePosted() { return this.#datePosted; }
  get status() { return this.#status; }
  get shortlistCount() { return this.#shortlistCount; }
  get saveCount() { return this.#saveCount; }

  // ═══════════════════════════════════ Create ═════════════════════════════════════════════════════════════════
  async createServiceRequest() {
    const client = await ServiceRequest.#pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO ServiceRequest (title, description, categoryTitle, ownerId, datePosted, status, shortlistCount, saveCount)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [
          this.#title,
          this.#description,
          this.#category.title,
          this.#owner.id,
          this.#datePosted.toISOString(),
          this.#status,
          this.#shortlistCount,
          this.#saveCount
        ]
      );
      this.#id = result.rows[0].id;
      return this.#id;
    } finally {
      client.release();
    }
  }

  // ═══════════════════════════════════ Update ═════════════════════════════════════════════════════════════════
  async updateServiceRequest(title, description, category) {
    this.title = title; // Uses setter with validation
    this.description = description; // Uses setter with validation
    this.category = category; // setter enforces type and validates ID

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

  // ═══════════════════════════════════ Update Status ═════════════════════════════════════════════════════════
  async updateStatus(newStatus) {
    const validStatuses = ["Pending", "Matched", "Complete"];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    this.#status = newStatus;

    const client = await ServiceRequest.#pool.connect();
    try {
      const result = await client.query(
        `UPDATE ServiceRequest SET status = $1 WHERE id = $2`,
        [this.#status, this.#id]
      );
      return result.rowCount === 1;
    } finally {
      client.release();
    }
  }

  // ═══════════════════════════════════ Increment Shortlist Count ═════════════════════════════════════════════
  async incrementShortlistCount() {
    this.#shortlistCount += 1;

    const client = await ServiceRequest.#pool.connect();
    try {
      const result = await client.query(
        `UPDATE ServiceRequest SET shortlistCount = shortlistCount + 1 WHERE id = $1`,
        [this.#id]
      );
      return result.rowCount === 1;
    } finally {
      client.release();
    }
  }

  // ═══════════════════════════════════ Decrement Shortlist Count ═════════════════════════════════════════════
  async decrementShortlistCount() {
    if (this.#shortlistCount > 0) {
      this.#shortlistCount -= 1;

      const client = await ServiceRequest.#pool.connect();
      try {
        const result = await client.query(
          `UPDATE ServiceRequest SET shortlistCount = GREATEST(0, shortlistCount - 1) WHERE id = $1`,
          [this.#id]
        );
        return result.rowCount === 1;
      } finally {
        client.release();
      }
    }
    return false;
  }

  // ═══════════════════════════════════ Increment Save Count ══════════════════════════════════════════════════
  async incrementSaveCount() {
    this.#saveCount += 1;

    const client = await ServiceRequest.#pool.connect();
    try {
      const result = await client.query(
        `UPDATE ServiceRequest SET saveCount = saveCount + 1 WHERE id = $1`,
        [this.#id]
      );
      return result.rowCount === 1;
    } finally {
      client.release();
    }
  }

  // ═══════════════════════════════════ Decrement Save Count ══════════════════════════════════════════════════
  async decrementSaveCount() {
    if (this.#saveCount > 0) {
      this.#saveCount -= 1;

      const client = await ServiceRequest.#pool.connect();
      try {
        const result = await client.query(
          `UPDATE ServiceRequest SET saveCount = GREATEST(0, saveCount - 1) WHERE id = $1`,
          [this.#id]
        );
        return result.rowCount === 1;
      } finally {
        client.release();
      }
    }
    return false;
  }

  // ═══════════════════════════════════ Delete ═════════════════════════════════════════════════════════════════
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

  // ═══════════════════════════════════ View All ═══════════════════════════════════════════════════════════════
  static async viewAllServiceRequests() {
    const client = await this.#pool.connect();
    try {
      const result = await client.query(
        `SELECT id, title, description, categoryTitle, ownerId, datePosted, status, shortlistCount, saveCount
         FROM ServiceRequest`
      );

      return await Promise.all(result.rows.map(async row => {
        const category = await ServiceCategory.getServiceCategoryByTitle(row.categorytitle);
        const owner = await UserAccount.findById(row.ownerid);

        if (!category || !owner) {
          throw new Error(`Invalid foreign key reference in ServiceRequest ${row.id}`);
        }

        const request = Object.create(ServiceRequest.prototype);
        request.#id = row.id;
        request.#title = row.title;
        request.#description = row.description;
        request.#category = category;
        request.#owner = owner;
        request.#title = row.title;
        request.#description = row.description;
        request.#category = category;
        request.#owner = owner;
        request.#datePosted = new Date(row.dateposted);
        request.#status = row.status;
        request.#shortlistCount = row.shortlistcount;
        request.#saveCount = row.savecount;
        return request;
      }));
    } finally {
      client.release();
    }
  }

  // ═══════════════════════════════════ View Single By Id ═════════════════════════════════════════════════════
  static async findById(id) {
    const client = await this.#pool.connect();
    try {
      const result = await client.query(
        `SELECT id, title, description, categoryTitle, ownerId, datePosted, status, shortlistCount, saveCount
         FROM ServiceRequest WHERE id = $1`,
        [id]
      );

      if (result.rowCount === 0) return null;
      const row = result.rows[0];

      const category = await ServiceCategory.getServiceCategoryByTitle(row.categorytitle);
      const owner = await UserAccount.findById(row.ownerid);

      if (!category || !owner) {
        throw new Error(`Invalid foreign key reference in ServiceRequest ${row.id}`);
      }

      const request = Object.create(ServiceRequest.prototype);
      request.#id = row.id;
      request.#title = row.title;
      request.#description = row.description;
      request.#category = category;
      request.#owner = owner;
      request.#title = row.title;
      request.#description = row.description;
      request.#category = category;
      request.#owner = owner;
      request.#datePosted = new Date(row.dateposted);
      request.#status = row.status;
      request.#shortlistCount = row.shortlistcount;
      request.#saveCount = row.savecount;
      return request;
    } finally {
      client.release();
    }
  }

  // ═══════════════════════════════════ View Single By Title ══════════════════════════════════════════════════
  static async findByTitle(title) {
    const client = await this.#pool.connect();
    try {
      const result = await client.query(
        `SELECT id, title, description, categoryTitle, ownerId, datePosted, status, shortlistCount, saveCount
         FROM ServiceRequest WHERE title = $1`,
        [title]
      );

      if (result.rowCount === 0) return null;
      const row = result.rows[0];

      const category = await ServiceCategory.getServiceCategoryByTitle(row.categorytitle);
      const owner = await UserAccount.findById(row.ownerid);

      if (!category || !owner) {
        throw new Error(`Invalid foreign key reference in ServiceRequest ${row.id}`);
      }

      const request = Object.create(ServiceRequest.prototype);
      request.#id = row.id;
      request.#title = row.title;
      request.#description = row.description;
      request.#category = category;
      request.#owner = owner;
      request.#title = row.title;
      request.#description = row.description;
      request.#category = category;
      request.#owner = owner;
      request.#datePosted = new Date(row.dateposted);
      request.#status = row.status;
      request.#shortlistCount = row.shortlistcount;
      request.#saveCount = row.savecount;
      return request;
    } finally {
      client.release();
    }
  }

  // ═══════════════════════════════════ View By Owner (PIN) ═══════════════════════════════════════════════════
  static async findByOwnerId(ownerId) {
    const client = await this.#pool.connect();
    try {
      const result = await client.query(
        `SELECT id, title, description, categoryTitle, ownerId, datePosted, status, shortlistCount, saveCount
         FROM ServiceRequest WHERE ownerId = $1`,
        [ownerId]
      );

      return await Promise.all(result.rows.map(async row => {
        const category = await ServiceCategory.getServiceCategoryByTitle(row.categorytitle);
        const owner = await UserAccount.findById(row.ownerid);

        if (!category || !owner) {
          throw new Error(`Invalid foreign key reference in ServiceRequest ${row.id}`);
        }

        const request = Object.create(ServiceRequest.prototype);
        request.#id = row.id;
        request.#title = row.title;
        request.#description = row.description;
        request.#category = category;
        request.#owner = owner;
        request.#datePosted = new Date(row.dateposted);
        request.#status = row.status;
        request.#shortlistCount = row.shortlistcount;
        request.#saveCount = row.savecount;
        return request;
      }));
    } finally {
      client.release();
    }
  }

  static async findCompletedByOwnerId(ownerId) {
    const client = await this.#pool.connect();
    try {
      const result = await client.query(
        `SELECT id, title, description, categoryTitle, ownerId, datePosted, status, shortlistCount, saveCount
         FROM ServiceRequest 
         WHERE ownerId = $1 AND status = 'Complete'
         ORDER BY datePosted DESC`,
        [ownerId]
      );

      return await Promise.all(result.rows.map(async row => {
        const category = await ServiceCategory.getServiceCategoryByTitle(row.categorytitle);
        const owner = await UserAccount.findById(row.ownerid);

        if (!category || !owner) {
          throw new Error(`Invalid foreign key reference in ServiceRequest ${row.id}`);
        }

        const request = Object.create(ServiceRequest.prototype);
        request.#id = row.id;
        request.#title = row.title;
        request.#description = row.description;
        request.#category = category;
        request.#owner = owner;
        request.#datePosted = new Date(row.dateposted);
        request.#status = row.status;
        request.#shortlistCount = row.shortlistcount;
        request.#saveCount = row.savecount;
        return request;
      }));
    } finally {
      client.release();
    }
  }

  /**
   * Search completed requests by owner with optional filters
   * Returns completed requests matching category and/or date range
   */
  static async searchCompletedByOwner(ownerId, categoryTitle = null, startDate = null, endDate = null) {
    const client = await this.#pool.connect();
    try {
      let query = `
        SELECT id, title, description, categoryTitle, ownerId, datePosted, status, shortlistCount, saveCount
        FROM ServiceRequest 
        WHERE ownerId = $1 AND status = 'Complete'
      `;
      
      const params = [ownerId];
      let paramIndex = 2;

      if (categoryTitle) {
        query += ` AND categoryTitle = $${paramIndex}`;
        params.push(categoryTitle);
        paramIndex++;
      }

      if (startDate) {
        query += ` AND datePosted >= $${paramIndex}`;
        params.push(new Date(startDate).toISOString());
        paramIndex++;
      }

      if (endDate) {
        query += ` AND datePosted <= $${paramIndex}`;
        params.push(new Date(endDate).toISOString());
        paramIndex++;
      }

      query += ` ORDER BY datePosted DESC`;

      const result = await client.query(query, params);

      return await Promise.all(result.rows.map(async row => {
        const category = await ServiceCategory.getServiceCategoryByTitle(row.categorytitle);
        const owner = await UserAccount.findById(row.ownerid);

        if (!category || !owner) {
          throw new Error(`Invalid foreign key reference in ServiceRequest ${row.id}`);
        }

        const request = Object.create(ServiceRequest.prototype);
        request.#id = row.id;
        request.#title = row.title;
        request.#description = row.description;
        request.#category = category;
        request.#owner = owner;
        request.#datePosted = new Date(row.dateposted);
        request.#status = row.status;
        request.#shortlistCount = row.shortlistcount;
        request.#saveCount = row.savecount;
        return request;
      }));
    } finally {
      client.release();
    }
  }

  /**
   * Search requests by category (excluding completed)
   * Returns requests with status "Pending" or "Matched"
   */
  static async searchByCategory(categoryTitle) {
    const client = await this.#pool.connect();
    try {
      const result = await client.query(
        `SELECT id, title, description, categoryTitle, ownerId, datePosted, status, shortlistCount, saveCount
         FROM ServiceRequest 
         WHERE categoryTitle = $1 AND status IN ('Pending', 'Matched')
         ORDER BY datePosted DESC`,
        [categoryTitle]
      );

      return await Promise.all(result.rows.map(async row => {
        const category = await ServiceCategory.getServiceCategoryByTitle(row.categorytitle);
        const owner = await UserAccount.findById(row.ownerid);

        if (!category || !owner) {
          throw new Error(`Invalid foreign key reference in ServiceRequest ${row.id}`);
        }

        const request = Object.create(ServiceRequest.prototype);
        request.#id = row.id;
        request.#title = row.title;
        request.#description = row.description;
        request.#category = category;
        request.#owner = owner;
        request.#datePosted = new Date(row.dateposted);
        request.#status = row.status;
        request.#shortlistCount = row.shortlistcount;
        request.#saveCount = row.savecount;
        return request;
      }));
    } finally {
      client.release();
    }
  }

  /**
   * Find all completed service requests (system-wide)
   */
  static async findAllCompleted() {
    const client = await this.#pool.connect();
    try {
      const result = await client.query(
        `SELECT id, title, description, categoryTitle, ownerId, datePosted, status, shortlistCount, saveCount
         FROM ServiceRequest 
         WHERE status = 'Complete'
         ORDER BY datePosted DESC`
      );

      return await Promise.all(result.rows.map(async row => {
        const category = await ServiceCategory.getServiceCategoryByTitle(row.categorytitle);
        const owner = await UserAccount.findById(row.ownerid);

        if (!category || !owner) {
          throw new Error(`Invalid foreign key reference in ServiceRequest ${row.id}`);
        }

        const request = Object.create(ServiceRequest.prototype);
        request.#id = row.id;
        request.#title = row.title;
        request.#description = row.description;
        request.#category = category;
        request.#owner = owner;
        request.#datePosted = new Date(row.dateposted);
        request.#status = row.status;
        request.#shortlistCount = row.shortlistcount;
        request.#saveCount = row.savecount;
        return request;
      }));
    } finally {
      client.release();
    }
  }

  /**
   * Search completed requests with optional filters
   */
  static async searchCompleted(categoryTitle = null, startDate = null, endDate = null) {
    const client = await this.#pool.connect();
    try {
      let query = `
        SELECT id, title, description, categoryTitle, ownerId, datePosted, status, shortlistCount, saveCount
        FROM ServiceRequest 
        WHERE status = 'Complete'
      `;
      
      const params = [];
      let paramIndex = 1;

      if (categoryTitle) {
        query += ` AND categoryTitle = $${paramIndex}`;
        params.push(categoryTitle);
        paramIndex++;
      }

      if (startDate) {
        query += ` AND datePosted >= $${paramIndex}`;
        params.push(new Date(startDate).toISOString());
        paramIndex++;
      }

      if (endDate) {
        query += ` AND datePosted <= $${paramIndex}`;
        params.push(new Date(endDate).toISOString());
        paramIndex++;
      }

      query += ` ORDER BY datePosted DESC`;

      const result = await client.query(query, params);

      return await Promise.all(result.rows.map(async row => {
        const category = await ServiceCategory.getServiceCategoryByTitle(row.categorytitle);
        const owner = await UserAccount.findById(row.ownerid);

        if (!category || !owner) {
          throw new Error(`Invalid foreign key reference in ServiceRequest ${row.id}`);
        }

        const request = Object.create(ServiceRequest.prototype);
        request.#id = row.id;
        request.#title = row.title;
        request.#description = row.description;
        request.#category = category;
        request.#owner = owner;
        request.#title = row.title;
        request.#description = row.description;
        request.#category = category;
        request.#owner = owner;
        request.#datePosted = new Date(row.dateposted);
        request.#status = row.status;
        request.#shortlistCount = row.shortlistcount;
        request.#saveCount = row.savecount;
        return request;
      }));
    } finally {
      client.release();
    }
  }

  /**
   * Get daily statistics for reporting
   */
  static async getDailyStatistics(startDate, endDate) {
    const client = await this.#pool.connect();
    try {
      const createdResult = await client.query(
        `SELECT COUNT(*) as count, categoryTitle
         FROM ServiceRequest 
         WHERE datePosted >= $1 AND datePosted < $2
         GROUP BY categoryTitle`,
        [startDate.toISOString(), endDate.toISOString()]
      );

      const completedResult = await client.query(
        `SELECT COUNT(*) as count, categoryTitle
         FROM ServiceRequest 
         WHERE status = 'Complete' AND datePosted >= $1 AND datePosted < $2
         GROUP BY categoryTitle`,
        [startDate.toISOString(), endDate.toISOString()]
      );

      const categoryUsage = createdResult.rows.map(row => ({
        category: row.categorytitle,
        requestsCreated: parseInt(row.count)
      }));

      const completedByCategory = completedResult.rows.reduce((acc, row) => {
        acc[row.categorytitle] = parseInt(row.count);
        return acc;
      }, {});

      const totalCreated = categoryUsage.reduce((sum, item) => sum + item.requestsCreated, 0);
      const totalCompleted = Object.values(completedByCategory).reduce((sum, count) => sum + count, 0);

      return {
        totalRequestsCreated: totalCreated,
        totalRequestsCompleted: totalCompleted,
        categoryBreakdown: categoryUsage.map(item => ({
          ...item,
          requestsCompleted: completedByCategory[item.category] || 0
        }))
      };
    } finally {
      client.release();
    }
  }

  /**
   * Get weekly statistics for reporting
   */
  static async getWeeklyStatistics(weekStart, weekEnd) {
    const client = await this.#pool.connect();
    try {
      const statusResult = await client.query(
        `SELECT status, COUNT(*) as count
         FROM ServiceRequest 
         WHERE datePosted >= $1 AND datePosted < $2
         GROUP BY status`,
        [weekStart.toISOString(), weekEnd.toISOString()]
      );

      const categoryResult = await client.query(
        `SELECT categoryTitle, COUNT(*) as count, status
         FROM ServiceRequest 
         WHERE datePosted >= $1 AND datePosted < $2
         GROUP BY categoryTitle, status
         ORDER BY categoryTitle`,
        [weekStart.toISOString(), weekEnd.toISOString()]
      );

      const statusCounts = statusResult.rows.reduce((acc, row) => {
        acc[row.status] = parseInt(row.count);
        return acc;
      }, {});

      const categoryMap = {};
      categoryResult.rows.forEach(row => {
        if (!categoryMap[row.categorytitle]) {
          categoryMap[row.categorytitle] = { pending: 0, matched: 0, complete: 0 };
        }
        const status = row.status.toLowerCase();
        categoryMap[row.categorytitle][status] = parseInt(row.count);
      });

      const categoryBreakdown = Object.keys(categoryMap).map(cat => ({
        category: cat,
        pending: categoryMap[cat].pending,
        matched: categoryMap[cat].matched,
        completed: categoryMap[cat].complete,
        total: categoryMap[cat].pending + categoryMap[cat].matched + categoryMap[cat].complete
      }));

      return {
        totalRequests: Object.values(statusCounts).reduce((sum, count) => sum + count, 0),
        pendingRequests: statusCounts['Pending'] || 0,
        matchedRequests: statusCounts['Matched'] || 0,
        completedRequests: statusCounts['Complete'] || 0,
        categoryBreakdown: categoryBreakdown
      };
    } finally {
      client.release();
    }
  }

  /**
   * Get monthly statistics for reporting
   */
  static async getMonthlyStatistics(monthStart, monthEnd) {
    const client = await this.#pool.connect();
    try {
      const categoryResult = await client.query(
        `SELECT 
          categoryTitle,
          COUNT(*) as totalRequests,
          SUM(CASE WHEN status = 'Complete' THEN 1 ELSE 0 END) as completedRequests,
          AVG(shortlistCount) as avgShortlistCount,
          AVG(saveCount) as avgSaveCount
         FROM ServiceRequest 
         WHERE datePosted >= $1 AND datePosted < $2
         GROUP BY categoryTitle
         ORDER BY totalRequests DESC`,
        [monthStart.toISOString(), monthEnd.toISOString()]
      );

      const weeklyResult = await client.query(
        `SELECT 
          DATE_TRUNC('week', datePosted) as week,
          COUNT(*) as count,
          SUM(CASE WHEN status = 'Complete' THEN 1 ELSE 0 END) as completed
         FROM ServiceRequest 
         WHERE datePosted >= $1 AND datePosted < $2
         GROUP BY week
         ORDER BY week`,
        [monthStart.toISOString(), monthEnd.toISOString()]
      );

      const categoryBreakdown = categoryResult.rows.map(row => ({
        category: row.categorytitle,
        totalRequests: parseInt(row.totalrequests),
        completedRequests: parseInt(row.completedrequests),
        completionRate: row.totalrequests > 0 
          ? ((row.completedrequests / row.totalrequests) * 100).toFixed(2) + '%'
          : '0%',
        avgShortlistCount: parseFloat(row.avgshortlistcount || 0).toFixed(2),
        avgSaveCount: parseFloat(row.avgsavecount || 0).toFixed(2)
      }));

      const weeklyTrend = weeklyResult.rows.map(row => ({
        week: new Date(row.week).toISOString().split('T')[0],
        totalRequests: parseInt(row.count),
        completedRequests: parseInt(row.completed)
      }));

      const totalRequests = categoryBreakdown.reduce((sum, item) => sum + item.totalRequests, 0);
      const totalCompleted = categoryBreakdown.reduce((sum, item) => sum + item.completedRequests, 0);

      return {
        totalRequests: totalRequests,
        totalCompleted: totalCompleted,
        overallCompletionRate: totalRequests > 0 
          ? ((totalCompleted / totalRequests) * 100).toFixed(2) + '%'
          : '0%',
        categoryBreakdown: categoryBreakdown,
        weeklyTrend: weeklyTrend
      };
    } finally {
      client.release();
    }
  }
}