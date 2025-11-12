// controller/server.js
import express from "express";
import cors from "cors";
import { UserAccount } from "../entities/UserAccount.js";
import { Password } from "../entities/Password.js";
import { UserProfile } from "../entities/UserProfile.js";
import { AuthorizationHelper } from "../helpers/AuthorizationHelper.js";
import { Permissions } from "../constants/Permissions.js";
import { Session } from "../entities/Session.js";
import { ServiceRequestCreationController } from "../controller/ServiceRequestCreationController.js";
import { ServiceRequestDeleteController } from "../controller/ServiceRequestDeleteController.js";
import { ServiceRequestUpdateController } from "../controller/ServiceRequestUpdateController.js";
import { ServiceRequestViewAllController } from "../controller/ServiceRequestViewAllController.js";
import { ServiceRequestViewSingleController } from '../controller/ServiceRequestViewSingleController.js';


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
  try {
    const { username, password } = req.body || {};
    console.log("[LOGIN] Incoming request:", req.body);

    if (!username || !password) {
      return res
        .status(400)
        .json({ ok: false, error: "Missing username or password" });
    }

    // 1 Fetch the user record
    const user = await UserAccount.findByUsername(username);
    console.log(
      user
        ? `[LOGIN] Found user: ${user.username}`
        : "[LOGIN] No user found for that username"
    );

    if (!user) {
      return res.status(401).json({ ok: false, error: "Invalid credentials" });
    }

    const stored = Password.fromHash(user.passwordHash.hash);
    const ok = stored.verify(password);

    if (!ok) {
      return res.status(401).json({ ok: false, error: "Invalid credentials" });
    }

    // 2 Create session and return token when user logs in
    const session = new Session(user);
    const token = await session.createSession();

    // 3 Successful login
    console.log(`[LOGIN] User ${username} authenticated successfully`);
    return res.json({
      ok: true,
      sessionToken: token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.name ?? user.fullName ?? user.username,
        email: user.email,
        profile: user.profile?.roleName ?? null
      }
    });

  } catch (err) {
    console.error("[LOGIN] ERROR:", err);
    return res
      .status(500)
      .json({ ok: false, error: "Server error", detail: String(err.message) });
  }
});

app.post("/api/accounts", async (req, res) => {
  try {
    const { username, fullName, email, rawPassword, profile } = req.body || {};

    // 1) Validate
    if (!username || !fullName || !email || !rawPassword || !profile) {
      return res.status(400).json({ ok:false, error:"All fields are required." });
    }
    if (rawPassword.length < 8) {
      return res.status(400).json({ ok:false, error:"Password must be at least 8 characters." });
    }

    // 2) Uniqueness (username); email uniqueness enforced by DB too
    const exists = await UserAccount.existsByUsername(username);
    if (exists) return res.status(409).json({ ok:false, error:"Username already taken." });

    // 3) Build entity (bcrypt happens here via Password())
    const pw = new Password(rawPassword);
    const role = new UserProfile(profile, ""); // roleName (FK), description not needed here
    const account = new UserAccount(username, fullName, pw, email, role);
    account.dateCreated = new Date();
    account.isActive = true;

    // 4) Persist
    const newId = await account.createUserAccount();

    return res.status(201).json({
      ok: true,
      id: newId,
      username,
      fullName,
      email,
      profile
    });
  } catch (e) {
    const msg = String(e?.message || e);
    if (msg.includes("duplicate key") && msg.includes("useraccount_email_key")) {
      return res.status(409).json({ ok:false, error:"Email already in use." });
    }
    if (msg.includes("foreign key") && msg.toLowerCase().includes("userprofile")) {
      return res.status(400).json({ ok:false, error:"Invalid profile/role name." });
    }
    console.error("[CREATE ACCOUNT] ERROR:", e);
    return res.status(500).json({ ok:false, error:"Server error" });
  }
});

app.delete("/api/accounts/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ ok: false, error: "Invalid user id" });
    }

    // Expect "Authorization: Bearer <token>"
    const authHeader = req.headers["authorization"] || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    const check = await AuthorizationHelper.checkPermission(token, Permissions.DELETE_USER);
    if (!check.authorized) {
      return res.status(403).json({ ok: false, error: check.message || "Forbidden" });
    }

    const user = await UserAccount.findById(id);
    if (!user) {
      return res.status(404).json({ ok: false, error: "User not found" });
    }

    const deleted = await user.deleteUserAccount();
    return res.status(200).json({ ok: true, deleted });
  } catch (e) {
    console.error("[DELETE /api/accounts/:id] ERROR:", e);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

// GET one account (prefill update form)
app.get("/api/accounts/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ ok:false, error:"Invalid id" });
    }

    // Require ownership OR permission
    const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    const auth = await AuthorizationHelper.verifyOwnershipOrPermission(
      token,
      id,
      Permissions.VIEW_USER
    );
    if (!auth.authorized) {
      // If you prefer explicit: return 403. If you prefer privacy: return 404.
      return res.status(403).json({ ok:false, error:auth.message });
    }

    const u = await UserAccount.findById(id);
    if (!u) return res.status(404).json({ ok:false, error:"User not found" });

    return res.json({
      ok: true,
      user: {
        id: u.id,
        username: u.username,
        fullName: u.name,                        // works due to alias above
        email: u.email,
        profile: u.profile ? u.profile.roleName : null,
        isActive: u.isActive
      }
    });
  } catch (e) {
    console.error("[GET /api/accounts/:id] ERROR:", e);
    res.status(500).json({ ok:false, error:"Server error" });
  }
});

