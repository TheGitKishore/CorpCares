// controller/server.js
import express from "express";
import cors from "cors";

import { UserAccountCreationController } from "../controller/UserAccountCreationController.js";
import { AuthenticationController } from "../controller/AuthenticationController.js";
import { UserAccountDeleteController } from "../controller/UserAccountDeleteController.js";
import { UserAccountUpdateController } from "../controller/UserAccountUpdateController.js";
import { UserAccountViewSingleController } from "../controller/UserAccountViewSingleController.js";
import { UserAccountViewAllController } from "../controller/UserAccountViewAllController.js";

import { UserProfileCreationController } from "../controller/UserProfileCreationController.js";
import { UserProfileViewAllController } from "../controller/UserProfileViewAllController.js";
import { UserProfileViewSingleController } from "../controller/UserProfileViewSingleController.js";
import { UserProfileUpdateController } from "../controller/UserProfileUpdateController.js";
import { UserProfileDeleteController } from "../controller/UserProfileDeleteController.js";

import { ServiceRequestCreationController } from "../controller/ServiceRequestCreationController.js";
import { ServiceRequestDeleteController } from "../controller/ServiceRequestDeleteController.js";
import { ServiceRequestUpdateController } from "../controller/ServiceRequestUpdateController.js";
import { ServiceRequestViewAllController } from "../controller/ServiceRequestViewAllController.js";
import { ServiceRequestViewSingleController } from '../controller/ServiceRequestViewSingleController.js';
import { PINMatchHistoryViewController } from '../controller/PINMatchHistoryViewController.js';
import { PINMatchHistorySearchController } from '../controller/PINMatchHistorySearchController.js';
import { PINViewShortlistCountController } from '../controller/PINViewShortlistCountController.js';

import { ServiceCategoryCreationController } from '../controller/ServiceCategoryCreationController.js';
import { ServiceCategoryViewAllController } from '../controller/ServiceCategoryViewAllController.js'
import { ServiceCategoryUpdateController } from '../controller/ServiceCategoryUpdateController.js';
import { ServiceCategoryViewSingleController } from '../controller/ServiceCategoryViewSingleController.js';
import { ServiceCategoryDeleteController } from '../controller/ServiceCategoryDeleteController.js';

import { CSRRequestController } from '../controller/CSRRequestController.js';
import { CSRSearchRequestsByCategoryController } from '../controller/CSRSearchRequestsByCategoryController.js';
import { CSRShortlistAddController } from '../controller/CSRShortlistAddController.js';
import { CSRShortlistViewController } from '../controller/CSRShortlistViewController.js';  // Adjust import as needed
import { CSRSearchCompletedRequestsController } from "../controller/CSRSearchCompletedRequestsController.js";
import { CSRCompletedRequestsViewController } from "../controller/CSRCompletedRequestsViewController.js";
import { CSRShortlistSearchController } from './CSRShortlistSearchController.js';

import { PlatformDailyReportController } from './PlatformDailyReportController.js';
import { PlatformMonthlyReportController } from './PlatformMonthlyReportController.js';
import { PlatformWeeklyReportController } from './PlatfromWeeklyReportController.js';

const app = express();

// Allow your front-end (Go Live) to reach this API
app.use(
  cors({
    origin: ["http://127.0.0.1:5500", "http://localhost:5500"],
    credentials: false,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET","POST","DELETE","PUT","PATCH","OPTIONS"]
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Health check endpoint ---
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// --- LOGIN ENDPOINT ---
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body || {};
  const controller = new AuthenticationController();
  const result = await controller.login(username, password);

  if (!result.success) {
    return res.status(401).json({ ok: false, error: result.message });
  }

  const { sessionToken, userAccount } = result;
  return res.json({
    ok: true,
    sessionToken,
    user: {
      id: userAccount.id,
      username: userAccount.username,
      fullName: userAccount.name ?? userAccount.fullName ?? userAccount.username,
      email: userAccount.email,
      profile: userAccount.profile?.roleName ?? null
    }
  });
});

//creating account
app.post("/api/accounts", async (req, res) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  const { username, rawPassword, profile, email, fullName } = req.body || {};

  console.log("[ROUTE] Incoming body:", req.body);
  console.log("[ROUTE] Token:", token);

  const controller = new UserAccountCreationController();
  const result = await controller.createUserAccount(token, username, rawPassword, profile, email, fullName);

  res.status(result.success ? 201 : 400).json({ ok: result.success, ...result });
});

