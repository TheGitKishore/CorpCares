export class PlatformWeeklyReportController {
  
  /**
   * Generate weekly report summarizing volunteer service participation
   * Returns statistics for the week containing the specified date
   */
  async generateWeeklyReport(sessionToken, reportDate = null) {
    try {
      // Check authorization - must have VIEW_STATISTICS permission
      const auth = await AuthorizationHelper.checkPermission(
        sessionToken, 
        Permissions.VIEW_STATISTICS
      );
      
      if (!auth.authorized) {
        return { success: false, report: null, message: auth.message };
      }

      // Default to current week if no date provided
      const targetDate = reportDate ? new Date(reportDate) : new Date();
      
      // Calculate week start (Monday) and end (Sunday)
      const weekStart = new Date(targetDate);
      const dayOfWeek = weekStart.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Monday start
      weekStart.setDate(weekStart.getDate() + diff);
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      // Get weekly statistics
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
