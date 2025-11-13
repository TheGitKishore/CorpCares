import { ServiceRequest } from '../entities/ServiceRequest.js';
import { AuthorizationHelper } from '../helpers/AuthorizationHelper.js';
import { Permissions } from '../constants/Permissions.js';

export class PlatformDailyReportController {
  async generateDailyReport(sessionToken, reportDate = null) {
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

      let targetDate = reportDate ? new Date(reportDate) : new Date();
      if (isNaN(targetDate.getTime())) {
        return { success: false, report: null, message: "Invalid date format. Please provide a valid date." };
      }

      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const report = await ServiceRequest.getDailyStatistics(targetDate, nextDay);

      return {
        success: true,
        report: {
          date: targetDate.toISOString().split('T')[0],
          ...report
        },
        message: "Daily report generated successfully"
      };
    } catch (error) {
      throw new Error(`Failed to generate daily report: ${error.message}`);
    }
  }
}