//deleting accounts
app.delete("/api/accounts/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ ok: false, error: "Invalid user id" });
    }

    const token = req.headers.authorization?.replace(/^Bearer\s+/i, "").trim();

    const controller = await UserAccountDeleteController.findById(id);
    const result = await controller.deleteUserAccount(token);

    return res.status(result.success ? 200 : 403).json({ ok: result.success, message: result.message });
  } catch (e) {
    console.error("[DELETE /api/accounts/:id] ERROR:", e);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});


// GET one account before updating (prefill update form)
app.get("/api/accounts/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ ok: false, error: "Invalid id" });
    }

    const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    const controller = new UserAccountViewSingleController();
    const result = await controller.viewSingleUserAccount(token, id);

    if (!result.success) {
      return res.status(403).json({ ok: false, error: result.message });
    }

    const u = result.account;
    return res.json({
      ok: true,
      user: {
        id: u.id,
        username: u.username,
        fullName: u.name,
        email: u.email,
        profile: u.profile?.roleName ?? null,
        isActive: u.isActive
      }
    });
  } catch (e) {
    console.error("[GET /api/accounts/:id] ERROR:", e);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});


// PUT update user accounts
app.put("/api/accounts/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ ok: false, error: "Invalid user id" });
    }

    const token = req.headers.authorization?.replace(/^Bearer\s+/i, "").trim();
    const { username, fullName, email, password, profile, isActive } = req.body || {};

    const controller = await UserAccountUpdateController.findById(id);
    const result = await controller.updateUserAccount(
      token,
      String(username).trim(),
      String(fullName).trim(),
      String(email).trim(),
      password,
      String(profile).trim(),
      Boolean(isActive)
    );

    return res.status(result.success ? 200 : 403).json({ ok: result.success, message: result.message });
  } catch (e) {
    console.error("[PUT /api/accounts/:id] ERROR:", e);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

//view all accounts
app.get("/api/accounts", async (req, res) => {
  try {
    const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    const controller = new UserAccountViewAllController();
    const result = await controller.viewUserAccounts(token);

    if (!result.success) {
      return res.status(403).json({ ok: false, error: result.message });
    }

    const plainAccounts = result.accounts.map(acc => ({
      id: acc.id,
      username: acc.username,
      name: acc.name,
      email: acc.email,
      isActive: acc.isActive,
      profile: acc.profile?.roleName ?? null,
      dateCreated: acc.dateCreated?.toISOString() ?? null
    }));

    return res.json({ ok: true, accounts: plainAccounts });
  } catch (e) {
    console.error("[GET /api/accounts] ERROR:", e);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

//creating user profiles
app.post("/api/profiles", async (req, res) => {
  try {
    const { roleName, description, permissions = [] } = req.body || {};
    const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");

    if (!roleName || !description) {
      return res.status(400).json({ ok: false, error: "Missing roleName or description" });
    }

    const controller = new UserProfileCreationController();
    const result = await controller.createUserProfile(token, roleName, description, permissions);

    return res.status(result.success ? 201 : 403).json({ ok: result.success, roleName: result.roleName, message: result.message });
  } catch (e) {
    console.error("[POST /api/profiles] ERROR:", e);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

//view all profiles
app.get("/api/profiles", async (req, res) => {
  try {
    const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    const controller = new UserProfileViewAllController();
    const result = await controller.viewAllProfiles(token);

    return res.status(result.success ? 200 : 403).json({
      ok: result.success,
      profiles: result.profiles,
      message: result.message
    });
  } catch (e) {
    console.error("[GET /api/profiles] ERROR:", e);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

//view single profile
app.get("/api/profiles/:roleName", async (req, res) => {
  try {
    const roleName = req.params.roleName;
    const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");

    const controller = new UserProfileViewSingleController();
    const result = await controller.viewUserProfile(token, roleName);

    return res.status(result.success ? 200 : 403).json({
      ok: result.success,
      profile: result.profile,
      message: result.message
    });
  } catch (e) {
    console.error("[GET /api/profiles/:roleName] ERROR:", e);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

//update user profiles
app.put("/api/profiles/:roleName", async (req, res) => {
  try {
    const roleName = req.params.roleName;
    const { newRoleName, newDescription, newPermissions = [] } = req.body || {};
    const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");

    const controller = await UserProfileUpdateController.findByRoleName(roleName);
    const result = await controller.updateUserProfile(token, newRoleName, newDescription, newPermissions);

    return res.status(result.success ? 200 : 403).json({
      ok: result.success,
      updated: result.updated,
      message: result.message
    });
  } catch (e) {
    console.error("[PUT /api/profiles/:roleName] ERROR:", e);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

//delete user profiles
app.delete("/api/profiles/:roleName", async (req, res) => {
  try {
    const roleName = req.params.roleName;
    const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");

    const controller = await UserProfileDeleteController.findByRoleName(roleName);
    const result = await controller.deleteUserProfile(token);

    return res.status(result.success ? 200 : 403).json({
      ok: result.success,
      deleted: result.success,
      message: result.message
    });
  } catch (e) {
    console.error("[DELETE /api/profiles/:roleName] ERROR:", e);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

//-------------------------------------------------------------------------------------------

app.post("/api/requests", async (req, res) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  const { title, description, categoryId } = req.body || {};

  const controller = new ServiceRequestCreationController();
  const result = await controller.createServiceRequest(token, title, description, categoryId);
  res.status(result.success ? 201 : 400).json({ ok: result.success, ...result });
});

app.delete("/api/requests/:id", async (req, res) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  const requestId = Number(req.params.id);

  if (!Number.isFinite(requestId)) {
    return res.status(400).json({ ok: false, message: "Invalid request ID" });
  }

  const controller = await ServiceRequestDeleteController.findById(requestId);
  const result = await controller.deleteServiceRequest(token);
  res.status(result.success ? 200 : 403).json({ ok: result.success, ...result });
});

app.put("/api/requests/:id", async (req, res) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  const requestId = Number(req.params.id);
  const { title, description, categoryTitle } = req.body || {};

  const controller = await ServiceRequestUpdateController.findById(requestId);
  const result = await controller.updateServiceRequest(token, title, description, categoryTitle);
  res.status(result.success ? 200 : 400).json({ ok: result.success, ...result });
});

app.get("/api/requests", async (req, res) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");

  const controller = new ServiceRequestViewAllController();
  const result = await controller.viewAllServiceRequests(token);
  res.status(result.success ? 200 : 403).json({ ok: result.success, ...result });
});

app.get('/api/requests/own', async (req, res) => {
  const controller = new ServiceRequestViewSingleController();
  const sessionToken = req.headers.authorization?.split(' ')[1];
  const result = await controller.viewOwnRequests(sessionToken);
  res.json({ ok: result.success, requests: result.requests, message: result.message });
});


app.get('/api/requests/matches/completed', async (req, res) => {
  try {
    const token = req.headers['authorization']?.replace(/^Bearer\s+/i, '') || '';
    const controller = new PINMatchHistoryViewController();
    const result = await controller.viewMatchHistory(token);

    if (!result.success) {
      return res.status(403).json({ success: false, requests: [], message: result.message });
    }

    const plainRequests = Array.isArray(result.matches)
      ? result.matches.map(r => ({
          id: r.id,
          title: r.title,
          description: r.description,
          status: r.status
        }))
      : [];

    res.json({
      success: true,
      requests: plainRequests,
      message: result.message
    });
  } catch (err) {
    console.error('[GET /api/requests/matches/completed] ERROR:', err);
    res.status(500).json({ success: false, requests: [], message: err.message });
  }
});

app.get('/api/requests/matches/search', async (req, res) => {
  try {
    const token = req.headers['authorization']?.replace(/^Bearer\s+/i, '') || '';
    const { category, startDate, endDate } = req.query;

    const controller = new PINMatchHistorySearchController();
    const result = await controller.searchMatchHistory(token, {
      categoryTitle: category,
      startDate,
      endDate
    });

    const plainRequests = Array.isArray(result.matches)
      ? result.matches.map(r => ({
          id: r.id,
          title: r.title,
          description: r.description,
          status: r.status
        }))
      : [];

    res.json({
      success: result.success,
      requests: plainRequests,
      message: result.message,
      filters: result.filters
    });
  } catch (err) {
    console.error('[GET /api/requests/matches/search] ERROR:', err);
    res.status(500).json({ success: false, requests: [], message: err.message });
  }
});


// --------------------------------------------------------------

const categoryController = new ServiceCategoryCreationController();
app.post('/api/categories', async (req, res) => {
  try {
    const sessionToken = req.headers['authorization']?.split(' ')[1];
    const { title, description } = req.body;

    const result = await categoryController.createServiceCategory(sessionToken, title, description);

    if (result.success) {
      res.status(200).json({ categoryId: result.categoryId, name: title });
    } else {
      res.status(403).json({ error: result.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



app.get('/api/categories', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'] || '';
    const sessionToken = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    const viewAllController = new ServiceCategoryViewAllController();
    const result = await viewAllController.viewAllServiceCategories(sessionToken);

    if (result.success) {
      res.json(result.categories.map(c => ({
        id: c.id,
        title: c.title,
        description: c.description
      })));
    } else {
      res.status(403).json({ error: result.message });
    }
  } catch (err) {
    res.status(500).json({ error: `Server error: ${err.message}` });
  }
});


// PUT /api/categories/:id
app.put('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, name, description } = req.body;

    const finalTitle = title || name;

    // Get session token from cookie or header
    const authHeader = req.headers['authorization'];
    const sessionToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    // Find existing category
    const categoryController = await ServiceCategoryUpdateController.findServiceCategoryById(id);

    // Attempt to update
    const result = await categoryController.updateServiceCategory(
      sessionToken,
      finalTitle,
      description
    );

    if (!result.success) {
      return res.status(403).json({ error: result.message });
    }

    return res.json({ message: result.message });
  } catch (error) {
    console.error('Error updating category:', error);
    return res.status(500).json({ error: error.message });
  }
});


// GET /api/categories/search?query=...
app.get('/api/categories/search', async (req, res) => {
  const query = req.query.query;
  const authHeader = req.headers['authorization'];
  const sessionToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  if (!query) return res.status(400).json({ error: "Query is required" });

  try {
    const controller = new ServiceCategoryViewSingleController();
    const result = await controller.viewServiceCategoryByTitle(sessionToken, query);

    if (!result.success) {
      return res.status(404).json({ error: result.message });
    }

    // return as an array to be consistent with your table rendering
    res.json([{
      id: result.category.id,
      title: result.category.title,
      description: result.category.description
    }]);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/categories/:id
app.delete('/api/categories/:id', async (req, res) => {
  const categoryId = req.params.id;
  const authHeader = req.headers['authorization'];
  const sessionToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  if (!categoryId) return res.status(400).json({ error: "Category ID is required" });

  try {
    // Get controller for this category
    const controller = await ServiceCategoryDeleteController.findServiceCategoryById(categoryId);

    // Attempt deletion
    const result = await controller.deleteServiceCategory(sessionToken);

    if (!result.success) {
      return res.status(403).json({ error: result.message }); // Forbidden if auth fails
    }

    res.json({ message: result.message });

  } catch (err) {
    console.error("Delete error:", err);
    res.status(404).json({ error: err.message });
  }
});

// CSR view all requests endpoint
app.get('/api/csr', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');

    const result = await CSRRequestController.viewAllServiceRequests(token);

    // normalize frontend response
    res.json({
      ok: result.success,
      requests: result.requests,
      message: result.message
    });
  } catch (err) {
    res.status(500).json({ ok: false, message: `Server error: ${err.message}` });
  }
});


// GET /api/csr/search?category=education
app.get('/api/csr/search', async (req, res) => {
  try {
    const category = req.query.category;
    const token = req.headers['authorization']?.replace('Bearer ', '') || '';

    const CSRSearchReqcontroller = new CSRSearchRequestsByCategoryController();
    const result = await CSRSearchReqcontroller.searchByCategory(token, category);

    // Convert hydrated instances to plain objects
    const plainRequests = Array.isArray(result.requests)
      ? result.requests.map(r => ({
          id: r.id,
          title: r.title,
          description: r.description,
          categoryTitle: r.category?.title ?? r.categoryTitle ?? 'Unknown',
          status: r.status
        }))
      : [];

    res.json({
      ...result,
      requests: plainRequests
    });
  } catch (err) {
    res.status(500).json({ success: false, requests: null, message: err.message });
  }
});

app.post('/api/csr/shortlist', async (req, res) => {
  const { requestId } = req.body;
  const sessionToken = req.headers.authorization?.split(' ')[1];  // Extract token from Authorization header

  if (!sessionToken) {
    return res.status(400).json({ message: 'Session token is required' });
  }

  if (!requestId) {
    return res.status(400).json({ message: 'Service request ID is required' });
  }

  try {
    // Instantiate the controller
    const controller = new CSRShortlistAddController();
    
    // Call the controller's method to add the request to the shortlist
    const result = await controller.addToShortlist(sessionToken, requestId);
    
    if (result.success) {
      return res.status(200).json({ message: result.message, itemId: result.itemId });
    } else {
      return res.status(400).json({ message: result.message });
    }
  } catch (err) {
    console.error('Error in adding to shortlist:', err);
    return res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});



// GET /api/csr/search?category=education
app.get('/api/csr/shortlistSearch', async (req, res) => {
  try {
    const category = req.query.category;  // Get the category from the query string
    const token = req.headers['authorization']?.replace('Bearer ', '') || '';  // Get token from headers

    const viewShortlistcontroller = new CSRShortlistViewController();
    // Call the controller to perform the search
    const result = await viewShortlistcontroller.viewShortlist(token);

    // Send the result as JSON response
    res.json(result);
  } catch (err) {
    console.error('Error during the shortlist search:', err); // Log full error
    res.status(500).json({ success: false, requests: null, message: err.message });
  }
});

//csrsearchcompletedrequestscontroller
app.get("/api/requests/completed", async (req, res) => {
  try {
    const token = req.headers['authorization']?.replace(/^Bearer\s+/i, '') || '';
    const { category, startDate, endDate } = req.query;

    const controller = new CSRSearchCompletedRequestsController();
    const result = await controller.searchCompleted(token, {
      categoryTitle: category,
      startDate,
      endDate
    });

    const plainRequests = Array.isArray(result.requests)
      ? result.requests.map(r => ({
          id: r.id,
          title: r.title,
          categoryTitle: r.category?.title ?? 'Unknown',
          datePosted: r.datePosted?.toISOString() ?? ''
        }))
      : [];

    res.json({
      success: result.success,
      requests: plainRequests,
      message: result.message,
      filters: result.filters
    });
  } catch (err) {
    console.error("[GET /api/requests/completed] ERROR:", err);
    res.status(500).json({ success: false, requests: null, message: err.message });
  }
});

//csrsearchviewcompletedrequestscontroller
app.get("/api/requests/completed/view", async (req, res) => {
  try {
    const token = req.headers['authorization']?.replace(/^Bearer\s+/i, '') || '';
    const { category, endDate } = req.query;

    const controller = new CSRCompletedRequestsViewController();
    const result = await controller.viewCompleted(token);

    const filtered = Array.isArray(result.requests)
      ? result.requests.filter(r => {
          const cat = r.category?.title?.toLowerCase() || '';
          const inputCat = category?.toLowerCase() || '';

          const matchCategory = !inputCat || cat.includes(inputCat);

          const postedDate = new Date(r.datePosted);
          const inputDate = new Date(endDate);
          const matchDate = !endDate || (
            !isNaN(inputDate.getTime()) &&
            postedDate <= inputDate
          );

          return matchCategory && matchDate;
        })
      : [];

    const plainRequests = filtered.map(r => ({
      id: r.id,
      title: r.title,
      serviceType: r.category?.title ?? 'Unknown',
      completionDate: r.datePosted?.toISOString() ?? ''
    }));

    res.json({
      success: true,
      requests: plainRequests,
      message: `Filtered ${plainRequests.length} completed requests`
    });
  } catch (err) {
    console.error("[GET /api/requests/completed/view] ERROR:", err);
    res.status(500).json({ success: false, requests: null, message: err.message });
  }
});

app.get('/api/csr/shortlist/search', async (req, res) => {
  try {
    const keyword = req.query.keyword || '';
    const authHeader = req.headers['authorization'] || '';
    const sessionToken = authHeader.replace(/^Bearer\s+/i, '');

    const controller = new CSRShortlistSearchController();
    const result = await controller.searchShortlist(sessionToken, keyword);

    if (!result.success) {
      return res.status(403).json({ success: false, requests: [], message: result.message });
    }

    return res.json({
      success: true,
      requests: result.requests,
      message: result.message
    });
  } catch (err) {
    console.error('[GET /api/csr/shortlist/search] ERROR:', err);
    return res.status(500).json({ success: false, requests: [], message: err.message });
  }
});

app.get('/api/requests/shortlist-counts', async (req, res) => {
  try {
    const token = req.headers['authorization']?.replace(/^Bearer\s+/i, '') || '';
    const controller = new PINViewShortlistCountController();
    const result = await controller.viewShortlistCounts(token);

    if (!result.success) {
      return res.status(403).json({ success: false, counts: [], message: result.message });
    }

    res.json({
      success: true,
      counts: result.counts,
      message: result.message
    });
  } catch (err) {
    console.error('[GET /api/requests/shortlist-counts] ERROR:', err);
    res.status(500).json({ success: false, counts: [], message: err.message });
  }
});

app.get('/api/reports/daily', async (req, res) => {
  try {
    const token = req.headers['authorization']?.replace(/^Bearer\s+/i, '') || '';
    const reportDate = req.query.date || null;

    const controller = new PlatformDailyReportController();
    const result = await controller.generateDailyReport(token, reportDate);

    if (!result.success) {
      return res.status(403).json({ success: false, report: null, message: result.message });
    }

    res.json(result);
  } catch (err) {
    console.error('[GET /api/reports/daily] ERROR:', err);
    res.status(500).json({ success: false, report: null, message: err.message });
  }
});

app.get('/api/reports/weekly', async (req, res) => {
  try {
    const token = req.headers['authorization']?.replace(/^Bearer\s+/i, '') || '';
    const reportDate = req.query.date || null;

    const controller = new PlatformWeeklyReportController();
    const result = await controller.generateWeeklyReport(token, reportDate);

    if (!result.success) {
      return res.status(403).json({ success: false, report: null, message: result.message });
    }

    res.json(result);
  } catch (err) {
    console.error('[GET /api/reports/weekly] ERROR:', err);
    res.status(500).json({ success: false, report: null, message: err.message });
  }
});


app.get('/api/reports/monthly', async (req, res) => {
  try {
    const token = req.headers['authorization']?.replace(/^Bearer\s+/i, '') || '';
    const year = req.query.year || null;
    const month = req.query.month || null;

    const controller = new PlatformMonthlyReportController();
    const result = await controller.generateMonthlyReport(token, year, month);

    if (!result.success) {
      return res.status(403).json({ success: false, report: null, message: result.message });
    }

    res.json(result);
  } catch (err) {
    console.error('[GET /api/reports/monthly] ERROR:', err);
    res.status(500).json({ success: false, report: null, message: err.message });
  }
});

// --- Start server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`));
