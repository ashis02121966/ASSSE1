import { User, MenuItem, Frame, UserRole } from '../types';
import { surveyBlocks } from './surveyBlocks';

export const userRoles: UserRole[] = [
  { id: 'ensd-admin', name: 'EnSD Admin', code: 'ENSD_ADMIN', permissions: ['*'], level: 1, isAdmin: true, isScrutinizer: false },
  { id: 'cpg-user', name: 'CPG User', code: 'CPG_USER', permissions: ['frame.allocate', 'dashboard.view', 'user.create'], level: 2, isAdmin: true, isScrutinizer: false },
  { id: 'ensd-ad-dd', name: 'EnSD AD/DD User', code: 'ENSD_AD_DD', permissions: ['dashboard.view', 'reports.view'], level: 3, isAdmin: true, isScrutinizer: false },
  { id: 'ds-user', name: 'DS User / CSO Scrutinizer', code: 'DS_USER', permissions: ['scrutiny.manage', 'data.download', 'scrutiny.level2'], level: 4, isAdmin: false, isScrutinizer: true },
  { id: 'zo-user', name: 'ZO User', code: 'ZO_USER', permissions: ['dashboard.view', 'reports.view', 'scrutiny.level1'], level: 5, isAdmin: false, isScrutinizer: true },
  { id: 'ro-user', name: 'RO User', code: 'RO_USER', permissions: ['frame.allocate', 'notice.generate', 'scrutiny.level1'], level: 6, isAdmin: false, isScrutinizer: true },
  { id: 'sso-user', name: 'SSO User', code: 'SSO_USER', permissions: ['survey.compile', 'survey.scrutinize', 'scrutiny.level1'], level: 7, isAdmin: false, isScrutinizer: true },
  { id: 'jso-user', name: 'JSO User (Compiler)', code: 'JSO_USER', permissions: ['survey.compile', 'survey.fill'], level: 8, isAdmin: false, isScrutinizer: false },
  { id: 'scrutinizer', name: 'Scrutinizer', code: 'SCRUTINIZER', permissions: ['survey.scrutinize', 'scrutiny.level1'], level: 8, isAdmin: false, isScrutinizer: true },
  { id: 'enterprise', name: 'Enterprise User', code: 'ENTERPRISE', permissions: ['survey.fill'], level: 9, isAdmin: false, isScrutinizer: false },
  { id: 'compiler', name: 'Compiler', code: 'COMPILER', permissions: ['survey.compile', 'survey.fill'], level: 9, isAdmin: false, isScrutinizer: false }
];

export const officeTypes: OfficeType[] = [
  { id: 'cso', name: 'CSO', code: 'CSO', description: 'Central Statistical Office' },
  { id: 'fod-hq', name: 'FOD HQ', code: 'FOD_HQ', description: 'Field Operations Division Headquarters' },
  { id: 'zo', name: 'ZO', code: 'ZO', description: 'Zonal Office' },
  { id: 'state-ro', name: 'State RO', code: 'STATE_RO', description: 'State Regional Office' },
  { id: 'ro', name: 'RO', code: 'RO', description: 'Regional Office' },
  { id: 'sro', name: 'SRO', code: 'SRO', description: 'Sub-Regional Office' }
];

