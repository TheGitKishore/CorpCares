import { UserAccount } from '../entities/UserAccount.js';
import { Password } from '../entities/Password.js';
import { UserProfile } from '../entities/UserProfile.js';
import { AuthorizationHelper } from '../helpers/AuthorizationHelper.js';
import { Permissions } from '../constants/Permissions.js';

export class UserAccountCreationController {
  #userAccount;

  constructor() {
    this.#userAccount = null;
  }

  /**
   * Creates a new UserAccount.
   * Hydrates UserProfile dynamically by roleName.
   */
  async createUserAccount(sessionToken, username, rawPassword, roleName, email, name) {
    try {
      // Input validation
      if (!sessionToken || typeof sessionToken !== 'string' || sessionToken.trim().length === 0) {
        return { 
          success: false, 
          userId: null, 
          message: "Valid session token is required" 
        };
      }

      if (!username || typeof username !== 'string' || username.trim().length === 0) {
        return { 
          success: false, 
          userId: null, 
          message: "Username is required and cannot be empty" 
        };
      }

      if (username.length > 50) {
        return { 
          success: false, 
          userId: null, 
          message: "Username cannot exceed 50 characters" 
        };
      }

      if (!rawPassword || typeof rawPassword !== 'string' || rawPassword.trim().length === 0) {
        return { 
          success: false, 
          userId: null, 
          message: "Password is required and cannot be empty" 
        };
      }

      if (rawPassword.length < 8) {
        return { 
          success: false, 
          userId: null, 
          message: "Password must be at least 8 characters long" 
        };
      }

      if (!roleName || typeof roleName !== 'string' || roleName.trim().length === 0) {
        return { 
          success: false, 
          userId: null, 
          message: "Role name is required" 
        };
      }

      if (!email || typeof email !== 'string' || email.trim().length === 0) {
        return { 
          success: false, 
          userId: null, 
          message: "Email is required and cannot be empty" 
        };
      }

      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return { 
          success: false, 
          userId: null, 
          message: "Invalid email format" 
        };
      }

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return { 
          success: false, 
          userId: null, 
          message: "Name is required and cannot be empty" 
        };
      }

      if (name.length > 100) {
        return { 
          success: false, 
          userId: null, 
          message: "Name cannot exceed 100 characters" 
        };
      }

      // Check authorization - must have CREATE_USER permission
      const auth = await AuthorizationHelper.checkPermission(sessionToken, Permissions.CREATE_USER);
      
      if (!auth.authorized) {
        return { success: false, userId: null, message: auth.message };
      }

      // Check if username already exists
      const usernameExists = await UserAccount.existsByUsername(username.trim());
      if (usernameExists) {
        return { 
          success: false, 
          userId: null, 
          message: "Username already exists" 
        };
      }

      // Find profile
      const profile = await UserProfile.findByRoleName(roleName.trim());
      if (!profile) {
        return { 
          success: false, 
          userId: null, 
          message: `UserProfile with roleName '${roleName.trim()}' not found.` 
        };
      }

      const passwordHash = new Password(String(rawPassword.trim()));
      this.#userAccount = new UserAccount(username.trim(), name.trim(), passwordHash, email.trim(), profile);

      const userId = await this.#userAccount.createUserAccount();
      
      return { 
        success: true, 
        userId: userId, 
        message: "User account created successfully" 
      };

    } catch (error) {
      throw new Error(`User account creation failed: ${error.message}`);
    }
  }
}