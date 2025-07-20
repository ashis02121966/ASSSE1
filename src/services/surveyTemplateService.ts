import { supabase } from '../lib/supabase';
import { SurveyTemplate, ApiResponse, PaginatedResponse } from '../types';

export class SurveyTemplateService {
  // Get all survey templates with pagination
  static async getSurveyTemplates(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<PaginatedResponse<SurveyTemplate>> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('survey_templates')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (params?.search) {
      query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`);
    }

    if (params?.isActive !== undefined) {
      query = query.eq('is_active', params.isActive);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    const templates = data?.map(this.mapDatabaseToSurveyTemplate) || [];
    const totalPages = Math.ceil((count || 0) / limit);

    return {
      data: templates,
      total: count || 0,
      page,
      limit,
      totalPages
    };
  }

  // Get survey template by ID
  static async getSurveyTemplateById(id: string): Promise<SurveyTemplate | null> {
    const { data, error } = await supabase
      .from('survey_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;

    return this.mapDatabaseToSurveyTemplate(data);
  }

  // Get active survey templates
  static async getActiveSurveyTemplates(): Promise<SurveyTemplate[]> {
    const { data, error } = await supabase
      .from('survey_templates')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;

    return data?.map(this.mapDatabaseToSurveyTemplate) || [];
  }

  // Create new survey template
  static async createSurveyTemplate(templateData: Omit<SurveyTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<SurveyTemplate>> {
    try {
      const { data, error } = await supabase
        .from('survey_templates')
        .insert({
          name: templateData.name,
          description: templateData.description,
          version: templateData.version,
          is_active: templateData.isActive,
          template_data: templateData.templateData
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data: this.mapDatabaseToSurveyTemplate(data),
        message: 'Survey template created successfully'
      };
    } catch (error: any) {
      return { error: error.message || 'Failed to create survey template' };
    }
  }

  // Update survey template
  static async updateSurveyTemplate(id: string, updates: Partial<SurveyTemplate>): Promise<ApiResponse<SurveyTemplate>> {
    try {
      const { data, error } = await supabase
        .from('survey_templates')
        .update({
          name: updates.name,
          description: updates.description,
          version: updates.version,
          is_active: updates.isActive,
          template_data: updates.templateData
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        data: this.mapDatabaseToSurveyTemplate(data),
        message: 'Survey template updated successfully'
      };
    } catch (error: any) {
      return { error: error.message || 'Failed to update survey template' };
    }
  }

  // Delete survey template
  static async deleteSurveyTemplate(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('survey_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { message: 'Survey template deleted successfully' };
    } catch (error: any) {
      return { error: error.message || 'Failed to delete survey template' };
    }
  }

  // Activate/Deactivate survey template
  static async toggleSurveyTemplateStatus(id: string, isActive: boolean): Promise<ApiResponse<SurveyTemplate>> {
    try {
      const { data, error } = await supabase
        .from('survey_templates')
        .update({ is_active: isActive })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        data: this.mapDatabaseToSurveyTemplate(data),
        message: `Survey template ${isActive ? 'activated' : 'deactivated'} successfully`
      };
    } catch (error: any) {
      return { error: error.message || 'Failed to update survey template status' };
    }
  }

  // Clone survey template
  static async cloneSurveyTemplate(id: string, newName: string): Promise<ApiResponse<SurveyTemplate>> {
    try {
      const original = await this.getSurveyTemplateById(id);
      if (!original) {
        return { error: 'Survey template not found' };
      }

      const clonedTemplate = {
        name: newName,
        description: `Cloned from ${original.name}`,
        version: '1.0',
        isActive: false,
        templateData: original.templateData
      };

      return await this.createSurveyTemplate(clonedTemplate);
    } catch (error: any) {
      return { error: error.message || 'Failed to clone survey template' };
    }
  }

  // Helper method to map database row to SurveyTemplate type
  private static mapDatabaseToSurveyTemplate(data: any): SurveyTemplate {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      version: data.version,
      isActive: data.is_active,
      templateData: data.template_data,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}