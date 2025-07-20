import { AuditLogService } from '../services/auditLogService';
import { AuditLog, PaginatedResponse, ApiResponse } from '../types';

export class AuditLogApi {
  // GET /api/audit-logs
  static async getAuditLogs(params?: {
    page?: number;
    limit?: number;
    tableName?: string;
    action?: string;
    userId?: string;
    recordId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<PaginatedResponse<AuditLog>> {
    return await AuditLogService.getAuditLogs(params);
  }

  // GET /api/audit-logs/record/:tableName/:recordId
  static async getAuditLogsForRecord(tableName: string, recordId: string): Promise<ApiResponse<AuditLog[]>> {
    try {
      const logs = await AuditLogService.getAuditLogsForRecord(tableName, recordId);
      return { data: logs };
    } catch (error: any) {
      return { error: error.message || 'Failed to fetch audit logs for record' };
    }
  }

  // GET /api/audit-logs/user/:userId
  static async getAuditLogsByUser(userId: string, limit?: number): Promise<ApiResponse<AuditLog[]>> {
    try {
      const logs = await AuditLogService.getAuditLogsByUser(userId, limit);
      return { data: logs };
    } catch (error: any) {
      return { error: error.message || 'Failed to fetch audit logs for user' };
    }
  }

  // GET /api/audit-logs/stats
  static async getAuditStats(params?: {
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ApiResponse<any>> {
    try {
      const stats = await AuditLogService.getAuditStats(params);
      return { data: stats };
    } catch (error: any) {
      return { error: error.message || 'Failed to fetch audit statistics' };
    }
  }

  // GET /api/audit-logs/export
  static async exportAuditLogs(params?: {
    tableName?: string;
    action?: string;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
    format?: 'csv' | 'json';
  }): Promise<ApiResponse<{ data: string; filename: string }>> {
    try {
      const exportData = await AuditLogService.exportAuditLogs(params);
      return { data: exportData };
    } catch (error: any) {
      return { error: error.message || 'Failed to export audit logs' };
    }
  }
}