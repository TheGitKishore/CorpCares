import { UserAccount } from '../entities/UserAccount.js';
import { Session } from '../entities/Session.js';

export class AuthenticationController {
  
  /**
   * Login: Verify credentials and create session
   * Returns: { success: boolean, sessionToken: string, userAccount: UserAccount, message: string }
   */
  async login(username, rawPassword) {
    try {
      // Validate inputs
      if (!username || !rawPassword) {
        return { 
          success: false, 
          sessionToken: null, 
          userAccount: null, 
          message: "Username and password are required" 
        };
      }

      // Find user by username - UserAccount entity handles the database query
      const userAccount = await UserAccount.findByUsername(username);

      if (!userAccount) {
        return { 
          success: false, 
          sessionToken: null, 
          userAccount: null, 
          message: "Invalid username or password" 
        };
      }

      // Check if account is active
      if (!userAccount.isActive) {
        return { 
          success: false, 
          sessionToken: null, 
          userAccount: null, 
          message: "Account is inactive" 
        };
      }

      // Verify password - UserAccount entity handles password verification
      if (!userAccount.verifyPassword(rawPassword)) {
        return { 
          success: false, 
          sessionToken: null, 
          userAccount: null, 
          message: "Invalid username or password" 
        };
      }

      // End any existing sessions for this user (optional: enforce single session)
      await Session.endAllSessionsForUser(userAccount.id);

      // Create new session
      const session = new Session(userAccount);
      const sessionToken = await session.createSession();

      return {
        success: true,
        sessionToken: sessionToken,
        userAccount: userAccount,
        message: "Login successful"
      };

    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  /**
   * Logout: End the current session
   * Returns: { success: boolean, message: string }
   */
  async logout(sessionToken) {
    try {
      if (!sessionToken) {
        return { 
          success: false, 
          message: "Session token is required" 
        };
      }

      const session = await Session.findByToken(sessionToken);

      if (!session) {
        return { 
          success: false, 
          message: "Invalid or expired session" 
        };
      }

      await session.endSession();

      return { 
        success: true, 
        message: "Logout successful" 
      };

    } catch (error) {
      throw new Error(`Logout failed: ${error.message}`);
    }
  }

  /**
   * Validate Session: Check if session is valid and active
   * Returns: { valid: boolean, userAccount: UserAccount | null, message: string }
   */
  async validateSession(sessionToken) {
    try {
      if (!sessionToken) {
        return { 
          valid: false, 
          userAccount: null, 
          message: "Session token is required" 
        };
      }

      const session = await Session.findByToken(sessionToken);

      if (!session) {
        return { 
          valid: false, 
          userAccount: null, 
          message: "Invalid or expired session" 
        };
      }

      if (!session.isValid()) {
        await session.endSession();
        return { 
          valid: false, 
          userAccount: null, 
          message: "Session has timed out" 
        };
      }

      // Update last activity
      await session.updateActivity();

      return {
        valid: true,
        userAccount: session.userAccount,
        message: "Session is valid"
      };

    } catch (error) {
      throw new Error(`Session validation failed: ${error.message}`);
    }
  }
}