export const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    path: '/dashboard',
    icon: 'BarChart3',
    roles: ['*'],
    badge: 0
  },
  {
    id: 'master-data',
    title: 'Master Data Management',
    path: '/master-data',
    icon: 'Database',
    roles: ['ENSD_ADMIN', 'CPG_USER'],
    children: [
      { id: 'survey-config', title: 'Survey Configuration', path: '/master-data/survey-config', icon: 'Settings', roles: ['ENSD_ADMIN'] },
      { id: 'user-management', title: 'User Management', path: '/master-data/user-management', icon: 'Users', roles: ['ENSD_ADMIN'] },
      { id: 'role-management', title: 'Role Management', path: '/master-data/role-management', icon: 'Shield', roles: ['ENSD_ADMIN'] },
      { id: 'menu-access', title: 'Role Wise Menu Access', path: '/master-data/menu-access', icon: 'Menu', roles: ['ENSD_ADMIN'] },
      { id: 'nic-master', title: 'NIC Master', path: '/master-data/nic-master', icon: 'Building', roles: ['ENSD_ADMIN', 'CPG_USER'] },
      { id: 'npc-master', title: 'NPC Master', path: '/master-data/npc-master', icon: 'Package', roles: ['ENSD_ADMIN', 'CPG_USER'] },
      { id: 'approval-workflow', title: 'Approval Workflow Configuration', path: '/master-data/approval-workflow', icon: 'GitBranch', roles: ['ENSD_ADMIN'] },
      { id: 'team-management', title: 'Team Management', path: '/master-data/team-management', icon: 'UsersRound', roles: ['ENSD_ADMIN'] },
      { id: 'office-type', title: 'Office Type', path: '/master-data/office-type', icon: 'Building2', roles: ['ENSD_ADMIN'] },
      { id: 'location-master', title: 'Office Location', path: '/master-data/location-master', icon: 'MapPin', roles: ['ENSD_ADMIN'] },
      { id: 'rate-master', title: 'Rate Master', path: '/master-data/rate-master', icon: 'DollarSign', roles: ['ENSD_ADMIN'] },
      { id: 'high-profile', title: 'High Profile Unit', path: '/master-data/high-profile', icon: 'Star', roles: ['ENSD_ADMIN'] },
      { id: 'howler-unit', title: 'Howler Unit', path: '/master-data/howler-unit', icon: 'AlertTriangle', roles: ['ENSD_ADMIN'] },
      { id: 'notice-template', title: 'Notice Template', path: '/master-data/notice-template', icon: 'FileText', roles: ['ENSD_ADMIN'] }
    ]
  },
  {
    id: 'frame-upload',
    title: 'Frame Upload',
    path: '/frame-upload',
    icon: 'Upload',
    roles: ['ENSD_ADMIN', 'CPG_USER']
  },
  {
    id: 'frame-allocation',
    title: 'Frame Allocation',
    path: '/frame-allocation',
    icon: 'UserCheck',
    roles: ['CPG_USER', 'RO_USER']
  },
  {
    id: 'generate-notice',
    title: 'Generate Notice',
    path: '/generate-notice',
    icon: 'FileOutput',
    roles: ['RO_USER']
  },
  {
    id: 'survey-management',
    title: 'Survey Management',
    path: '/survey-management',
    icon: 'ClipboardList',
    roles: ['SSO_USER', 'ENTERPRISE']
  },
  {
    id: 'scrutiny-management',
    title: 'Scrutiny Management',
    path: '/scrutiny-management',
    icon: 'Search',
    roles: ['SSO_USER', 'DS_USER']
  },
  {
    id: 'data-download',
    title: 'Data Download (DDDB)',
    path: '/data-download',
    icon: 'Download',
    roles: ['DS_USER', 'ENSD_ADMIN']
  },
  {
    id: 'reports',
    title: 'Reports',
    path: '/reports',
    icon: 'FileBarChart',
    roles: ['*']
  },
  {
    id: 'settings',
    title: 'Settings',
    path: '/settings',
    icon: 'Settings',
    roles: ['ENSD_ADMIN']
  }
];

