import { supabase } from '../lib/supabase';
import { Survey, SurveySchedule, SurveyBlock, SurveyField } from '../types';

export class SurveyService {
  // Get all surveys
  static async getSurveys(): Promise<Survey[]> {
    const { data, error } = await supabase
      .from('surveys')
      .select(`
        *,
        frame:frames(*),
        compiler:users!surveys_compiler_id_fkey(name),
        scrutinizer:users!surveys_scrutinizer_id_fkey(name),
        schedule:survey_schedules(*)
      `)
      .order('last_modified', { ascending: false });

    if (error) throw error;

    // Get survey blocks and responses for each survey
    const surveysWithBlocks = await Promise.all(
      data.map(async (survey) => {
        const blocks = await this.getSurveyBlocks(survey.id);
        
        return {
          id: survey.id,
          frameId: survey.frame_id,
          enterpriseId: survey.enterprise_id,
          status: survey.status as Survey['status'],
          lastModified: survey.last_modified,
          compiler: survey.compiler?.name,
          scrutinizer: survey.scrutinizer?.name,
          blocks
        };
      })
    );

    return surveysWithBlocks;
  }

  // Get survey by ID
  static async getSurveyById(id: string): Promise<Survey | null> {
    const { data, error } = await supabase
      .from('surveys')
      .select(`
        *,
        frame:frames(*),
        compiler:users!surveys_compiler_id_fkey(name),
        scrutinizer:users!surveys_scrutinizer_id_fkey(name),
        schedule:survey_schedules(*)
      `)
      .eq('id', id)
      .single();

    if (error) return null;

    const blocks = await this.getSurveyBlocks(id);

    return {
      id: data.id,
      frameId: data.frame_id,
      enterpriseId: data.enterprise_id,
      status: data.status as Survey['status'],
      lastModified: data.last_modified,
      compiler: data.compiler?.name,
      scrutinizer: data.scrutinizer?.name,
      blocks
    };
  }

  // Get survey blocks with fields and responses
  private static async getSurveyBlocks(surveyId: string): Promise<SurveyBlock[]> {
    // First get the survey to find its schedule
    const { data: survey } = await supabase
      .from('surveys')
      .select('schedule_id')
      .eq('id', surveyId)
      .single();

    if (!survey?.schedule_id) return [];

    // Get blocks for the schedule
    const { data: blocks, error } = await supabase
      .from('survey_blocks')
      .select(`
        *,
        survey_fields(*)
      `)
      .eq('schedule_id', survey.schedule_id)
      .order('order_index');

    if (error) return [];

    // Get responses for this survey
    const { data: responses } = await supabase
      .from('survey_responses')
      .select('*')
      .eq('survey_id', surveyId);

    const responseMap = new Map(responses?.map(r => [r.field_id, r.value]) || []);

    return blocks.map(block => ({
      id: block.id,
      name: block.name,
      description: block.description,
      completed: false, // Calculate based on required fields
      fields: block.survey_fields
        .sort((a: any, b: any) => a.order_index - b.order_index)
        .map((field: any) => ({
          id: field.id,
          label: field.label,
          type: field.field_type as SurveyField['type'],
          value: responseMap.get(field.id) || '',
          required: field.is_required
        }))
    }));
  }

  // Create new survey
  static async createSurvey(surveyData: {
    frameId: string;
    enterpriseId: string;
    scheduleId: string;
    compilerId?: string;
  }): Promise<Survey> {
    const { data, error } = await supabase
      .from('surveys')
      .insert({
        frame_id: surveyData.frameId,
        enterprise_id: surveyData.enterpriseId,
        schedule_id: surveyData.scheduleId,
        compiler_id: surveyData.compilerId,
        status: 'draft'
      })
      .select()
      .single();

    if (error) throw error;

    const survey = await this.getSurveyById(data.id);
    if (!survey) throw new Error('Survey not found after creation');
    
    return survey;
  }

  // Update survey response
  static async updateSurveyResponse(surveyId: string, fieldId: string, value: string): Promise<void> {
    const { error } = await supabase
      .from('survey_responses')
      .upsert({
        survey_id: surveyId,
        field_id: fieldId,
        value: value
      });

    if (error) throw error;

    // Update survey last_modified
    await supabase
      .from('surveys')
      .update({ last_modified: new Date().toISOString() })
      .eq('id', surveyId);
  }

  // Update survey status
  static async updateSurveyStatus(id: string, status: Survey['status']): Promise<void> {
    const { error } = await supabase
      .from('surveys')
      .update({ 
        status,
        last_modified: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  }

  // Get survey schedules
  static async getSurveySchedules(): Promise<SurveySchedule[]> {
    const { data, error } = await supabase
      .from('survey_schedules')
      .select(`
        *,
        survey_blocks(
          *,
          survey_fields(*)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(schedule => ({
      id: schedule.id,
      name: schedule.name,
      description: schedule.description,
      sector: schedule.sector,
      year: schedule.year,
      isActive: schedule.is_active,
      blocks: schedule.survey_blocks
        .sort((a: any, b: any) => a.order_index - b.order_index)
        .map((block: any) => ({
          id: block.id,
          name: block.name,
          description: block.description,
          completed: false,
          fields: block.survey_fields
            .sort((a: any, b: any) => a.order_index - b.order_index)
            .map((field: any) => ({
              id: field.id,
              label: field.label,
              type: field.field_type as SurveyField['type'],
              value: '',
              required: field.is_required
            }))
        }))
    }));
  }
}