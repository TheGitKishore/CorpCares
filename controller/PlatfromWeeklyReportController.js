import { ServiceRequest } from '../entities/ServiceRequest.js';
import { AuthorizationHelper } from '../helpers/AuthorizationHelper.js';
import { Permissions } from '../constants/Permissions.js';

export class PlatformWeeklyReportController {
  async generateWeeklyReport(sessionToken, reportDate = null) {
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

      // Calculate week start (Monday) and end (Sunday)
      const weekStart = new Date(targetDate);
      const dayOfWeek = weekStart.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Monday start
      weekStart.setDate(weekStart.getDate() + diff);
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const report = await ServiceRequest.getWeeklyStatistics(weekStart, weekEnd);

      return {
        success: true,
        report: {
          weekStart: weekStart.toISOString().split('T')[0],
          weekEnd: new Date(weekEnd.getTime() - 1).toISOString().split('T')[0],
          ...report
        },
        message: "Weekly report generated successfully"
      };
    } catch (error) {
      throw new Error(`Failed to generate weekly report: ${error.message}`);
    }
  }
}