import { ServiceRequest } from '../entities/ServiceRequest.js';
import { AuthorizationHelper } from '../helpers/AuthorizationHelper.js';
import { Permissions } from '../constants/Permissions.js';

export class PlatformDailyReportController {
  
  /**
   * Generate daily report of volunteer activities and category usage
   * Returns statistics for the specified date (defaults to today)
   */
  async generateDailyReport(sessionToken, reportDate = null) {
    try {
      // Input validation
      if (!sessionToken || typeof sessionToken !== 'string' || sessionToken.trim().length === 0) {
        return { 
          success: false, 
          report: null, 
          message: "Valid session token is required" 
        };
      }

      // Check authorization - must have VIEW_STATISTICS permission
      const auth = await AuthorizationHelper.checkPermission(
        sessionToken, 
        Permissions.VIEW_STATISTICS
      );
      
      if (!auth.authorized) {
        return { success: false, report: null, message: auth.message };
      }

      // Validate and parse date if provided
      let targetDate;
      if (reportDate !== null) {
        targetDate = new Date(reportDate);
        if (isNaN(targetDate.getTime())) {
          return { 
            success: false, 
            report: null, 
            message: "Invalid date format. Please provide a valid date." 
          };
        }
      } else {
        targetDate = new Date();
      }

      targetDate.setHours(0, 0, 0, 0);

      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      // Get daily statistics
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