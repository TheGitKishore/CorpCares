export class PlatformMonthlyReportController {
  
  /**
   * Generate monthly report showing overall volunteer engagement by category
   * Returns statistics for the specified month (defaults to current month)
   */
  async generateMonthlyReport(sessionToken, year = null, month = null) {
    try {
      // Check authorization - must have VIEW_STATISTICS permission
      const auth = await AuthorizationHelper.checkPermission(
        sessionToken, 
        Permissions.VIEW_STATISTICS
      );
      
      if (!auth.authorized) {
        return { success: false, report: null, message: auth.message };
      }

      // Default to current month if not specified
      const now = new Date();
      const targetYear = year !== null ? year : now.getFullYear();
      const targetMonth = month !== null ? month : now.getMonth() + 1; // 1-12

      // Validate month
      if (targetMonth < 1 || targetMonth > 12) {
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

      // Get monthly statistics
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