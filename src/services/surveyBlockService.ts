import { supabase } from '../lib/supabase';
import { ApiResponse, PaginatedResponse } from '../types';

export interface SurveyBlockItem {
  id: string;
  blockId: string;
  itemId: string;
  itemName: string;
  dataType: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'email' | 'tel' | 'url';
  maxLength: number;
  isRequired: boolean;
  validationRules: any;
  options: string[];
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface SurveyBlock {
  id: string;
  scheduleId?: string;
  name: string;
  description: string;
  orderIndex: number;
  templateId?: string;
  isTemplate: boolean;
  category: string;
  createdAt: string;
  updatedAt: string;
  items?: SurveyBlockItem[];
}

export class SurveyBlockService {
  // Get all survey blocks with pagination
  static async getSurveyBlocks(params?: {
    page?: number;
    limit?: number;
    scheduleId?: string;
    isTemplate?: boolean;
    category?: string;
  }): Promise<PaginatedResponse<SurveyBlock>> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('survey_blocks')
      .select(`
        *,
        survey_block_items(*)
      `, { count: 'exact' })
      .order('order_index', { ascending: true });

    // Apply filters
    if (params?.scheduleId) {
      query = query.eq('schedule_id', params.scheduleId);
    }

    if (params?.isTemplate !== undefined) {
      query = query.eq('is_template', params.isTemplate);
    }

    if (params?.category) {
      query = query.eq('category', params.category);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    const blocks = data?.map(this.mapDatabaseToSurveyBlock) || [];
    const totalPages = Math.ceil((count || 0) / limit);

    return {
      data: blocks,
      total: count || 0,
      page,
      limit,
      totalPages
    };
  }

  // Get survey block by ID
  static async getSurveyBlockById(id: string): Promise<SurveyBlock | null> {
    const { data, error } = await supabase
      .from('survey_blocks')
      .select(`
        *,
        survey_block_items(*)
      `)
      .eq('id', id)
      .single();

    if (error) return null;

    return this.mapDatabaseToSurveyBlock(data);
  }

