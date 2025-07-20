import { supabase } from '../lib/supabase';
import { EnterpriseSurvey, ApiResponse, PaginatedResponse } from '../types';

export class EnterpriseSurveyService {
  // Get all enterprise surveys with pagination and filtering
  static async getEnterpriseSurveys(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    assignedTo?: string;
    enterpriseId?: string;
  }): Promise<PaginatedResponse<EnterpriseSurvey>> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('enterprise_surveys')
      .select(`
        *,
        enterprise:enterprises(*),
        survey:surveys(*),
        template:survey_templates(*),
        assigned_user:users!enterprise_surveys_assigned_to_fkey(*)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (params?.status) {
      query = query.eq('status', params.status);
    }

    if (params?.assignedTo) {
      query = query.eq('assigned_to', params.assignedTo);
    }

    if (params?.enterpriseId) {
      query = query.eq('enterprise_id', params.enterpriseId);
    }

    if (params?.search) {
      query = query.or(`enterprises.name.ilike.%${params.search}%,enterprises.gstn.ilike.%${params.search}%`);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    const enterpriseSurveys = data?.map(this.mapDatabaseToEnterpriseSurvey) || [];
    const totalPages = Math.ceil((count || 0) / limit);

    return {
      data: enterpriseSurveys,
      total: count || 0,
      page,
      limit,
      totalPages
    };
  }

  // Get enterprise survey by ID
  static async getEnterpriseSurveyById(id: string): Promise<EnterpriseSurvey | null> {
    const { data, error } = await supabase
      .from('enterprise_surveys')
      .select(`
        *,
        enterprise:enterprises(*),
        survey:surveys(*),
        template:survey_templates(*),
        assigned_user:users!enterprise_surveys_assigned_to_fkey(*)
      `)
      .eq('id', id)
      .single();

    if (error) return null;

    return this.mapDatabaseToEnterpriseSurvey(data);
  }

  // Get enterprise surveys by enterprise ID
  static async getEnterpriseSurveysByEnterpriseId(enterpriseId: string): Promise<EnterpriseSurvey[]> {
    const { data, error } = await supabase
      .from('enterprise_surveys')
      .select(`
        *,
        enterprise:enterprises(*),
        survey:surveys(*),
        template:survey_templates(*),
        assigned_user:users!enterprise_surveys_assigned_to_fkey(*)
      `)
      .eq('enterprise_id', enterpriseId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data?.map(this.mapDatabaseToEnterpriseSurvey) || [];
  }

  // Get enterprise surveys assigned to user
  static async getEnterpriseSurveysByAssignedUser(userId: string): Promise<EnterpriseSurvey[]> {
    const { data, error } = await supabase
      .from('enterprise_surveys')
      .select(`
        *,
        enterprise:enterprises(*),
        survey:surveys(*),
        template:survey_templates(*),
        assigned_user:users!enterprise_surveys_assigned_to_fkey(*)
      `)
      .eq('assigned_to', userId)
      .order('due_date', { ascending: true });

    if (error) throw error;

    return data?.map(this.mapDatabaseToEnterpriseSurvey) || [];
  }

  // Create new enterprise survey
  static async createEnterpriseSurvey(surveyData: Omit<EnterpriseSurvey, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<EnterpriseSurvey>> {
    try {
      // Check if enterprise survey already exists
      const { data: existing } = await supabase
        .from('enterprise_surveys')
        .select('id')
        .eq('enterprise_id', surveyData.enterpriseId)
        .eq('survey_id', surveyData.surveyId)
        .single();

      if (existing) {
        return { error: 'Survey already assigned to this enterprise' };
      }

      const { data, error } = await supabase
        .from('enterprise_surveys')
        .insert({
          enterprise_id: surveyData.enterpriseId,
          survey_id: surveyData.surveyId,
          template_id: surveyData.templateId,
          status: surveyData.status,
          assigned_to: surveyData.assignedTo,
          due_date: surveyData.dueDate
        })
        .select(`
          *,
          enterprise:enterprises(*),
          survey:surveys(*),
          template:survey_templates(*),
          assigned_user:users!enterprise_surveys_assigned_to_fkey(*)
        `)
        .single();

      if (error) throw error;

      return {
        data: this.mapDatabaseToEnterpriseSurvey(data),
        message: 'Enterprise survey created successfully'
      };
    } catch (error: any) {
      return { error: error.message || 'Failed to create enterprise survey' };
    }
  }

  // Update enterprise survey
  static async updateEnterpriseSurvey(id: string, updates: Partial<EnterpriseSurvey>): Promise<ApiResponse<EnterpriseSurvey>> {
    try {
      const updateData: any = {};

      if (updates.status) updateData.status = updates.status;
      if (updates.assignedTo) updateData.assigned_to = updates.assignedTo;
      if (updates.dueDate) updateData.due_date = updates.dueDate;
      if (updates.completedAt) updateData.completed_at = updates.completedAt;
      if (updates.templateId) updateData.template_id = updates.templateId;

      // Auto-set completed_at when status changes to completed
      if (updates.status === 'completed' && !updates.completedAt) {
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('enterprise_surveys')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          enterprise:enterprises(*),
          survey:surveys(*),
          template:survey_templates(*),
          assigned_user:users!enterprise_surveys_assigned_to_fkey(*)
        `)
        .single();

      if (error) throw error;

      return {
        data: this.mapDatabaseToEnterpriseSurvey(data),
        message: 'Enterprise survey updated successfully'
      };
    } catch (error: any) {
      return { error: error.message || 'Failed to update enterprise survey' };
    }
  }

  // Delete enterprise survey
  static async deleteEnterpriseSurvey(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('enterprise_surveys')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { message: 'Enterprise survey deleted successfully' };
    } catch (error: any) {
      return { error: error.message || 'Failed to delete enterprise survey' };
    }
  }

  // Bulk assign surveys to enterprises
  static async bulkAssignSurveys(assignments: {
    enterpriseIds: string[];
    surveyId: string;
    templateId?: string;
    assignedTo?: string;
    dueDate?: string;
  }): Promise<ApiResponse<{ assigned: number; errors: string[] }>> {
    try {
      const errors: string[] = [];
      let assigned = 0;

      for (const enterpriseId of assignments.enterpriseIds) {
        const result = await this.createEnterpriseSurvey({
          enterpriseId,
          surveyId: assignments.surveyId,
          templateId: assignments.templateId,
          status: 'assigned',
          assignedTo: assignments.assignedTo,
          dueDate: assignments.dueDate
        });

        if (result.error) {
          errors.push(`Enterprise ${enterpriseId}: ${result.error}`);
        } else {
          assigned++;
        }
      }

      return {
        data: { assigned, errors },
        message: `Assigned surveys to ${assigned} enterprises with ${errors.length} errors`
      };
    } catch (error: any) {
      return { error: error.message || 'Failed to bulk assign surveys' };
    }
  }

  // Get enterprise survey statistics
  static async getEnterpriseSurveyStats(): Promise<{
    total: number;
    assigned: number;
    inProgress: number;
    completed: number;
    overdue: number;
    cancelled: number;
  }> {
    const { data, error } = await supabase
      .from('enterprise_surveys')
      .select('status, due_date');

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      assigned: 0,
      inProgress: 0,
      completed: 0,
      overdue: 0,
      cancelled: 0
    };

    const now = new Date();

    data?.forEach(survey => {
      switch (survey.status) {
        case 'assigned':
          stats.assigned++;
          break;
        case 'in_progress':
          stats.inProgress++;
          break;
        case 'completed':
          stats.completed++;
          break;
        case 'overdue':
          stats.overdue++;
          break;
        case 'cancelled':
          stats.cancelled++;
          break;
      }

      // Check for overdue surveys
      if (survey.due_date && new Date(survey.due_date) < now && survey.status !== 'completed' && survey.status !== 'cancelled') {
        stats.overdue++;
      }
    });

    return stats;
  }

  // Helper method to map database row to EnterpriseSurvey type
  private static mapDatabaseToEnterpriseSurvey(data: any): EnterpriseSurvey {
    return {
      id: data.id,
      enterpriseId: data.enterprise_id,
      surveyId: data.survey_id,
      templateId: data.template_id,
      status: data.status,
      assignedTo: data.assigned_to,
      dueDate: data.due_date,
      completedAt: data.completed_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      enterprise: data.enterprise ? {
        id: data.enterprise.id,
        name: data.enterprise.name,
        gstn: data.enterprise.gstn,
        address: data.enterprise.address,
        contactPerson: data.enterprise.contact_person,
        contactPhone: data.enterprise.contact_phone,
        contactEmail: data.enterprise.contact_email,
        sector: data.enterprise.sector,
        district: data.enterprise.district,
        state: data.enterprise.state,
        pinCode: data.enterprise.pin_code,
        status: data.enterprise.status,
        createdAt: data.enterprise.created_at,
        updatedAt: data.enterprise.updated_at
      } : undefined,
      survey: data.survey,
      template: data.template ? {
        id: data.template.id,
        name: data.template.name,
        description: data.template.description,
        version: data.template.version,
        isActive: data.template.is_active,
        templateData: data.template.template_data,
        createdAt: data.template.created_at,
        updatedAt: data.template.updated_at
      } : undefined,
      assignedUser: data.assigned_user ? {
        id: data.assigned_user.id,
        name: data.assigned_user.name,
        email: data.assigned_user.email,
        profileImage: data.assigned_user.profile_image,
        roles: [],
        permissions: []
      } : undefined
    };
  }
}