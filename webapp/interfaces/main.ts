export interface UserInterface {
    uid: string;
    email: string | null;
    displayName: string | null;
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

export interface StandardChatInterface {
    id: string;
    name: string;
    updatedAt: Date;
    topic: string;
}

export interface StandardChatMessageInterface {
    id: string;
    text: string;
    userId: string;
    userType: 'user' | 'model';
    createdAt: Date;
}

export interface AnalysisChatInterface {
    id: string;
    name: string;
    updatedAt: Date;
    topic: string;
}

export interface AnalysisChatMessageInterface {
    id: string;
    userId: string;
    userType: 'user' | 'model';
    createdAt: Date;

    text: string;
    name: string | null;
    description: string | null;
}