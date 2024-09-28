export interface UserInterface {
    uid: string;
    email: string | null;
    displayName: string | null;
}

export interface NotificationInterface {
    message: string;
    type: 'success' | 'error' | 'info';
    dismissed: boolean;
    remainingTime: number;
    intervalId?: any; // used internally
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
    dataSource: 'CSV' | null;
    extractionStatus: 'pending' | 'success' | 'error';
    extractionDetails: string;
    columns: DataTableColumnMetaInterface [];
}

export interface DataTableColumnMetaInterface {
    id: string;
    name: string;
    dtype: 'string' | 'number' | 'boolean' | 'date';
    description: string;
}