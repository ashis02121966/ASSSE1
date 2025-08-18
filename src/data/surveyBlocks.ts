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
  readOnly?: boolean;
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

export interface SurveySchedule {
  id: string;
  name: string;
  blocks: SurveyBlock[];
  description?: string;
  sector?: string;
  year?: string;
  isActive: boolean;
}

// Survey blocks based on the ASSSE Schedules document
export const surveyBlocks: SurveyBlock[] = [
  {
    id: 'block-0',
    name: 'Block 0: Identification of the Enterprise (as on date of survey)',
    description: 'Enterprise identification details updated after Phase I',
    completed: false,
    fields: [
      { id: 'dsl_dispatch_serial', label: 'Dispatch Serial Number (DSL)', type: 'text', value: '', required: true },
      { id: 'enterprise_name_current', label: 'Name of the Enterprise', type: 'text', value: '', required: true },
      { id: 'enterprise_address_current', label: 'Address of the Enterprise', type: 'textarea', value: '', required: true },
      { id: 'village_town', label: 'Village/Town', type: 'text', value: '', required: true },
      { id: 'district_current', label: 'District', type: 'text', value: '', required: true },
      { id: 'state_current', label: 'State', type: 'text', value: '', required: true },
      { id: 'pin_code_current', label: 'PIN Code', type: 'text', value: '', required: true },
      { id: 'sro_nsro_code', label: 'SRO/NSRO Code', type: 'text', value: '', required: true },
      { id: 'contact_person_name', label: 'Contact Person Name', type: 'text', value: '', required: true },
      { id: 'contact_person_designation', label: 'Contact Person Designation', type: 'text', value: '', required: true },
      { id: 'contact_person_phone', label: 'Contact Person Landline (with STD code excluding leading zero)/Mobile no. (excluding country code)', type: 'text', value: '', required: true },
      { id: 'enterprise_phone', label: 'Enterprise Landline (with STD code excluding leading zero)/Mobile no. (excluding country code)', type: 'text', value: '', required: false },
      { id: 'contact_email', label: 'E-mail', type: 'text', value: '', required: false },
      { id: 'declaration_name', label: 'Name of Owner/Authorized Signatory', type: 'text', value: '', required: true },
      { id: 'declaration_signature', label: 'Signature of Owner/Authorized Signatory', type: 'text', value: '', required: false },
      { id: 'declaration_stamp', label: 'Stamp (if applicable)', type: 'text', value: '', required: false },
      { id: 'declaration_date', label: 'Declaration Date', type: 'date', value: '', required: true },
      { id: 'declaration_place', label: 'Declaration Place', type: 'text', value: '', required: true }
    ]
  },
  {
    id: 'block-1',
    name: 'Block 1: Identification of the Enterprise (during the accounting period)',
    description: 'Enterprise identification details during the accounting period',
    completed: false,
    fields: [
      { id: 'sector', label: 'Sector (Rural-1, Urban-2)', type: 'select', value: '', required: true },
      { id: 'status_enterprise', label: 'Status of enterprise during the accounting period', type: 'select', value: '', required: true }
    ]
  },
  {
    id: 'block-2',
    name: 'Block 2: Operational particulars of the enterprise (during the accounting period)',
    description: 'Details about the operational particulars of the enterprise during the accounting period',
    completed: false,
    fields: [
      { id: 'type_of_organization', label: '1. Type of organization (businesstype) (code)', type: 'select', value: '', required: true },
      { id: 'registered_under_act', label: '2. Whether registered under any act/authority (other than CGST Act)? (yes: with one authority (other than GSTN)-1, with more than one authority (other than GSTN)-2; no-3)', type: 'select', value: '', required: true },
      { id: 'registration_type_1', label: '3.i Type of registration of the enterprise - Data entry field 1', type: 'select', value: '', required: false },
      { id: 'registration_type_2', label: '3.ii Type of registration of the enterprise - Data entry field 2', type: 'select', value: '', required: false },
      { id: 'registration_type_3', label: '3.iii Type of registration of the enterprise - Data entry field 3', type: 'select', value: '', required: false },
      { id: 'llpin', label: '4. If entry in item 3(i) or 3(ii) or 3(iii) is \'2\', then LLPIN (7-digit code)', type: 'text', value: '', required: false },
      { id: 'cin', label: '5. If entry in item 3(i) or 3(ii) or 3(iii) is \'1\', then CIN', type: 'text', value: '', required: false },
      { id: 'gstin', label: '6. GSTIN: Autoentry', type: 'text', value: '', required: false },
      { id: 'major_activity_code', label: '7. Major activity during the accounting period (5-digit code as per NIC 2008)', type: 'text', value: '', required: true },
      { id: 'major_activity_description', label: '8. Description of the major activity', type: 'textarea', value: '', required: true },
      { id: 'minor_activity_code', label: '9. Principal minor activity, if any, during the accounting period (5-digit code as per NIC 2008) [1st 2 digits of item 7 should not be equal to the 1st 2 digits of item 9]', type: 'text', value: '', required: false },
      { id: 'additional_places_business', label: '10. No. of additional places of business in the state', type: 'number', value: '', required: true },
      { id: 'non_market_production', label: '11. Whether engaged mainly in non-market production of services? (yes-1, no-2)', type: 'select', value: '', required: true },
      { id: 'accounting_period', label: '12. Accounting period MM/YY to MM/YY', type: 'text', value: '', required: true },
      { id: 'months_operated', label: '13. Number of months operated during the accounting period', type: 'number', value: '', required: true },
      { id: 'supply_data_online', label: '14. Can the enterprise supply data online? (yes-1, no-2)', type: 'select', value: '', required: true },
      { id: 'separate_info_additional_places', label: '15. If entry in item 10 >1, can the enterprise provide information separately for each of the additional places of business? (Yes-1, no-2)', type: 'select', value: '', required: false },
      { id: 'udyam_registration_number', label: '16. If entry in item 3(i) or 3(ii) or 3(iii) is \'3\', then Udyam Registration Number', type: 'text', value: '', required: false }
    ]
  },
  {
    id: 'block-2-1',
    name: 'Block 2.1: Distribution of establishments (additional places of businesses) over the districts of a state (during the accounting period)',
    description: 'Details of additional places of business distributed across districts within the state',
    completed: false,
    isGrid: true,
    gridColumns: [
      { id: 'sl_no', label: 'Sl. No.', type: 'number', required: true },
      { id: 'district_name', label: 'Name of the district', type: 'text', required: true },
      { id: 'district_code', label: 'District code', type: 'text', required: true },
      { id: 'frame_count', label: 'Number of establishments - as per frame', type: 'number', required: true },
      { id: 'actual_count', label: 'Number of establishments - actual', type: 'number', required: true }
    ],
    gridData: [
      { sl_no: 1, district_name: '', district_code: '', frame_count: '', actual_count: '' }
    ],
    fields: [
      // Grid blocks use gridData instead of individual fields
    ]
  },
  {
    id: 'block-2-2',
    name: 'Block 2.2: Verification of activity details of the enterprise (to be seen from Phase-I) (during the accounting period)',
    description: 'Verification of activity details from Phase-I and their actual pursuit during the accounting period',
    completed: false,
    isGrid: true,
    gridColumns: [
      { id: 'sl_no', label: 'Sl. No.', type: 'number', required: true },
      { id: 'phase1_nic_code', label: 'Activity as per Phase-I NIC-2008 3-digit code', type: 'text', required: true },
      { id: 'phase1_description', label: 'Activity as per Phase-I description', type: 'text', required: true },
      { id: 'activity_pursued', label: 'Is the activity given in col. 2 and col.3 actually pursued by the enterprise during the accounting period? (yes – \'1\'/no- \'2\'/ new activity – \'3\')', type: 'select', required: true },
      { id: 'corresponding_nic', label: 'If \'Yes\' or \'new activity\' in col. 4, then provide the corresponding NIC 3-digit', type: 'text', required: false },
      { id: 'share_percentage', label: '% share of the NIC 3-digit (col. 5) to the total gross sale value (round figure)', type: 'number', required: false }
    ],
    gridData: [
      { sl_no: 1, phase1_nic_code: '', phase1_description: '', activity_pursued: '', corresponding_nic: '', share_percentage: '' }
    ],
    fields: []
  },
  {
    id: 'block-3', 
    name: 'Block 3: Land and fixed assets owned and hired (long term lease) as on the last date of the accounting period (Rs. in whole number)',
    description: 'Data for this block will be available from the Balance Sheet. Land and fixed assets owned and hired on long term lease basis.',
    completed: false,
    isGrid: true,
    gridColumns: [
      { id: 'sl_no', label: 'Sl. No.', type: 'number', required: true },
      { id: 'asset_type', label: 'Type of Asset', type: 'text', required: true },
      { id: 'gross_opening', label: 'Gross Value (Rs.) Opening as on <Date>', type: 'number', required: true },
      { id: 'gross_revaluation', label: 'Gross Value (Rs.) Due to Revaluation', type: 'number', required: true },
      { id: 'gross_additions', label: 'Gross Value (Rs.) Actual Additions', type: 'number', required: true },
      { id: 'gross_deductions', label: 'Gross Value (Rs.) Deduction and Adjustment During the Year', type: 'number', required: true },
      { id: 'gross_closing', label: 'Gross Value (Rs.) Closing as on <Date>', type: 'number', required: true },
      { id: 'depreciation_beginning', label: 'Depreciation/Amortization (Rs.) Upto Year Beginning', type: 'number', required: true },
      { id: 'depreciation_provided', label: 'Depreciation/Amortization (Rs.) Provided During the Year', type: 'number', required: true },
      { id: 'depreciation_adjustment', label: 'Depreciation/Amortization (Rs.) Adjustment for Sold/Discarded During the Year', type: 'number', required: true },
      { id: 'depreciation_end', label: 'Depreciation/Amortization (Rs.) Upto Year End', type: 'number', required: true },
      { id: 'net_opening', label: 'Net Value (Rs.) Opening as on <Date>', type: 'number', required: true },
      { id: 'net_closing', label: 'Net Value (Rs.) Closing as on <Date>', type: 'number', required: true }
    ],
    gridData: [
      { sl_no: 1, asset_type: 'Land (including land improvement)', gross_opening: '', gross_revaluation: '', gross_additions: '', gross_deductions: '', gross_closing: '', depreciation_beginning: '', depreciation_provided: '', depreciation_adjustment: '', depreciation_end: '', net_opening: '', net_closing: '' },
      { sl_no: 2, asset_type: 'Building', gross_opening: '', gross_revaluation: '', gross_additions: '', gross_deductions: '', gross_closing: '', depreciation_beginning: '', depreciation_provided: '', depreciation_adjustment: '', depreciation_end: '', net_opening: '', net_closing: '' },
      { sl_no: 3, asset_type: 'Plant and machinery', gross_opening: '', gross_revaluation: '', gross_additions: '', gross_deductions: '', gross_closing: '', depreciation_beginning: '', depreciation_provided: '', depreciation_adjustment: '', depreciation_end: '', net_opening: '', net_closing: '' },
      { sl_no: 4, asset_type: 'Transport equipment', gross_opening: '', gross_revaluation: '', gross_additions: '', gross_deductions: '', gross_closing: '', depreciation_beginning: '', depreciation_provided: '', depreciation_adjustment: '', depreciation_end: '', net_opening: '', net_closing: '' },
      { sl_no: 5, asset_type: 'Furniture and fixtures', gross_opening: '', gross_revaluation: '', gross_additions: '', gross_deductions: '', gross_closing: '', depreciation_beginning: '', depreciation_provided: '', depreciation_adjustment: '', depreciation_end: '', net_opening: '', net_closing: '' },
      { sl_no: 6, asset_type: 'Software and database', gross_opening: '', gross_revaluation: '', gross_additions: '', gross_deductions: '', gross_closing: '', depreciation_beginning: '', depreciation_provided: '', depreciation_adjustment: '', depreciation_end: '', net_opening: '', net_closing: '' },
      { sl_no: 7, asset_type: 'Information, computer and telecommunications equipment', gross_opening: '', gross_revaluation: '', gross_additions: '', gross_deductions: '', gross_closing: '', depreciation_beginning: '', depreciation_provided: '', depreciation_adjustment: '', depreciation_end: '', net_opening: '', net_closing: '' },
      { sl_no: 8, asset_type: 'Tools and other fixed assets', gross_opening: '', gross_revaluation: '', gross_additions: '', gross_deductions: '', gross_closing: '', depreciation_beginning: '', depreciation_provided: '', depreciation_adjustment: '', depreciation_end: '', net_opening: '', net_closing: '' },
      { sl_no: 9, asset_type: 'R&D and other intellectual property products', gross_opening: '', gross_revaluation: '', gross_additions: '', gross_deductions: '', gross_closing: '', depreciation_beginning: '', depreciation_provided: '', depreciation_adjustment: '', depreciation_end: '', net_opening: '', net_closing: '' },
      { sl_no: 10, asset_type: 'Capital work in progress', gross_opening: '', gross_revaluation: '', gross_additions: '', gross_deductions: '', gross_closing: '', depreciation_beginning: '', depreciation_provided: '', depreciation_adjustment: '', depreciation_end: '', net_opening: '', net_closing: '' },
      { sl_no: 11, asset_type: 'Total (items 1 to 10)', gross_opening: '', gross_revaluation: '', gross_additions: '', gross_deductions: '', gross_closing: '', depreciation_beginning: '', depreciation_provided: '', depreciation_adjustment: '', depreciation_end: '', net_opening: '', net_closing: '' },
      { sl_no: 12, asset_type: 'Non-produced intangible assets', gross_opening: '', gross_revaluation: '', gross_additions: '', gross_deductions: '', gross_closing: '', depreciation_beginning: '', depreciation_provided: '', depreciation_adjustment: '', depreciation_end: '', net_opening: '', net_closing: '' }
    ],
    fields: []
  },
  {
    id: 'block-4',
    name: 'Block 4: Working capital and loans',
    description: 'Details of working capital components and outstanding loans',
    completed: false,
    isGrid: true,
    gridColumns: [
      { id: 'sl_no', label: 'Sl. No.', type: 'number', required: true },
      { id: 'items', label: 'Items', type: 'text', required: true },
      { id: 'closing', label: 'Closing (Rs.)', type: 'number', required: true },
      { id: 'opening', label: 'Opening (Rs.)', type: 'number', required: true }
    ],
    gridData: [
      { sl_no: 1, items: 'Materials, supplies and stores', closing: '', opening: '' },
      { sl_no: 2, items: 'Others', closing: '', opening: '' },
      { sl_no: 3, items: 'Sub-total (item 1 and 2)', closing: '', opening: '' },
      { sl_no: 4, items: 'Semi-finished goods/work in progress', closing: '', opening: '' },
      { sl_no: 5, items: 'Stock of trading goods (trading activities)', closing: '', opening: '' },
      { sl_no: 6, items: 'Total inventory (items 3 to 5)', closing: '', opening: '' },
      { sl_no: 7, items: 'Cash-in-hand & at bank', closing: '', opening: '' },
      { sl_no: 8, items: 'Sundry debtors', closing: '', opening: '' },
      { sl_no: 9, items: 'Other current assets', closing: '', opening: '' },
      { sl_no: 10, items: 'Total current assets (items 6 to 9)', closing: '', opening: '' },
      { sl_no: 11, items: 'Sundry creditors', closing: '', opening: '' },
      { sl_no: 12, items: 'Over draft, cash credit, other short-term loan from banks & other financial institutions', closing: '', opening: '' },
      { sl_no: 13, items: 'Other current liabilities', closing: '', opening: '' },
      { sl_no: 14, items: 'Total current liabilities (items 11 to 13)', closing: '', opening: '' },
      { sl_no: 15, items: 'Working capital (item 10 - item 14) *', closing: '', opening: '' },
      { sl_no: 16, items: 'Outstanding loans (excluding interest) **', closing: '', opening: '' }
    ],
    fields: []
  },
  {
    id: 'block-5',
    name: 'Block 5: Employment and labour cost during the accounting period',
    description: 'Details of employment and labour cost during the accounting period',
    completed: false,
    isGrid: true,
    gridColumns: [
      { id: 'sl_no', label: 'Sl. No.', type: 'number', required: true },
      { id: 'category_of_staff', label: 'Category of staff', type: 'text', required: true },
      { id: 'avg_days_worked', label: 'Average no. of days worked', type: 'number', required: false },
      { id: 'total_persons_worked', label: 'Total number of persons worked', type: 'number', required: false },
      { id: 'total_wages_salaries', label: 'Total wages/salaries (in Rs.) during the accounting period', type: 'number', required: false }
    ],
    gridData: [
      { sl_no: 1, category_of_staff: '1. persons directly associated with the production of services: male', avg_days_worked: '', total_persons_worked: '', total_wages_salaries: '' },
      { sl_no: 2, category_of_staff: '2. persons directly associated with the production of services: female', avg_days_worked: '', total_persons_worked: '', total_wages_salaries: '' },
      { sl_no: 3, category_of_staff: '3. supervisory & managerial staff: male', avg_days_worked: '', total_persons_worked: '', total_wages_salaries: '' },
      { sl_no: 4, category_of_staff: '4. supervisory & managerial staff: female', avg_days_worked: '', total_persons_worked: '', total_wages_salaries: '' },
      { sl_no: 5, category_of_staff: '5. others: male', avg_days_worked: '', total_persons_worked: '', total_wages_salaries: '' },
      { sl_no: 6, category_of_staff: '6. others: female', avg_days_worked: '', total_persons_worked: '', total_wages_salaries: '' },
      { sl_no: 7, category_of_staff: '7. employed through contractors (on the payroll): male', avg_days_worked: '', total_persons_worked: '', total_wages_salaries: '' },
      { sl_no: 8, category_of_staff: '8. employed through contractors (on the payroll): female', avg_days_worked: '', total_persons_worked: '', total_wages_salaries: '' },
      { sl_no: 9, category_of_staff: '9. employed through contractors (on the payroll): all (item 7 + item 8)', avg_days_worked: '', total_persons_worked: '', total_wages_salaries: '' },
      { sl_no: 10, category_of_staff: '10. total persons engaged (1 to 6 and 9)', avg_days_worked: '', total_persons_worked: '', total_wages_salaries: '' },
      { sl_no: 11, category_of_staff: '11. persons employed through contractors (not on the payroll)', avg_days_worked: '', total_persons_worked: '', total_wages_salaries: '' },
      { sl_no: 12, category_of_staff: '12. persons working voluntarily (without remuneration)', avg_days_worked: '', total_persons_worked: '', total_wages_salaries: '' },
      { sl_no: 13, category_of_staff: '13. Bonus', avg_days_worked: '', total_persons_worked: '', total_wages_salaries: '' },
      { sl_no: 14, category_of_staff: '14. contribution to Provident fund and other funds (in Rs.)', avg_days_worked: '', total_persons_worked: '', total_wages_salaries: '' },
      { sl_no: 15, category_of_staff: '15. staff welfare expenses (in Rs.)', avg_days_worked: '', total_persons_worked: '', total_wages_salaries: '' },
      { sl_no: 16, category_of_staff: '16. compensation to employees: total of column 5 of item 10 + item 13 + item 14 + item 15', avg_days_worked: '', total_persons_worked: '', total_wages_salaries: '' }
    ],
    fields: [
      { id: 'working_days_enterprise', label: 'Number of working days of the enterprise during the accounting period (in whole number of days)', type: 'number', value: '', required: true }
    ]
  },
  {
    id: 'block-6a',
    name: 'Block 6A: Purchase of goods for trading during the accounting period',
    description: 'Details of goods purchased for trading purposes during the accounting period',
    completed: false,
    isGrid: true,
    gridColumns: [
      { id: 'sl_no', label: 'Sl. No.', type: 'number', required: true },
      { id: 'item_description', label: 'Item Description (goods purchased for trading)', type: 'text', required: true },
      { id: 'item_code', label: 'Item Code (CPC 2.0)', type: 'text', required: true },
      { id: 'expenditure', label: 'Expenditure (in Rs.)', type: 'number', required: true },
      { id: 'imported', label: 'Imported (yes-1, no-2)', type: 'select', required: true },
      { id: 'import_percentage', label: 'If yes in column 5, then percentage of import', type: 'number', required: false }
    ],
    gridData: [
      { sl_no: 1, item_description: '', item_code: '', expenditure: '', imported: '', import_percentage: '' },
      { sl_no: 2, item_description: '', item_code: '', expenditure: '', imported: '', import_percentage: '' },
      { sl_no: 3, item_description: '', item_code: '', expenditure: '', imported: '', import_percentage: '' },
      { sl_no: 4, item_description: '', item_code: '', expenditure: '', imported: '', import_percentage: '' },
      { sl_no: 5, item_description: '', item_code: '', expenditure: '', imported: '', import_percentage: '' },
      { sl_no: 6, item_description: '', item_code: '', expenditure: '', imported: '', import_percentage: '' },
      { sl_no: 7, item_description: 'other trading items', item_code: '60001', expenditure: '', imported: '', import_percentage: '' },
      { sl_no: 8, item_description: 'total purchase value of goods traded (items 1 to 7)', item_code: '60009', expenditure: '', imported: '', import_percentage: '' }
    ],
    fields: []
  },
  {
    id: 'block-6b',
    name: 'Block 6B: Expenses (on goods and services) used for production of services during the accounting period (other than trading)',
    description: 'Details of expenses on goods and services used for production of services during the accounting period (other than trading)',
    completed: false,
    isGrid: true,
    gridColumns: [
      { id: 'sl_no', label: 'Sl. No.', type: 'number', required: true },
      { id: 'item_description', label: 'Item Description (main items of input (both goods and services))', type: 'text', required: true },
      { id: 'item_code', label: 'Item Code (CPC 2.0)', type: 'text', required: true },
      { id: 'expenditure', label: 'Expenditure (in Rs.)', type: 'number', required: true },
      { id: 'imported', label: 'Imported (yes-1, no-2)', type: 'select', required: true },
      { id: 'import_percentage', label: 'If yes in column 5, then percentage of import', type: 'number', required: false }
    ],
    gridData: [
      { sl_no: 1, item_description: '', item_code: '', expenditure: '', imported: '', import_percentage: '' },
      { sl_no: 2, item_description: '', item_code: '', expenditure: '', imported: '', import_percentage: '' },
      { sl_no: 3, item_description: '', item_code: '', expenditure: '', imported: '', import_percentage: '' },
      { sl_no: 4, item_description: '', item_code: '', expenditure: '', imported: '', import_percentage: '' },
      { sl_no: 5, item_description: '', item_code: '', expenditure: '', imported: '', import_percentage: '' },
      { sl_no: 6, item_description: '', item_code: '', expenditure: '', imported: '', import_percentage: '' },
      { sl_no: 7, item_description: '', item_code: '', expenditure: '', imported: '', import_percentage: '' },
      { sl_no: 8, item_description: '', item_code: '', expenditure: '', imported: '', import_percentage: '' },
      { sl_no: 9, item_description: '', item_code: '', expenditure: '', imported: '', import_percentage: '' },
      { sl_no: 10, item_description: 'others', item_code: '70001', expenditure: '', imported: '', import_percentage: '' },
      { sl_no: 11, item_description: 'total of input items (items 1 to 10)', item_code: '70009', expenditure: '', imported: '', import_percentage: '' }
    ],
    fields: []
  },
  {
    id: 'block-6c',
    name: 'Block 6C: Other expenses for trading/production of services during the accounting period',
    description: 'Details of other expenses for trading/production of services during the accounting period',
    completed: false,
    isGrid: true,
    gridColumns: [
      { id: 'sl_no', label: 'Sl. No.', type: 'number', required: true },
      { id: 'item_description', label: 'Item Description', type: 'text', required: true },
      { id: 'item_code', label: 'Item Code (CPC 2.0)', type: 'text', required: true },
      { id: 'expenditure', label: 'Expenditure (in Rs.)', type: 'number', required: true }
    ],
    gridData: [
      { sl_no: 1, item_description: 'electricity charges', item_code: '70011', expenditure: '' },
      { sl_no: 2, item_description: 'fuel and lubricant', item_code: '70012', expenditure: '' },
      { sl_no: 3, item_description: 'Consumables', item_code: '70013', expenditure: '' },
      { sl_no: 4, item_description: 'service charges for work done by other concerns', item_code: '70014', expenditure: '' },
      { sl_no: 5, item_description: 'value of raw materials consumed for own construction', item_code: '70015', expenditure: '' },
      { sl_no: 6, item_description: 'transport expenses', item_code: '70016', expenditure: '' },
      { sl_no: 7, item_description: 'other expenses', item_code: '70017', expenditure: '' },
      { sl_no: 8, item_description: 'minor repair and maintenance of building and other construction', item_code: '70018', expenditure: '' },
      { sl_no: 9, item_description: 'minor repair and maintenance of other fixed assets', item_code: '70019', expenditure: '' },
      { sl_no: 10, item_description: 'rental paid for fixed assets including building (other than land)', item_code: '70020', expenditure: '' },
      { sl_no: 11, item_description: 'total expenses (other than trading) [(item 1 + item 2 + …… + item 10) plus (sl. no. 11, col 4 of Bl. 6B)]', item_code: '70029', expenditure: '' },
      { sl_no: 12, item_description: 'rent/royalties paid for land on lease and natural resources', item_code: '70031', expenditure: '' },
      { sl_no: 13, item_description: 'interest paid', item_code: '70032', expenditure: '' },
      { sl_no: 14, item_description: 'insurance premium paid', item_code: '70033', expenditure: '' }
    ],
    fields: []
  },
  {
    id: 'block-7a',
    name: 'Block 7A: Receipt from trading during the accounting period',
    description: 'Details of receipts from sale of traded goods during the accounting period',
    completed: false,
    isGrid: true,
    gridColumns: [
      { id: 'sl_no', label: 'Sl. No.', type: 'number', required: true },
      { id: 'item_description', label: 'Item Description (receipts from sale of traded goods)', type: 'text', required: true },
      { id: 'item_code', label: 'Item Code (CPC 2.0)', type: 'text', required: true },
      { id: 'receipt', label: 'Receipt (in Rs.)', type: 'number', required: true },
      { id: 'exported', label: 'Exported (yes-1, no-2)', type: 'select', required: true },
      { id: 'export_percentage', label: 'If yes in col. 5, then percentage of export', type: 'number', required: false }
    ],
    gridData: [
      { sl_no: 1, item_description: '', item_code: '', receipt: '', exported: '', export_percentage: '' },
      { sl_no: 2, item_description: '', item_code: '', receipt: '', exported: '', export_percentage: '' },
      { sl_no: 3, item_description: '', item_code: '', receipt: '', exported: '', export_percentage: '' },
      { sl_no: 4, item_description: '', item_code: '', receipt: '', exported: '', export_percentage: '' },
      { sl_no: 5, item_description: '', item_code: '', receipt: '', exported: '', export_percentage: '' },
      { sl_no: 6, item_description: '', item_code: '', receipt: '', exported: '', export_percentage: '' },
      { sl_no: 7, item_description: 'other trading items', item_code: '80001', receipt: '', exported: '', export_percentage: '' },
      { sl_no: 8, item_description: 'total receipt of goods traded (items 1 to 7)', item_code: '80009', receipt: '', exported: '', export_percentage: '' },
      { sl_no: 9, item_description: 'Percentage of receipts through online, if any', item_code: '80011', receipt: '', exported: '', export_percentage: '' }
    ],
    fields: []
  },
  {
    id: 'block-7b',
    name: 'Block 7B: Receipts from production of services during the accounting period (other than trading)',
    description: 'Details of receipts from production of services during the accounting period (other than trading)',
    completed: false,
    isGrid: true,
    gridColumns: [
      { id: 'sl_no', label: 'Sl. No.', type: 'number', required: true },
      { id: 'service_description', label: 'Service Description (receipts from services produced)', type: 'text', required: true },
      { id: 'item_code', label: 'Item Code (CPC 2.0)', type: 'text', required: true },
      { id: 'receipt', label: 'Receipt (in Rs.)', type: 'number', required: true }
    ],
    gridData: [
      { sl_no: 1, service_description: '', item_code: '', receipt: '' },
      { sl_no: 2, service_description: '', item_code: '', receipt: '' },
      { sl_no: 3, service_description: '', item_code: '', receipt: '' },
      { sl_no: 4, service_description: '', item_code: '', receipt: '' },
      { sl_no: 5, service_description: '', item_code: '', receipt: '' },
      { sl_no: 6, service_description: '', item_code: '', receipt: '' },
      { sl_no: 7, service_description: '', item_code: '', receipt: '' },
      { sl_no: 8, service_description: '', item_code: '', receipt: '' },
      { sl_no: 9, service_description: '', item_code: '', receipt: '' },
      { sl_no: 10, service_description: 'Others', item_code: '90001', receipt: '' },
      { sl_no: 11, service_description: 'total receipts from services (items 1 to 10)', item_code: '90009', receipt: '' },
      { sl_no: 12, service_description: 'total receipts from foreigners by providing domestic services', item_code: '90011', receipt: '' },
      { sl_no: 13, service_description: 'total receipts from services delivered abroad through the internet', item_code: '90012', receipt: '' },
      { sl_no: 14, service_description: 'total receipts by placing personnel in foreign country', item_code: '90013', receipt: '' },
      { sl_no: 15, service_description: 'Percentage of receipts through online, if any', item_code: '90014', receipt: '' }
    ],
    fields: []
  },
  {
    id: 'block-7c',
    name: 'Block 7C: Other receipts from production of services during the accounting period',
    description: 'Details of other receipts from production of services during the accounting period',
    completed: false,
    isGrid: true,
    gridColumns: [
      { id: 'sl_no', label: 'Sl. No.', type: 'number', required: true },
      { id: 'item_description', label: 'Item Description', type: 'text', required: true },
      { id: 'item_code', label: 'Item Code (CPC 2.0)', type: 'text', required: true },
      { id: 'receipt', label: 'Receipt (in Rs.)', type: 'number', required: true }
    ],
    gridData: [
      { sl_no: 1, item_description: 'change-in-stock of semi-finished goods (item 4 of Bl.4 (col. 3-col. 4))', item_code: '90021', receipt: '' },
      { sl_no: 2, item_description: 'change-in-stock of finished goods/stock-in-trade (item 5 of Bl.4 (col. 3-col. 4))', item_code: '90022', receipt: '' },
      { sl_no: 3, item_description: 'value of own construction', item_code: '90023', receipt: '' },
      { sl_no: 4, item_description: 'other receipts', item_code: '90024', receipt: '' },
      { sl_no: 5, item_description: 'rental/royalty received for produced assets', item_code: '90025', receipt: '' },
      { sl_no: 6, item_description: 'total receipts other than trading [(item 1 + item 3 +item 4 + item 5) plus (sl. no. 11, col 4 of Bl. 7B)]', item_code: '90029', receipt: '' },
      { sl_no: 7, item_description: 'rent/royalty received for non-produced assets', item_code: '90031', receipt: '' },
      { sl_no: 8, item_description: 'interest received', item_code: '90032', receipt: '' }
    ],
    fields: []
  },
  {
    id: 'block-8',
    name: 'Block 8: Taxes, subsidies and distributive expenses during the accounting period',
    description: 'Details of taxes, subsidies and distributive expenses during the accounting period',
    completed: false,
    isGrid: true,
    gridColumns: [
      { id: 'sl_no', label: 'Sl. No.', type: 'number', required: true },
      { id: 'item_description', label: 'Item Description', type: 'text', required: true },
      { id: 'item_code', label: 'Item Code (CPC 2.0)', type: 'text', required: true },
      { id: 'receipt', label: 'Receipt (in Rs.)', type: 'number', required: true }
    ],
    gridData: [
      { sl_no: 1, item_description: 'taxes on products/services, where receipts in Block 7A and 7B include these taxes (such as GST, excise duty, etc.)', item_code: '90041', receipt: '' },
      { sl_no: 2, item_description: 'amount paid as taxes on production (license fee, registration, etc.)', item_code: '90042', receipt: '' },
      { sl_no: 3, item_description: 'amount received as subsidies on product/services', item_code: '90043', receipt: '' },
      { sl_no: 4, item_description: 'amount received as other production subsidies', item_code: '90044', receipt: '' },
      { sl_no: 5, item_description: 'total distributive expenses', item_code: '90045', receipt: '' },
      { sl_no: 6, item_description: 'input tax credit received/receivable for purchase of input', item_code: '90046', receipt: '' }
    ],
    fields: []
  },
  {
    id: 'block-9',
    name: 'Block 9: Summary block (aggregates) [FOR INTERNAL USE]',
    description: 'Summary of key financial and operational metrics with year-over-year comparison',
    completed: false,
    isGrid: true,
    gridColumns: [
      { id: 'sl_no', label: 'Sl. No.', type: 'number', required: true },
      { id: 'items', label: 'Items', type: 'text', required: true },
      { id: 'current_period', label: 'Current Accounting Period (Rs.)', type: 'number', required: true },
      { id: 'last_period', label: 'Last Accounting Period (Rs.)', type: 'number', required: false },
      { id: 'percentage_change', label: 'Percentage Change (%)', type: 'number', required: false },
      { id: 'remarks', label: 'Remarks', type: 'text', required: false }
    ],
    gridData: [
      { sl_no: 1, items: 'fixed capital (Rs.) (sl. no. 11, col. 13, block 3)', current_period: '', last_period: '', percentage_change: '', remarks: '' },
      { sl_no: 2, items: 'working capital (Rs.) (sl. no. 15, col. 3, block 4)', current_period: '', last_period: '', percentage_change: '', remarks: '' },
      { sl_no: 3, items: 'total persons engaged (sl. no. 10, col. 4, block 5)', current_period: '', last_period: '', percentage_change: '', remarks: '' },
      { sl_no: 4, items: 'compensation to employees (Rs.) (sl. no. 16, col. 5, block 5)', current_period: '', last_period: '', percentage_change: '', remarks: '' },
      { sl_no: 5, items: 'total input (Rs.) (sl. no. 11, col.4 of block 6C)', current_period: '', last_period: '', percentage_change: '', remarks: '' },
      { sl_no: 6, items: 'total receipts (Rs.) (sl. no. 6, col.4 of block 7C)', current_period: '', last_period: '', percentage_change: '', remarks: '' },
      { sl_no: 7, items: 'taxes less subsidies (Rs.) (on product/services) (sl. no. 1, col.4 of block 8 minus sl. no. 3, col.4 of block 8 minus sl. no. 6, col.4 of block 8)', current_period: '', last_period: '', percentage_change: '', remarks: '' },
      { sl_no: 8, items: 'total output (Rs.) [(sl. no. 6 + (sl. no. 8, col.4 of block 7A minus sl. no. 8, col.4 of block 6A plus (sl. no. 2, col.4 of block 7C) minus (sl. no. 7) minus sl. no. 5, col.4 of block 8]', current_period: '', last_period: '', percentage_change: '', remarks: '' },
      { sl_no: 9, items: 'gross value added (Rs.) (sl. no. 8 minus sl. no. 5)', current_period: '', last_period: '', percentage_change: '', remarks: '' },
      { sl_no: 10, items: 'depreciation (Rs.) (sl. no. 11, col. 9, block 3)', current_period: '', last_period: '', percentage_change: '', remarks: '' },
      { sl_no: 11, items: 'net value added (Rs.) (sl. no. 9 minus sl. no. 10)', current_period: '', last_period: '', percentage_change: '', remarks: '' },
      { sl_no: 12, items: 'net rent paid (Rs.) (sl. no. 12, col. 4 of block 6C minus sl. no. 7, col. 4 of block 7C)', current_period: '', last_period: '', percentage_change: '', remarks: '' },
      { sl_no: 13, items: 'net interest paid (Rs.) (sl. no. 13, col. 4 of block 6C minus sl. no. 8, col. 4 of block 7C)', current_period: '', last_period: '', percentage_change: '', remarks: '' },
      { sl_no: 14, items: 'net income (Rs.) (sl. no. 11 minus sl. no. 12, col. 4 of block 6C minus sl. no. 13, col. 4 of block 6C)', current_period: '', last_period: '', percentage_change: '', remarks: '' }
    ],
    fields: []
  }
  ,
  {
    id: 'block-10',
    name: 'Block 10: Summary block (ratios) [FOR INTERNAL USE]',
    description: 'Summary of key financial and operational ratios for internal analysis',
    completed: false,
    isGrid: true,
    gridColumns: [
      { id: 'sl_no', label: 'Sl. No.', type: 'number', required: true },
      { id: 'items', label: 'Items', type: 'text', required: true },
      { id: 'current_period', label: 'Current Accounting Period', type: 'number', required: true },
      { id: 'last_period', label: 'Last Accounting Period', type: 'number', required: false },
      { id: 'remarks', label: 'Remarks', type: 'text', required: false }
    ],
    gridData: [
      { sl_no: 1, items: 'working capital to total output (item 2, block 9/ item 8, block 9)', current_period: '', last_period: '', remarks: '' },
      { sl_no: 2, items: 'total output to total input (item 8, block 9/ item 5, block 9)', current_period: '', last_period: '', remarks: '' },
      { sl_no: 3, items: 'wage/salary per person directly associated with the production of service (Rs.) (col. 5, item 1+2, block 5/ col. 4, item 1+2, block 5)', current_period: '', last_period: '', remarks: '' },
      { sl_no: 4, items: 'wage/salary per supervisor (Rs.) (col. 5, item 3+4, block 5/ col. 4, item 3+4, block 5)', current_period: '', last_period: '', remarks: '' }
    ],
    fields: []
  }
  ,
  {
    id: 'block-11',
    name: 'Block 11: Particulars of use of Information and Communication technology (ICT) by the enterprise (during the accounting period)',
    description: 'Details of ICT usage by the enterprise during the accounting period',
    completed: false,
    isGrid: true,
    gridColumns: [
      { id: 'sl_no', label: 'Sl. No.', type: 'number', required: true },
      { id: 'main_items', label: 'Main Items', type: 'text', required: true },
      { id: 'item_code', label: 'Item Code', type: 'text', required: true },
      { id: 'yes_no', label: 'Yes-1, No-2', type: 'select', required: true }
    ],
    gridData: [
      { sl_no: 1, main_items: 'did the enterprise had a web presence?', item_code: '90051', yes_no: '' },
      { sl_no: 2, main_items: 'did the enterprise had an intranet?', item_code: '90052', yes_no: '' },
      { sl_no: 3, main_items: 'sending and receiving e-mail', item_code: '90053', yes_no: '' },
      { sl_no: 4, main_items: 'telephoning over the Internet/VoIP, including video conferencing', item_code: '90054', yes_no: '' },
      { sl_no: 5, main_items: 'getting information about goods and services and/or for online purchase', item_code: '90055', yes_no: '' },
      { sl_no: 6, main_items: 'interacting /getting information with general government organizations', item_code: '90057', yes_no: '' },
      { sl_no: 7, main_items: 'accessing financial services', item_code: '90058', yes_no: '' },
      { sl_no: 8, main_items: 'receiving order online and/or delivering services online', item_code: '90059', yes_no: '' },
      { sl_no: 9, main_items: 'internal or external recruitment', item_code: '90061', yes_no: '' },
      { sl_no: 10, main_items: 'staff training', item_code: '90062', yes_no: '' }
    ],
    fields: []
  }
  ,
  {
    id: 'block-13',
    name: 'Block 13: Remarks by Survey Supervisor (SS) / Senior Statistical Officer (SSO)',
    description: 'Remarks section accessible only to Survey Supervisors and Senior Statistical Officers',
    completed: false,
    fields: [
      { 
        id: 'supervisor_remarks', 
        label: 'Remarks by Survey Supervisor (SS) / Senior Statistical Officer (SSO)', 
        type: 'textarea', 
        value: '', 
        required: false,
        validation: 'supervisor_only'
      }
    ]
  }
  ,
  {
    id: 'block-12',
    name: 'Block 12: Particulars of field operations',
    description: 'Field operations details including survey supervisor and inspecting authority information',
    completed: false,
    isGrid: true,
    gridColumns: [
      { id: 'sl_no', label: 'Sl. No.', type: 'number', required: true },
      { id: 'items', label: 'Items', type: 'text', required: true },
      { id: 'survey_supervisor', label: 'Survey Supervisor (SS) / Senior Statistical Officer (SSO)', type: 'text', required: false },
      { id: 'inspecting_authority', label: 'Inspecting / higher Authority', type: 'text', required: false }
    ],
    gridData: [
      { sl_no: 1, items: '(i) Name (block letters)', survey_supervisor: 'AUTO_POPULATE_USER_NAME', inspecting_authority: 'AUTO_POPULATE_INSPECTOR_NAME' },
      { sl_no: '', items: '(ii) Code', survey_supervisor: 'AUTO_POPULATE_USER_ID', inspecting_authority: 'AUTO_POPULATE_INSPECTOR_ID' },
      { sl_no: 2, items: 'Date of Survey/inspection', survey_supervisor: 'AUTO_POPULATE_SURVEY_DATE', inspecting_authority: 'AUTO_POPULATE_INSPECTION_DATE' },
      { sl_no: 3, items: 'Date of Receipt', survey_supervisor: 'NO_ENTRY', inspecting_authority: 'AUTO_POPULATE_RECEIPT_DATE' },
      { sl_no: 4, items: 'Date of Scrutiny', survey_supervisor: 'NO_ENTRY', inspecting_authority: 'AUTO_POPULATE_SCRUTINY_DATE' },
      { sl_no: 5, items: 'Date of Dispatch', survey_supervisor: 'AUTO_POPULATE_DISPATCH_DATE', inspecting_authority: 'AUTO_POPULATE_INSPECTOR_DISPATCH_DATE' },
      { sl_no: 6, items: 'Number of investigators (FI/JSO) in the team', survey_supervisor: 'USER_ENTRY', inspecting_authority: 'NO_ENTRY' },
      { sl_no: 7, items: 'Signature', survey_supervisor: 'NO_ENTRY', inspecting_authority: 'NO_ENTRY' }
    ],
    fields: []
  }
  ,
  {
    id: 'block-14',
    name: 'Block 14: Comments by inspecting / higher authority',
    description: 'Comments section for inspecting officers and higher authorities',
    completed: false,
    fields: [
      { 
        id: 'inspector_comments', 
        label: 'Comments by inspecting / higher authority', 
        type: 'textarea', 
        value: '', 
        required: false,
        validation: 'ds_user_only'
      }
    ]
  }
];

export const surveySchedules: SurveySchedule[] = [
  {
    id: '1',
    name: 'Annual Survey of Service Sector Enterprises 2023-24',
    description: 'Annual survey for collecting data on the service sector enterprises for the year 2023-24',
    sector: 'Services',
    year: '2023-24',
    isActive: true,
    blocks: surveyBlocks
  },
  {
    id: '2',
    name: 'Annual Survey of Service Sector Enterprises 2022-23',
    description: 'Annual survey for collecting data on the service sector enterprises for the year 2022-23',
    sector: 'Services',
    year: '2022-23',
    isActive: false,
    blocks: surveyBlocks
  }
];