// Mock users with different roles and credentials
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@ensd.gov.in',
    roles: [{ id: 'ensd-admin', name: 'EnSD Admin', code: 'ENSD_ADMIN', permissions: ['*'] }],
    permissions: ['*'],
    profileImage: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
  },
  {
    id: '2',
    name: 'CPG User',
    email: 'cpg@ensd.gov.in',
    roles: [{ id: 'cpg-user', name: 'CPG User', code: 'CPG_USER', permissions: ['frame.allocate', 'dashboard.view'] }],
    permissions: ['frame.allocate', 'dashboard.view'],
    profileImage: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
  },
  {
    id: '3',
    name: 'DS User',
    email: 'ds@ensd.gov.in',
    roles: [{ id: 'ds-user', name: 'DS User / CSO Scrutinizer', code: 'DS_USER', permissions: ['scrutiny.manage', 'data.download'] }],
    permissions: ['scrutiny.manage', 'data.download'],
    profileImage: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
  },
  {
    id: '4',
    name: 'RO User',
    email: 'ro@ensd.gov.in',
    roles: [{ id: 'ro-user', name: 'RO User', code: 'RO_USER', permissions: ['frame.allocate', 'notice.generate'] }],
    permissions: ['frame.allocate', 'notice.generate'],
    profileImage: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
  },
  {
    id: '5',
    name: 'SSO User',
    email: 'sso@ensd.gov.in',
    roles: [{ id: 'sso-user', name: 'SSO User', code: 'SSO_USER', permissions: ['survey.compile', 'survey.scrutinize'] }],
    permissions: ['survey.compile', 'survey.scrutinize'],
    profileImage: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
  },
  {
    id: '6',
    name: 'Enterprise User',
    email: 'enterprise@company.com',
    roles: [{ id: 'enterprise', name: 'Enterprise User', code: 'ENTERPRISE', permissions: ['survey.fill'] }],
    permissions: ['survey.fill'],
    profileImage: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
  }
];

// Login credentials for testing
export const loginCredentials = [
  { email: 'admin@ensd.gov.in', password: 'admin123', role: 'EnSD Admin' },
  { email: 'cpg@ensd.gov.in', password: 'cpg123', role: 'CPG User' },
  { email: 'ds@ensd.gov.in', password: 'ds123', role: 'DS User / CSO Scrutinizer' },
  { email: 'ro@ensd.gov.in', password: 'ro123', role: 'RO User' },
  { email: 'sso@ensd.gov.in', password: 'sso123', role: 'SSO User' },
  { email: 'enterprise@company.com', password: 'enterprise123', role: 'Enterprise User' }
];

export const mockFrames: Frame[] = [
  {
    id: '1',
    fileName: 'ASI_Frame_2023_Manufacturing.xlsx',
    uploadDate: '2024-01-15',
    status: 'allocated',
    allocatedTo: ['compiler-1', 'scrutinizer-1'],
    enterprises: 1250,
    sector: 'Manufacturing',
    dslNumber: 'DSL001'
  },
  {
    id: '2',
    fileName: 'ASI_Frame_2023_Services.xlsx',
    uploadDate: '2024-01-16',
    status: 'pending',
    allocatedTo: [],
    enterprises: 890,
    sector: 'Services',
    dslNumber: 'DSL002'
  },
  {
    id: '3',
    fileName: 'ASI_Frame_2023_Construction.xlsx',
    uploadDate: '2024-01-17',
    status: 'completed',
    allocatedTo: ['compiler-2', 'scrutinizer-2'],
    enterprises: 670,
    sector: 'Construction',
    dslNumber: 'DSL003'
  }
];

export const rolePermissions = [
  {
    id: '1',
    roleId: 'ensd-admin',
    menuId: 'dashboard',
    canView: true,
    canCreate: true,
    canEdit: true,
    canDelete: true
  },
  {
    id: '2',
    roleId: 'ensd-admin',
    menuId: 'master-data',
    canView: true,
    canCreate: true,
    canEdit: true,
    canDelete: true
  },
  {
    id: '3',
    roleId: 'cpg-user',
    menuId: 'dashboard',
    canView: true,
    canCreate: false,
    canEdit: false,
    canDelete: false
  },
  {
    id: '4',
    roleId: 'cpg-user',
    menuId: 'frame-upload',
    canView: true,
    canCreate: true,
    canEdit: true,
    canDelete: true
  },
  {
    id: '5',
    roleId: 'ro-user',
    menuId: 'generate-notice',
    canView: true,
    canCreate: true,
    canEdit: true,
    canDelete: false
  },
  {
    id: '6',
    roleId: 'sso-user',
    menuId: 'survey-management',
    canView: true,
    canCreate: true,
    canEdit: true,
    canDelete: false
  },
  {
    id: '7',
    roleId: 'sso-user',
    menuId: 'scrutiny-management',
    canView: true,
    canCreate: true,
    canEdit: true,
    canDelete: false
  }
];