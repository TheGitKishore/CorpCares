import { Session } from '../entities/Session.js';
import { RoleNames } from '../constants/RoleNames.js';

export class AuthorizationHelper {
  
  /**
   * Check if session has required permission (action-based)
   * Returns: { authorized: boolean, userAccount: UserAccount | null, message: string }
   */
  static async checkPermission(sessionToken, requiredAction) {
    try {
      if (!sessionToken) {
        return { 
          authorized: false, 
          userAccount: null, 
          message: "Authentication required" 
        };
      }

      // Validate session
      const session = await Session.findByToken(sessionToken);

      if (!session) {
        return { 
          authorized: false, 
          userAccount: null, 
          message: "Invalid or expired session" 
        };
      }

      if (!session.isValid()) {
        await session.endSession();
        return { 
          authorized: false, 
          userAccount: null, 
          message: "Session has timed out" 
        };
      }

      // Update activity
      await session.updateActivity();

      const userAccount = session.userAccount;

      // Check if user's profile has the required permission/action
      if (requiredAction && !userAccount.profile.hasPermission(requiredAction)) {
        return { 
          authorized: false, 
          userAccount: userAccount, 
          message: `Access denied. Required permission: ${requiredAction}` 
        };
      }

      return { 
        authorized: true, 
        userAccount: userAccount, 
        message: "Authorized" 
      };

    } catch (error) {
      throw new Error(`Authorization check failed: ${error.message}`);
    }
  }

  static async checkAnyPermission(sessionToken, allowedActions = []) {
    try {
      if (!sessionToken) {
        return { 
          authorized: false, 
          userAccount: null, 
          message: "Authentication required" 
        };
      }

      const session = await Session.findByToken(sessionToken);

      if (!session) {
        return { 
          authorized: false, 
          userAccount: null, 
          message: "Invalid or expired session" 
        };
      }

      if (!session.isValid()) {
        await session.endSession();
        return { 
          authorized: false, 
          userAccount: null, 
          message: "Session has timed out" 
        };
      }

      await session.updateActivity();

      const userAccount = session.userAccount;

      if (allowedActions.length > 0 && !userAccount.profile.hasAnyPermission(allowedActions)) {
        return { 
          authorized: false, 
          userAccount: userAccount, 
          message: `Access denied. Required permissions: ${allowedActions.join(', ')}` 
        };
      }

      return { 
        authorized: true, 
        userAccount: userAccount, 
        message: "Authorized" 
      };

    } catch (error) {
      throw new Error(`Authorization check failed: ${error.message}`);
    }
  }

  static async checkAllPermissions(sessionToken, requiredActions = []) {
    try {
      if (!sessionToken) {
        return { 
          authorized: false, 
          userAccount: null, 
          message: "Authentication required" 
        };
      }

      const session = await Session.findByToken(sessionToken);

      if (!session) {
        return { 
          authorized: false, 
          userAccount: null, 
          message: "Invalid or expired session" 
        };
      }

      if (!session.isValid()) {
        await session.endSession();
        return { 
          authorized: false, 
          userAccount: null, 
          message: "Session has timed out" 
        };
      }

      await session.updateActivity();

      const userAccount = session.userAccount;

      if (requiredActions.length > 0 && !userAccount.profile.hasAllPermissions(requiredActions)) {
        return { 
          authorized: false, 
          userAccount: userAccount, 
          message: `Access denied. Required all permissions: ${requiredActions.join(', ')}` 
        };
      }

      return { 
        authorized: true, 
        userAccount: userAccount, 
        message: "Authorized" 
      };

    } catch (error) {
      throw new Error(`Authorization check failed: ${error.message}`);
    }
  }

  static async verifyOwnership(sessionToken, userId) {
    try {
      const session = await Session.findByToken(sessionToken);

      if (!session || !session.isValid()) {
        return { 
          authorized: false, 
          message: "Invalid or expired session" 
        };
      }

      await session.updateActivity();

      if (session.userAccount.id !== userId) {
        return { 
          authorized: false, 
          message: "Access denied. You can only access your own resources" 
        };
      }

      return { 
        authorized: true, 
        userAccount: session.userAccount,
        message: "Authorized" 
      };

    } catch (error) {
      throw new Error(`Ownership verification failed: ${error.message}`);
    }
  }

  static async verifyOwnershipOrPermission(sessionToken, userId, requiredAction) {
    try {
      const session = await Session.findByToken(sessionToken);

      if (!session || !session.isValid()) {
        return { 
          authorized: false, 
          userAccount: null,
          message: "Invalid or expired session" 
        };
      }

      await session.updateActivity();

      const userAccount = session.userAccount;

      // Check if user is owner OR has the required permission
      const isOwner = userAccount.id === userId;
      const hasPermission = userAccount.profile.hasPermission(requiredAction);

      if (!isOwner && !hasPermission) {
        return { 
          authorized: false, 
          userAccount: userAccount,
          message: "Access denied. Must be owner or have required permission" 
        };
      }

      return { 
        authorized: true, 
        userAccount: userAccount,
        message: "Authorized" 
      };

    } catch (error) {
      throw new Error(`Ownership/permission verification failed: ${error.message}`);
    }
  }
}