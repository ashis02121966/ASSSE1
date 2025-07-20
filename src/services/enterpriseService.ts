import { supabase } from '../lib/supabase';
import { Enterprise, ApiResponse, PaginatedResponse } from '../types';

export class EnterpriseService {
  // Get all enterprises with pagination and filtering
  static async getEnterprises(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sector?: string;
    status?: string;
  }): Promise<PaginatedResponse<Enterprise>> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('enterprises')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (params?.search) {
      query = query.or(`name.ilike.%${params.search}%,gstn.ilike.%${params.search}%,contact_person.ilike.%${params.search}%`);
    }

    if (params?.sector) {
      query = query.eq('sector', params.sector);
    }

    if (params?.status) {
      query = query.eq('status', params.status);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    const enterprises = data?.map(this.mapDatabaseToEnterprise) || [];
    const totalPages = Math.ceil((count || 0) / limit);

    return {
      data: enterprises,
      total: count || 0,
      page,
      limit,
      totalPages
    };
  }

  // Get enterprise by ID
  static async getEnterpriseById(id: string): Promise<Enterprise | null> {
    const { data, error } = await supabase
      .from('enterprises')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;

    return this.mapDatabaseToEnterprise(data);
  }

  // Get enterprise by GSTN
  static async getEnterpriseByGSTN(gstn: string): Promise<Enterprise | null> {
    const { data, error } = await supabase
      .from('enterprises')
      .select('*')
      .eq('gstn', gstn)
      .single();

    if (error) return null;

    return this.mapDatabaseToEnterprise(data);
  }

  // Create new enterprise
  static async createEnterprise(enterpriseData: Omit<Enterprise, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Enterprise>> {
    try {
      // Check if GSTN already exists
      if (enterpriseData.gstn) {
        const existing = await this.getEnterpriseByGSTN(enterpriseData.gstn);
        if (existing) {
          return { error: 'Enterprise with this GSTN already exists' };
        }
      }

      const { data, error } = await supabase
        .from('enterprises')
        .insert({
          name: enterpriseData.name,
          gstn: enterpriseData.gstn,
          address: enterpriseData.address,
          contact_person: enterpriseData.contactPerson,
          contact_phone: enterpriseData.contactPhone,
          contact_email: enterpriseData.contactEmail,
          sector: enterpriseData.sector,
          district: enterpriseData.district,
          state: enterpriseData.state,
          pin_code: enterpriseData.pinCode,
          status: enterpriseData.status
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data: this.mapDatabaseToEnterprise(data),
        message: 'Enterprise created successfully'
      };
    } catch (error: any) {
      return { error: error.message || 'Failed to create enterprise' };
    }
  }

  // Update enterprise
  static async updateEnterprise(id: string, updates: Partial<Enterprise>): Promise<ApiResponse<Enterprise>> {
    try {
      // Check if GSTN already exists for other enterprises
      if (updates.gstn) {
        const existing = await this.getEnterpriseByGSTN(updates.gstn);
        if (existing && existing.id !== id) {
          return { error: 'Another enterprise with this GSTN already exists' };
        }
      }

      const { data, error } = await supabase
        .from('enterprises')
        .update({
          name: updates.name,
          gstn: updates.gstn,
          address: updates.address,
          contact_person: updates.contactPerson,
          contact_phone: updates.contactPhone,
          contact_email: updates.contactEmail,
          sector: updates.sector,
          district: updates.district,
          state: updates.state,
          pin_code: updates.pinCode,
          status: updates.status
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        data: this.mapDatabaseToEnterprise(data),
        message: 'Enterprise updated successfully'
      };
    } catch (error: any) {
      return { error: error.message || 'Failed to update enterprise' };
    }
  }

  // Delete enterprise
  static async deleteEnterprise(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('enterprises')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { message: 'Enterprise deleted successfully' };
    } catch (error: any) {
      return { error: error.message || 'Failed to delete enterprise' };
    }
  }

  // Get enterprises by sector
  static async getEnterprisesBySector(sector: string): Promise<Enterprise[]> {
    const { data, error } = await supabase
      .from('enterprises')
      .select('*')
      .eq('sector', sector)
      .order('name');

    if (error) throw error;

    return data?.map(this.mapDatabaseToEnterprise) || [];
  }

  // Get enterprise statistics
  static async getEnterpriseStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    bySector: { [key: string]: number };
  }> {
    const { data, error } = await supabase
      .from('enterprises')
      .select('status, sector');

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      active: 0,
      inactive: 0,
      suspended: 0,
      bySector: {} as { [key: string]: number }
    };

    data?.forEach(enterprise => {
      // Count by status
      if (enterprise.status === 'active') stats.active++;
      else if (enterprise.status === 'inactive') stats.inactive++;
      else if (enterprise.status === 'suspended') stats.suspended++;

      // Count by sector
      if (enterprise.sector) {
        stats.bySector[enterprise.sector] = (stats.bySector[enterprise.sector] || 0) + 1;
      }
    });

    return stats;
  }

  // Bulk import enterprises
  static async bulkImportEnterprises(enterprises: Omit<Enterprise, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<ApiResponse<{ imported: number; errors: string[] }>> {
    try {
      const errors: string[] = [];
      let imported = 0;

      for (const enterprise of enterprises) {
        const result = await this.createEnterprise(enterprise);
        if (result.error) {
          errors.push(`${enterprise.name}: ${result.error}`);
        } else {
          imported++;
        }
      }

      return {
        data: { imported, errors },
        message: `Imported ${imported} enterprises with ${errors.length} errors`
      };
    } catch (error: any) {
      return { error: error.message || 'Failed to import enterprises' };
    }
  }

  // Helper method to map database row to Enterprise type
  private static mapDatabaseToEnterprise(data: any): Enterprise {
    return {
      id: data.id,
      name: data.name,
      gstn: data.gstn,
      address: data.address,
      contactPerson: data.contact_person,
      contactPhone: data.contact_phone,
      contactEmail: data.contact_email,
      sector: data.sector,
      district: data.district,
      state: data.state,
      pinCode: data.pin_code,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}