  // Get template blocks
  static async getTemplateBlocks(): Promise<SurveyBlock[]> {
    const { data, error } = await supabase
      .from('survey_blocks')
      .select(`
        *,
        survey_block_items(*)
      `)
      .eq('is_template', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;

    return data?.map(this.mapDatabaseToSurveyBlock) || [];
  }

  // Create new survey block
  static async createSurveyBlock(blockData: {
    scheduleId?: string;
    name: string;
    description: string;
    orderIndex: number;
    templateId?: string;
    isTemplate?: boolean;
    category?: string;
    items?: Omit<SurveyBlockItem, 'id' | 'blockId' | 'createdAt' | 'updatedAt'>[];
  }): Promise<ApiResponse<SurveyBlock>> {
    try {
      // Create the block
      const { data: blockData_result, error: blockError } = await supabase
        .from('survey_blocks')
        .insert({
          schedule_id: blockData.scheduleId,
          name: blockData.name,
          description: blockData.description,
          order_index: blockData.orderIndex,
          template_id: blockData.templateId,
          is_template: blockData.isTemplate || false,
          category: blockData.category || ''
        })
        .select()
        .single();

      if (blockError) throw blockError;

      // If template is selected, copy items from template
      if (blockData.templateId) {
        const templateItems = await this.getSurveyBlockItems(blockData.templateId);
        if (templateItems.length > 0) {
          const itemsToInsert = templateItems.map(item => ({
            block_id: blockData_result.id,
            item_id: item.itemId,
            item_name: item.itemName,
            data_type: item.dataType,
            max_length: item.maxLength,
            is_required: item.isRequired,
            validation_rules: item.validationRules,
            options: item.options,
            order_index: item.orderIndex
          }));

          await supabase
            .from('survey_block_items')
            .insert(itemsToInsert);
        }
      }

      // Add custom items if provided
      if (blockData.items && blockData.items.length > 0) {
        const itemsToInsert = blockData.items.map(item => ({
          block_id: blockData_result.id,
          item_id: item.itemId,
          item_name: item.itemName,
          data_type: item.dataType,
          max_length: item.maxLength,
          is_required: item.isRequired,
          validation_rules: item.validationRules,
          options: item.options,
          order_index: item.orderIndex
        }));

        await supabase
          .from('survey_block_items')
          .insert(itemsToInsert);
      }

      // Fetch the complete block with items
      const createdBlock = await this.getSurveyBlockById(blockData_result.id);
      if (!createdBlock) {
        throw new Error('Failed to retrieve created block');
      }

      return {
        data: createdBlock,
        message: 'Survey block created successfully'
      };
    } catch (error: any) {
      return { error: error.message || 'Failed to create survey block' };
    }
  }

  // Update survey block
  static async updateSurveyBlock(id: string, updates: Partial<SurveyBlock>): Promise<ApiResponse<SurveyBlock>> {
    try {
      const { data, error } = await supabase
        .from('survey_blocks')
        .update({
          name: updates.name,
          description: updates.description,
          order_index: updates.orderIndex,
          category: updates.category
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedBlock = await this.getSurveyBlockById(id);
      if (!updatedBlock) {
        throw new Error('Failed to retrieve updated block');
      }

      return {
        data: updatedBlock,
        message: 'Survey block updated successfully'
      };
    } catch (error: any) {
      return { error: error.message || 'Failed to update survey block' };
    }
  }

  // Delete survey block
  static async deleteSurveyBlock(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('survey_blocks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { message: 'Survey block deleted successfully' };
    } catch (error: any) {
      return { error: error.message || 'Failed to delete survey block' };
    }
  }

  // Get survey block items
  static async getSurveyBlockItems(blockId: string): Promise<SurveyBlockItem[]> {
    const { data, error } = await supabase
      .from('survey_block_items')
      .select('*')
      .eq('block_id', blockId)
      .order('order_index', { ascending: true });

    if (error) throw error;

    return data?.map(this.mapDatabaseToSurveyBlockItem) || [];
  }

  // Add item to survey block
  static async addSurveyBlockItem(blockId: string, itemData: Omit<SurveyBlockItem, 'id' | 'blockId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<SurveyBlockItem>> {
    try {
      // Check if item ID already exists in this block
      const { data: existing } = await supabase
        .from('survey_block_items')
        .select('id')
        .eq('block_id', blockId)
        .eq('item_id', itemData.itemId)
        .single();

      if (existing) {
        return { error: 'Item ID already exists in this block' };
      }

      const { data, error } = await supabase
        .from('survey_block_items')
        .insert({
          block_id: blockId,
          item_id: itemData.itemId,
          item_name: itemData.itemName,
          data_type: itemData.dataType,
          max_length: itemData.maxLength,
          is_required: itemData.isRequired,
          validation_rules: itemData.validationRules,
          options: itemData.options,
          order_index: itemData.orderIndex
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data: this.mapDatabaseToSurveyBlockItem(data),
        message: 'Survey block item added successfully'
      };
    } catch (error: any) {
      return { error: error.message || 'Failed to add survey block item' };
    }
  }

  // Update survey block item
  static async updateSurveyBlockItem(id: string, updates: Partial<SurveyBlockItem>): Promise<ApiResponse<SurveyBlockItem>> {
    try {
      const { data, error } = await supabase
        .from('survey_block_items')
        .update({
          item_name: updates.itemName,
          data_type: updates.dataType,
          max_length: updates.maxLength,
          is_required: updates.isRequired,
          validation_rules: updates.validationRules,
          options: updates.options,
          order_index: updates.orderIndex
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        data: this.mapDatabaseToSurveyBlockItem(data),
        message: 'Survey block item updated successfully'
      };
    } catch (error: any) {
      return { error: error.message || 'Failed to update survey block item' };
    }
  }

  // Delete survey block item
  static async deleteSurveyBlockItem(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('survey_block_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { message: 'Survey block item deleted successfully' };
    } catch (error: any) {
      return { error: error.message || 'Failed to delete survey block item' };
    }
  }

  // Reorder survey blocks
  static async reorderSurveyBlocks(scheduleId: string, blockOrders: { id: string; orderIndex: number }[]): Promise<ApiResponse<void>> {
    try {
      for (const blockOrder of blockOrders) {
        await supabase
          .from('survey_blocks')
          .update({ order_index: blockOrder.orderIndex })
          .eq('id', blockOrder.id);
      }

      return { message: 'Survey blocks reordered successfully' };
    } catch (error: any) {
      return { error: error.message || 'Failed to reorder survey blocks' };
    }
  }

  // Helper method to map database row to SurveyBlock type
  private static mapDatabaseToSurveyBlock(data: any): SurveyBlock {
    return {
      id: data.id,
      scheduleId: data.schedule_id,
      name: data.name,
      description: data.description,
      orderIndex: data.order_index,
      templateId: data.template_id,
      isTemplate: data.is_template,
      category: data.category,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      items: data.survey_block_items?.map(this.mapDatabaseToSurveyBlockItem) || []
    };
  }

  // Helper method to map database row to SurveyBlockItem type
  private static mapDatabaseToSurveyBlockItem(data: any): SurveyBlockItem {
    return {
      id: data.id,
      blockId: data.block_id,
      itemId: data.item_id,
      itemName: data.item_name,
      dataType: data.data_type,
      maxLength: data.max_length,
      isRequired: data.is_required,
      validationRules: data.validation_rules,
      options: Array.isArray(data.options) ? data.options : [],
      orderIndex: data.order_index,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}