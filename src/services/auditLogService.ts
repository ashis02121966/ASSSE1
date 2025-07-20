import { supabase } from '../lib/supabase';
import { AuditLog, PaginatedResponse } from '../types';

export class AuditLogService {
  // Get audit logs with pagination and filtering
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
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('audit_logs')
      .select(`
        *,
        user:users(*)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (params?.tableName) {
      query = query.eq('table_name', params.tableName);
    }

    if (params?.action) {
      query = query.eq('action', params.action);
    }

    if (params?.userId) {
      query = query.eq('user_id', params.userId);
    }

    if (params?.recordId) {
      query = query.eq('record_id', params.recordId);
    }

    if (params?.dateFrom) {
      query = query.gte('created_at', params.dateFrom);
    }

    if (params?.dateTo) {
      query = query.lte('created_at', params.dateTo);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    const auditLogs = data?.map(this.mapDatabaseToAuditLog) || [];
    const totalPages = Math.ceil((count || 0) / limit);

    return {
      data: auditLogs,
      total: count || 0,
      page,
      limit,
      totalPages
    };
  }

  // Get audit logs for a specific record
  static async getAuditLogsForRecord(tableName: string, recordId: string): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select(`
        *,
        user:users(*)
      `)
      .eq('table_name', tableName)
      .eq('record_id', recordId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data?.map(this.mapDatabaseToAuditLog) || [];
  }

  // Get audit logs by user
  static async getAuditLogsByUser(userId: string, limit: number = 50): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select(`
        *,
        user:users(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data?.map(this.mapDatabaseToAuditLog) || [];
  }

  // Get audit statistics
  static async getAuditStats(params?: {
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{
    totalLogs: number;
    byAction: { [key: string]: number };
    byTable: { [key: string]: number };
    byUser: { [key: string]: number };
    recentActivity: AuditLog[];
  }> {
    let query = supabase
      .from('audit_logs')
      .select(`
        *,
        user:users(*)
      `);

    if (params?.dateFrom) {
      query = query.gte('created_at', params.dateFrom);
    }

    if (params?.dateTo) {
      query = query.lte('created_at', params.dateTo);
    }

    const { data, error } = await query;

    if (error) throw error;

    const stats = {
      totalLogs: data?.length || 0,
      byAction: {} as { [key: string]: number },
      byTable: {} as { [key: string]: number },
      byUser: {} as { [key: string]: number },
      recentActivity: [] as AuditLog[]
    };

    data?.forEach(log => {
      // Count by action
      stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;

      // Count by table
      stats.byTable[log.table_name] = (stats.byTable[log.table_name] || 0) + 1;

      // Count by user
      if (log.user?.name) {
        stats.byUser[log.user.name] = (stats.byUser[log.user.name] || 0) + 1;
      }
    });

    // Get recent activity (last 10 logs)
    stats.recentActivity = data?.slice(0, 10).map(this.mapDatabaseToAuditLog) || [];

    return stats;
  }

  // Export audit logs
  static async exportAuditLogs(params?: {
    tableName?: string;
    action?: string;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
    format?: 'csv' | 'json';
  }): Promise<{ data: string; filename: string }> {
    let query = supabase
      .from('audit_logs')
      .select(`
        *,
        user:users(*)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (params?.tableName) {
      query = query.eq('table_name', params.tableName);
    }

    if (params?.action) {
      query = query.eq('action', params.action);
    }

    if (params?.userId) {
      query = query.eq('user_id', params.userId);
    }

    if (params?.dateFrom) {
      query = query.gte('created_at', params.dateFrom);
    }

    if (params?.dateTo) {
      query = query.lte('created_at', params.dateTo);
    }

    const { data, error } = await query;

    if (error) throw error;

    const auditLogs = data?.map(this.mapDatabaseToAuditLog) || [];
    const format = params?.format || 'csv';
    const timestamp = new Date().toISOString().split('T')[0];

    if (format === 'csv') {
      const headers = ['ID', 'Table', 'Record ID', 'Action', 'User', 'Created At'];
      const rows = auditLogs.map(log => [
        log.id,
        log.tableName,
        log.recordId,
        log.action,
        log.user?.name || 'System',
        log.createdAt
      ]);

      const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      return {
        data: csvContent,
        filename: `audit_logs_${timestamp}.csv`
      };
    } else {
      return {
        data: JSON.stringify(auditLogs, null, 2),
        filename: `audit_logs_${timestamp}.json`
      };
    }
  }

  // Helper method to map database row to AuditLog type
  private static mapDatabaseToAuditLog(data: any): AuditLog {
    return {
      id: data.id,
      tableName: data.table_name,
      recordId: data.record_id,
      action: data.action,
      oldValues: data.old_values,
      newValues: data.new_values,
      userId: data.user_id,
      createdAt: data.created_at,
      user: data.user ? {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        profileImage: data.user.profile_image,
        roles: [],
        permissions: []
      } : undefined
    };
  }
}