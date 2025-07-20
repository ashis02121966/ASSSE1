import { supabase } from '../lib/supabase';
import { Frame } from '../types';

export class FrameService {
  // Get all frames
  static async getFrames(): Promise<Frame[]> {
    const { data, error } = await supabase
      .from('frames')
      .select(`
        *,
        uploaded_by_user:users!frames_uploaded_by_fkey(name),
        frame_allocations(
          user_id,
          allocated_user:users!frame_allocations_user_id_fkey(name)
        )
      `)
      .order('upload_date', { ascending: false });

    if (error) throw error;

    return data.map(frame => ({
      id: frame.id,
      fileName: frame.file_name,
      dslNumber: frame.dsl_number,
      sector: frame.sector,
      enterprises: frame.enterprises_count,
      status: frame.status as 'pending' | 'allocated' | 'completed',
      uploadDate: frame.upload_date.split('T')[0],
      allocatedTo: frame.frame_allocations.map((allocation: any) => allocation.user_id)
    }));
  }

  // Get frame by ID
  static async getFrameById(id: string): Promise<Frame | null> {
    const { data, error } = await supabase
      .from('frames')
      .select(`
        *,
        uploaded_by_user:users!frames_uploaded_by_fkey(name),
        frame_allocations(
          user_id,
          allocated_user:users!frame_allocations_user_id_fkey(name)
        )
      `)
      .eq('id', id)
      .single();

    if (error) return null;

    return {
      id: data.id,
      fileName: data.file_name,
      dslNumber: data.dsl_number,
      sector: data.sector,
      enterprises: data.enterprises_count,
      status: data.status as 'pending' | 'allocated' | 'completed',
      uploadDate: data.upload_date.split('T')[0],
      allocatedTo: data.frame_allocations.map((allocation: any) => allocation.user_id)
    };
  }

  // Create new frame
  static async createFrame(frameData: {
    fileName: string;
    dslNumber?: string;
    sector: string;
    enterprises: number;
    uploadedBy?: string;
  }): Promise<Frame> {
    const { data, error } = await supabase
      .from('frames')
      .insert({
        file_name: frameData.fileName,
        dsl_number: frameData.dslNumber,
        sector: frameData.sector,
        enterprises_count: frameData.enterprises,
        uploaded_by: frameData.uploadedBy,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      fileName: data.file_name,
      dslNumber: data.dsl_number,
      sector: data.sector,
      enterprises: data.enterprises_count,
      status: data.status as 'pending' | 'allocated' | 'completed',
      uploadDate: data.upload_date.split('T')[0],
      allocatedTo: []
    };
  }

  // Update frame
  static async updateFrame(id: string, updates: Partial<Frame>): Promise<Frame> {
    const { data, error } = await supabase
      .from('frames')
      .update({
        file_name: updates.fileName,
        dsl_number: updates.dslNumber,
        sector: updates.sector,
        enterprises_count: updates.enterprises,
        status: updates.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    const frame = await this.getFrameById(id);
    if (!frame) throw new Error('Frame not found after update');
    
    return frame;
  }

  // Delete frame
  static async deleteFrame(id: string): Promise<void> {
    const { error } = await supabase
      .from('frames')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Allocate frame to user
  static async allocateFrame(frameId: string, userId: string, allocatedBy: string): Promise<void> {
    const { error } = await supabase
      .from('frame_allocations')
      .insert({
        frame_id: frameId,
        user_id: userId,
        allocated_by: allocatedBy
      });

    if (error) throw error;

    // Update frame status to allocated
    await supabase
      .from('frames')
      .update({ status: 'allocated' })
      .eq('id', frameId);
  }

  // Remove frame allocation
  static async removeAllocation(frameId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('frame_allocations')
      .delete()
      .eq('frame_id', frameId)
      .eq('user_id', userId);

    if (error) throw error;

    // Check if frame has any remaining allocations
    const { data: allocations } = await supabase
      .from('frame_allocations')
      .select('id')
      .eq('frame_id', frameId);

    // If no allocations remain, set status back to pending
    if (!allocations || allocations.length === 0) {
      await supabase
        .from('frames')
        .update({ status: 'pending' })
        .eq('id', frameId);
    }
  }
}