// PUT update
app.put("/api/accounts/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { username, fullName, email, password, profile, isActive } = req.body || {};
    const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");

    const auth = await AuthorizationHelper.checkPermission(token, Permissions.UPDATE_USER);
    if (!auth.authorized) return res.status(403).json({ ok:false, error: auth.message });

    const ua = await UserAccount.findById(id);
    if (!ua) return res.status(404).json({ ok:false, error:"User not found" });

    // normalize profile to UserProfile instance
    const { UserProfile } = await import("../entities/UserProfile.js");
    const role = new UserProfile(String(profile).trim());

    // empty string => keep existing password (entity already handles this rule)
    const rawPwd = (password == null) ? "" : String(password);

    const result = await ua.updateUserAccount(
      String(username).trim(),
      String(fullName).trim(),
      String(email).trim(),
      rawPwd,
      role,
      Boolean(isActive)
    );

    return res.json({ ok:true, ...result });
  } catch (e) {
    const msg = String(e?.message || e);
    if (msg.includes("duplicate key") && msg.includes("useraccount_email_key")) {
      return res.status(409).json({ ok:false, error:"Email already in use." });
    }
    console.error("[PUT /api/accounts/:id] ERROR:", e);
    return res.status(500).json({ ok:false, error:"Server error" });
  }
});

app.get("/api/accounts", async (req, res) => {
  try {
    const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");

    // Check permission
    const auth = await AuthorizationHelper.checkPermission(token, Permissions.VIEW_ALL_USERS);
    if (!auth.authorized) {
      return res.status(403).json({ ok: false, error: auth.message });
    }

    // Fetch all accounts
    const accounts = await UserAccount.viewUserAccounts();

    // Convert to plain JSON
    const plainAccounts = accounts.map(acc => ({
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

app.post("/api/profiles", async (req, res) => {
  try {
    const { roleName, description, permissions = [] } = req.body || {};
    const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");

    if (!roleName || !description) {
      return res.status(400).json({ ok: false, error: "Missing roleName or description" });
    }

    const auth = await AuthorizationHelper.checkPermission(token, Permissions.CREATE_PROFILE);
    if (!auth.authorized) {
      return res.status(403).json({ ok: false, error: auth.message });
    }

    const profile = new UserProfile(roleName, description);
    profile.permissions = permissions;

    await profile.createUserProfile();
    return res.status(201).json({ ok: true, roleName });
  } catch (e) {
    console.error("[POST /api/profiles] ERROR:", e);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

app.get("/api/profiles", async (req, res) => {
  try {
    const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    const auth = await AuthorizationHelper.checkPermission(token, Permissions.VIEW_ALL_PROFILES);
    if (!auth.authorized) {
      return res.status(403).json({ ok: false, error: auth.message });
    }

    const profiles = await UserProfile.viewAllUserProfiles();
    const plainProfiles = profiles.map(p => ({
      roleName: p.roleName,
      description: p.description,
      permissions: p.permissions
    }));

    return res.json({ ok: true, profiles: plainProfiles });
  } catch (e) {
    console.error("[GET /api/profiles] ERROR:", e);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

app.get("/api/profiles/:roleName", async (req, res) => {
  try {
    const roleName = req.params.roleName;
    const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");

    const auth = await AuthorizationHelper.checkPermission(token, Permissions.VIEW_PROFILE);
    if (!auth.authorized) {
      return res.status(403).json({ ok: false, error: auth.message });
    }

    const profile = await UserProfile.findByRoleName(roleName);
    if (!profile) return res.status(404).json({ ok: false, error: "Profile not found" });

    return res.json({
      ok: true,
      profile: {
        roleName: profile.roleName,
        description: profile.description,
        permissions: profile.permissions
      }
    });
  } catch (e) {
    console.error("[GET /api/profiles/:roleName] ERROR:", e);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

app.put("/api/profiles/:roleName", async (req, res) => {
  try {
    const roleName = req.params.roleName;
    const { newRoleName, newDescription, newPermissions = [] } = req.body || {};
    const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");

    const auth = await AuthorizationHelper.checkPermission(token, Permissions.UPDATE_PROFILE);
    if (!auth.authorized) {
      return res.status(403).json({ ok: false, error: auth.message });
    }

    const profile = await UserProfile.findByRoleName(roleName);
    if (!profile) return res.status(404).json({ ok: false, error: "Profile not found" });

    const success = await profile.updateUserProfile(newRoleName, newDescription, newPermissions);
    return res.json({ ok: success, updated: success });
  } catch (e) {
    console.error("[PUT /api/profiles/:roleName] ERROR:", e);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

app.delete("/api/profiles/:roleName", async (req, res) => {
  try {
    const roleName = req.params.roleName;
    const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");

    const auth = await AuthorizationHelper.checkPermission(token, Permissions.DELETE_PROFILE);
    if (!auth.authorized) {
      return res.status(403).json({ ok: false, error: auth.message });
    }

    const profile = await UserProfile.findByRoleName(roleName);
    if (!profile) return res.status(404).json({ ok: false, error: "Profile not found" });

    const success = await profile.deleteUserProfile();
    return res.json({ ok: success, deleted: success });
  } catch (e) {
    console.error("[DELETE /api/profiles/:roleName] ERROR:", e);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

app.post("/api/requests", async (req, res) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  const { title, description, categoryTitle } = req.body || {};

  const controller = new ServiceRequestCreationController();
  const result = await controller.createServiceRequest(token, title, description, categoryTitle);
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


// --- Start server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`));
