import { SurveyTemplateService } from '../services/surveyTemplateService';
import { SurveyTemplate, ApiResponse, PaginatedResponse } from '../types';

export class SurveyTemplateApi {
  // GET /api/survey-templates
  static async getSurveyTemplates(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<PaginatedResponse<SurveyTemplate>> {
    return await SurveyTemplateService.getSurveyTemplates(params);
  }

  // GET /api/survey-templates/:id
  static async getSurveyTemplate(id: string): Promise<ApiResponse<SurveyTemplate>> {
    try {
      const template = await SurveyTemplateService.getSurveyTemplateById(id);
      if (!template) {
        return { error: 'Survey template not found' };
      }
      return { data: template };
    } catch (error: any) {
      return { error: error.message || 'Failed to fetch survey template' };
    }
  }

  // GET /api/survey-templates/active
  static async getActiveSurveyTemplates(): Promise<ApiResponse<SurveyTemplate[]>> {
    try {
      const templates = await SurveyTemplateService.getActiveSurveyTemplates();
      return { data: templates };
    } catch (error: any) {
      return { error: error.message || 'Failed to fetch active survey templates' };
    }
  }

  // POST /api/survey-templates
  static async createSurveyTemplate(templateData: Omit<SurveyTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<SurveyTemplate>> {
    return await SurveyTemplateService.createSurveyTemplate(templateData);
  }

  // PUT /api/survey-templates/:id
  static async updateSurveyTemplate(id: string, updates: Partial<SurveyTemplate>): Promise<ApiResponse<SurveyTemplate>> {
    return await SurveyTemplateService.updateSurveyTemplate(id, updates);
  }

  // DELETE /api/survey-templates/:id
  static async deleteSurveyTemplate(id: string): Promise<ApiResponse<void>> {
    return await SurveyTemplateService.deleteSurveyTemplate(id);
  }

  // PATCH /api/survey-templates/:id/toggle-status
  static async toggleSurveyTemplateStatus(id: string, isActive: boolean): Promise<ApiResponse<SurveyTemplate>> {
    return await SurveyTemplateService.toggleSurveyTemplateStatus(id, isActive);
  }

  // POST /api/survey-templates/:id/clone
  static async cloneSurveyTemplate(id: string, newName: string): Promise<ApiResponse<SurveyTemplate>> {
    return await SurveyTemplateService.cloneSurveyTemplate(id, newName);
  }
}