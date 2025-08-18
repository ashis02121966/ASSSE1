export interface User {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  permissions: string[];
  profileImage?: string;
  signatureImage?: string;
}

export interface UserRole {
  id: string;
  name: string;
  code: string;
  permissions: string[];
  level: number; // Hierarchy level (1 = highest, 8 = lowest)
  isAdmin: boolean;
  isScrutinizer: boolean;
}

export interface OfficeType {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface ApprovalWorkflow {
  id: string;
  name: string;
  description?: string;
  steps: ApprovalStep[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalStep {
  id: string;
  stepNumber: number;
  name: string;
  roleCode: string;
  officeType?: string;
  isRequired: boolean;
  canReject: boolean;
  canReferBack: boolean;
  nextStepOnApproval?: string;
  nextStepOnReject?: string;
}

export interface MenuItem {
  id: string;
  title: string;
  path: string;
  icon: string;
  roles: string[];
  children?: MenuItem[];
  badge?: number;
}

export interface Frame {
  id: string;
  fileName: string;
  uploadDate: string;
  status: 'pending' | 'allocated' | 'completed';
  allocatedTo: string[];
  enterprises: number;
  sector: string;
  dslNumber?: string;
}

export interface Notice {
  id: string;
  frameId: string;
  enterpriseName: string;
  enterpriseAddress: string;
  generatedDate: string;
  signatory: string;
  status: 'generated' | 'sent' | 'received';
}

export interface Survey {
  id: string;
  frameId: string;
  enterpriseId: string;
  blocks: SurveyBlock[];
  status: 'draft' | 'submitted' | 'scrutiny' | 'approved' | 'rejected';
  lastModified: string;
  compiler?: string;
  scrutinizer?: string;
}

export interface SurveyBlock {
  id: string;
  name: string;
  description?: string;
  fields: SurveyField[];
  completed: boolean;
  isGrid?: boolean;
  gridColumns?: GridColumn[];
  gridData?: GridRow[];
}

export interface GridColumn {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  required: boolean;
}

export interface GridRow {
  [key: string]: any;
}

export interface SurveyField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea';
  value: any;
  required: boolean;
  validation?: string;
  category?: string;
  partA?: boolean;
  partB?: boolean;
  calculated?: boolean;
}

export interface SurveySchedule {
  id: string;
  name: string;
  blocks: SurveyBlock[];
  description?: string;
  sector?: string;
  year?: string;
  isActive: boolean;
}

export interface ScrutinyComment {
  id: string;
  blockId: string;
  fieldId: string;
  comment: string;
  scrutinizer: string;
  timestamp: string;
  resolved: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  read: boolean;
  userId: string;
}

export interface RolePermission {
  id: string;
  roleId: string;
  menuId: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
export interface Enterprise {
  id: string;
  name: string;
  gstn?: string;
  address?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  sector?: string;
  district?: string;
  state?: string;
  pinCode?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface SurveyTemplate {
  id: string;
  name: string;
  description?: string;
  version: string;
  isActive: boolean;
  templateData: any;
  createdAt: string;
  updatedAt: string;
}

export interface EnterpriseSurvey {
  id: string;
  enterpriseId: string;
  surveyId: string;
  templateId?: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
  assignedTo?: string;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  enterprise?: Enterprise;
  survey?: Survey;
  template?: SurveyTemplate;
  assignedUser?: User;
}

export interface AuditLog {
  id: string;
  tableName: string;
  recordId: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  oldValues?: any;
  newValues?: any;
  userId?: string;
  createdAt: string;
  user?: User;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}