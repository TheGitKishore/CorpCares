import { ServiceRequest } from '../entities/ServiceRequest.js';
import { AuthorizationHelper } from '../helpers/AuthorizationHelper.js';
import { Permissions } from '../constants/Permissions.js';

export class PlatformMonthlyReportController {
  async generateMonthlyReport(sessionToken, year = null, month = null) {
    try {
      if (!sessionToken || typeof sessionToken !== 'string' || sessionToken.trim().length === 0) {
        return { success: false, report: null, message: "Valid session token is required" };
      }

      const auth = await AuthorizationHelper.checkPermission(
        sessionToken,
        Permissions.VIEW_STATISTICS
      );

      if (!auth.authorized) {
        return { success: false, report: null, message: auth.message };
      }

      // Default to current month if not specified
      const now = new Date();
      const targetYear = year !== null ? parseInt(year) : now.getFullYear();
      const targetMonth = month !== null ? parseInt(month) : now.getMonth() + 1; // 1-12

      // Validate year
      if (isNaN(targetYear) || targetYear < 2000 || targetYear > 2100) {
        return {
          success: false,
          report: null,
          message: "Invalid year. Must be between 2000 and 2100"
        };
      }

      // Validate month
      if (isNaN(targetMonth) || targetMonth < 1 || targetMonth > 12) {
        return {
          success: false,
          report: null,
          message: "Invalid month. Must be between 1 and 12"
        };
      }

      // Calculate month start and end
      const monthStart = new Date(targetYear, targetMonth - 1, 1);
      monthStart.setHours(0, 0, 0, 0);

      const monthEnd = new Date(targetYear, targetMonth, 1);
      monthEnd.setHours(0, 0, 0, 0);

      const report = await ServiceRequest.getMonthlyStatistics(monthStart, monthEnd);

      return {
        success: true,
        report: {
          year: targetYear,
          month: targetMonth,
          monthName: monthStart.toLocaleString('default', { month: 'long' }),
          ...report
        },
        message: "Monthly report generated successfully"
      };
    } catch (error) {
      throw new Error(`Failed to generate monthly report: ${error.message}`);
    }
  }
}