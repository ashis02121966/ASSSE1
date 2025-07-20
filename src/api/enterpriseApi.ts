import { EnterpriseService } from '../services/enterpriseService';
import { Enterprise, ApiResponse, PaginatedResponse } from '../types';

export class EnterpriseApi {
  // GET /api/enterprises
  static async getEnterprises(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sector?: string;
    status?: string;
  }): Promise<PaginatedResponse<Enterprise>> {
    return await EnterpriseService.getEnterprises(params);
  }

  // GET /api/enterprises/:id
  static async getEnterprise(id: string): Promise<ApiResponse<Enterprise>> {
    try {
      const enterprise = await EnterpriseService.getEnterpriseById(id);
      if (!enterprise) {
        return { error: 'Enterprise not found' };
      }
      return { data: enterprise };
    } catch (error: any) {
      return { error: error.message || 'Failed to fetch enterprise' };
    }
  }

  // POST /api/enterprises
  static async createEnterprise(enterpriseData: Omit<Enterprise, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Enterprise>> {
    return await EnterpriseService.createEnterprise(enterpriseData);
  }

  // PUT /api/enterprises/:id
  static async updateEnterprise(id: string, updates: Partial<Enterprise>): Promise<ApiResponse<Enterprise>> {
    return await EnterpriseService.updateEnterprise(id, updates);
  }

  // DELETE /api/enterprises/:id
  static async deleteEnterprise(id: string): Promise<ApiResponse<void>> {
    return await EnterpriseService.deleteEnterprise(id);
  }

  // GET /api/enterprises/sector/:sector
  static async getEnterprisesBySector(sector: string): Promise<ApiResponse<Enterprise[]>> {
    try {
      const enterprises = await EnterpriseService.getEnterprisesBySector(sector);
      return { data: enterprises };
    } catch (error: any) {
      return { error: error.message || 'Failed to fetch enterprises by sector' };
    }
  }

  // GET /api/enterprises/stats
  static async getEnterpriseStats(): Promise<ApiResponse<any>> {
    try {
      const stats = await EnterpriseService.getEnterpriseStats();
      return { data: stats };
    } catch (error: any) {
      return { error: error.message || 'Failed to fetch enterprise statistics' };
    }
  }

  // POST /api/enterprises/bulk-import
  static async bulkImportEnterprises(enterprises: Omit<Enterprise, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<ApiResponse<{ imported: number; errors: string[] }>> {
    return await EnterpriseService.bulkImportEnterprises(enterprises);
  }

  // GET /api/enterprises/search
  static async searchEnterprises(query: string): Promise<ApiResponse<Enterprise[]>> {
    try {
      const result = await EnterpriseService.getEnterprises({
        search: query,
        limit: 50
      });
      return { data: result.data };
    } catch (error: any) {
      return { error: error.message || 'Failed to search enterprises' };
    }
  }

  // PATCH /api/enterprises/:id/status
  static async updateEnterpriseStatus(id: string, status: 'active' | 'inactive' | 'suspended'): Promise<ApiResponse<Enterprise>> {
    return await EnterpriseService.updateEnterprise(id, { status });
  }
}