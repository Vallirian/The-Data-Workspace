export interface UserInterface {
    uid: string;
    email: string | null;
    displayName: string | null;
}

export interface UserInfoInterface {
    inputTokenLimit: number;
    outputTokenLimit: number;
    inputTokenUtilization: number;
    outputTokenUtilization: number;
    tokenLimitExceeded: boolean;
    dataLimitMB: number;
    dataUtilizationMB: number;
}

export interface WorkbookInterface {
    id: string;
    createdAt: Date;
    dataTable: string;
}

export interface DataTableMetaInterface {
    id: string;
    name: string;
    description: string;
    dataSourceAdded: boolean;
    dataSource: 'csv' | null;
    extractionStatus: 'pending' | 'success' | 'error';
    extractionDetails: string;
    columns: DataTableColumnMetaInterface [];
}

export interface DataTableColumnMetaInterface {
    id: string;
    name: string;
    dtype: 'string' | 'integer' | 'float' | 'date';
    format: string;
    description: string;
}

export interface AnalysisChatInterface {
    id: string;
    name: string;
    updatedAt: Date;
    topic: string;
}

export interface AnalysisChatMessageInterface {
    id: string;
    formula: string;
    userId: string;
    userType: 'user' | 'model';
    createdAt: Date;

    text: string;
    name: string | null;
    description: string | null;

    messageType: 'text' | 'kpi' | 'table';
}

export interface FormulaInterface {
    id: string;
    name: string;
    description: string;
    validatedSQL: string;
    isActive: boolean;
    isValidated: boolean;
    createdAt: Date;
}

export interface ReportInterface {
    id: string;
    rows: string[][];
}