import { SurveyBlockService, SurveyBlock, SurveyBlockItem } from '../services/surveyBlockService';
import { ApiResponse, PaginatedResponse } from '../types';

export class SurveyBlockApi {
  // GET /api/survey-blocks
  static async getSurveyBlocks(params?: {
    page?: number;
    limit?: number;
    scheduleId?: string;
    isTemplate?: boolean;
    category?: string;
  }): Promise<PaginatedResponse<SurveyBlock>> {
    return await SurveyBlockService.getSurveyBlocks(params);
  }

  // GET /api/survey-blocks/:id
  static async getSurveyBlock(id: string): Promise<ApiResponse<SurveyBlock>> {
    try {
      const block = await SurveyBlockService.getSurveyBlockById(id);
      if (!block) {
        return { error: 'Survey block not found' };
      }
      return { data: block };
    } catch (error: any) {
      return { error: error.message || 'Failed to fetch survey block' };
    }
  }

  // GET /api/survey-blocks/templates
  static async getTemplateBlocks(): Promise<ApiResponse<SurveyBlock[]>> {
    try {
      const templates = await SurveyBlockService.getTemplateBlocks();
      return { data: templates };
    } catch (error: any) {
      return { error: error.message || 'Failed to fetch template blocks' };
    }
  }

  // POST /api/survey-blocks
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
    return await SurveyBlockService.createSurveyBlock(blockData);
  }

  // PUT /api/survey-blocks/:id
  static async updateSurveyBlock(id: string, updates: Partial<SurveyBlock>): Promise<ApiResponse<SurveyBlock>> {
    return await SurveyBlockService.updateSurveyBlock(id, updates);
  }

  // DELETE /api/survey-blocks/:id
  static async deleteSurveyBlock(id: string): Promise<ApiResponse<void>> {
    return await SurveyBlockService.deleteSurveyBlock(id);
  }

  // GET /api/survey-blocks/:blockId/items
  static async getSurveyBlockItems(blockId: string): Promise<ApiResponse<SurveyBlockItem[]>> {
    try {
      const items = await SurveyBlockService.getSurveyBlockItems(blockId);
      return { data: items };
    } catch (error: any) {
      return { error: error.message || 'Failed to fetch survey block items' };
    }
  }

  // POST /api/survey-blocks/:blockId/items
  static async addSurveyBlockItem(
    blockId: string, 
    itemData: Omit<SurveyBlockItem, 'id' | 'blockId' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<SurveyBlockItem>> {
    return await SurveyBlockService.addSurveyBlockItem(blockId, itemData);
  }

  // PUT /api/survey-blocks/items/:id
  static async updateSurveyBlockItem(id: string, updates: Partial<SurveyBlockItem>): Promise<ApiResponse<SurveyBlockItem>> {
    return await SurveyBlockService.updateSurveyBlockItem(id, updates);
  }

  // DELETE /api/survey-blocks/items/:id
  static async deleteSurveyBlockItem(id: string): Promise<ApiResponse<void>> {
    return await SurveyBlockService.deleteSurveyBlockItem(id);
  }

  // POST /api/survey-blocks/reorder
  static async reorderSurveyBlocks(
    scheduleId: string, 
    blockOrders: { id: string; orderIndex: number }[]
  ): Promise<ApiResponse<void>> {
    return await SurveyBlockService.reorderSurveyBlocks(scheduleId, blockOrders);
  }

  // POST /api/survey-blocks/:id/duplicate
  static async duplicateSurveyBlock(id: string, newName: string): Promise<ApiResponse<SurveyBlock>> {
    try {
      const originalBlock = await SurveyBlockService.getSurveyBlockById(id);
      if (!originalBlock) {
        return { error: 'Survey block not found' };
      }

      const duplicatedBlock = {
        scheduleId: originalBlock.scheduleId,
        name: newName,
        description: `Copy of ${originalBlock.description}`,
        orderIndex: originalBlock.orderIndex + 1,
        templateId: originalBlock.templateId,
        isTemplate: false,
        category: originalBlock.category,
        items: originalBlock.items?.map(item => ({
          itemId: item.itemId,
          itemName: item.itemName,
          dataType: item.dataType,
          maxLength: item.maxLength,
          isRequired: item.isRequired,
          validationRules: item.validationRules,
          options: item.options,
          orderIndex: item.orderIndex
        }))
      };

      return await SurveyBlockService.createSurveyBlock(duplicatedBlock);
    } catch (error: any) {
      return { error: error.message || 'Failed to duplicate survey block' };
    }
  }
}