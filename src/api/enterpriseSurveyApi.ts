import { EnterpriseSurveyService } from '../services/enterpriseSurveyService';
import { EnterpriseSurvey, ApiResponse, PaginatedResponse } from '../types';

export class EnterpriseSurveyApi {
  // GET /api/enterprise-surveys
  static async getEnterpriseSurveys(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    assignedTo?: string;
    enterpriseId?: string;
  }): Promise<PaginatedResponse<EnterpriseSurvey>> {
    return await EnterpriseSurveyService.getEnterpriseSurveys(params);
  }

  // GET /api/enterprise-surveys/:id
  static async getEnterpriseSurvey(id: string): Promise<ApiResponse<EnterpriseSurvey>> {
    try {
      const survey = await EnterpriseSurveyService.getEnterpriseSurveyById(id);
      if (!survey) {
        return { error: 'Enterprise survey not found' };
      }
      return { data: survey };
    } catch (error: any) {
      return { error: error.message || 'Failed to fetch enterprise survey' };
    }
  }

  // GET /api/enterprise-surveys/enterprise/:enterpriseId
  static async getEnterpriseSurveysByEnterprise(enterpriseId: string): Promise<ApiResponse<EnterpriseSurvey[]>> {
    try {
      const surveys = await EnterpriseSurveyService.getEnterpriseSurveysByEnterpriseId(enterpriseId);
      return { data: surveys };
    } catch (error: any) {
      return { error: error.message || 'Failed to fetch enterprise surveys' };
    }
  }

  // GET /api/enterprise-surveys/assigned/:userId
  static async getEnterpriseSurveysByUser(userId: string): Promise<ApiResponse<EnterpriseSurvey[]>> {
    try {
      const surveys = await EnterpriseSurveyService.getEnterpriseSurveysByAssignedUser(userId);
      return { data: surveys };
    } catch (error: any) {
      return { error: error.message || 'Failed to fetch assigned surveys' };
    }
  }

  // POST /api/enterprise-surveys
  static async createEnterpriseSurvey(surveyData: Omit<EnterpriseSurvey, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<EnterpriseSurvey>> {
    return await EnterpriseSurveyService.createEnterpriseSurvey(surveyData);
  }

  // PUT /api/enterprise-surveys/:id
  static async updateEnterpriseSurvey(id: string, updates: Partial<EnterpriseSurvey>): Promise<ApiResponse<EnterpriseSurvey>> {
    return await EnterpriseSurveyService.updateEnterpriseSurvey(id, updates);
  }

  // DELETE /api/enterprise-surveys/:id
  static async deleteEnterpriseSurvey(id: string): Promise<ApiResponse<void>> {
    return await EnterpriseSurveyService.deleteEnterpriseSurvey(id);
  }

  // POST /api/enterprise-surveys/bulk-assign
  static async bulkAssignSurveys(assignments: {
    enterpriseIds: string[];
    surveyId: string;
    templateId?: string;
    assignedTo?: string;
    dueDate?: string;
  }): Promise<ApiResponse<{ assigned: number; errors: string[] }>> {
    return await EnterpriseSurveyService.bulkAssignSurveys(assignments);
  }

  // GET /api/enterprise-surveys/stats
  static async getEnterpriseSurveyStats(): Promise<ApiResponse<any>> {
    try {
      const stats = await EnterpriseSurveyService.getEnterpriseSurveyStats();
      return { data: stats };
    } catch (error: any) {
      return { error: error.message || 'Failed to fetch enterprise survey statistics' };
    }
  }

  // PATCH /api/enterprise-surveys/:id/status
  static async updateEnterpriseSurveyStatus(id: string, status: EnterpriseSurvey['status']): Promise<ApiResponse<EnterpriseSurvey>> {
    return await EnterpriseSurveyService.updateEnterpriseSurvey(id, { status });
  }

  // PATCH /api/enterprise-surveys/:id/assign
  static async assignEnterpriseSurvey(id: string, assignedTo: string): Promise<ApiResponse<EnterpriseSurvey>> {
    return await EnterpriseSurveyService.updateEnterpriseSurvey(id, { assignedTo });
  }

  // PATCH /api/enterprise-surveys/:id/complete
  static async completeEnterpriseSurvey(id: string): Promise<ApiResponse<EnterpriseSurvey>> {
    return await EnterpriseSurveyService.updateEnterpriseSurvey(id, { 
      status: 'completed',
      completedAt: new Date().toISOString()
    });
  }
}