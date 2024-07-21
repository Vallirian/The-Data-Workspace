export interface UserRegisterInteface {
    email: string;
    username: string;
    password: string;
    tenantDisplayName: string;
}

export interface UserLoginInteface {
    email: string;
    password: string;
}

export interface UserInterface {
    id: string;
    username: string;
}

export interface NotificationInterface {
    message: string;
    type: 'success' | 'error' | 'info';
    dismissed: boolean;
    remainingTime: number;
    intervalId?: any; // Make it optional as it will be used internally
}

// Workspace
export interface WorkspaceListInterface {
    id: string;
    displayName: string;
}

// Table
export interface TableListInterface {
    id: string;
    displayName: string;
    description: string;
}

// Column
export interface ColumnInterface {
    id: string;
    displayName: string;
    description: string;
    dataType: 'string' | 'number' | 'datetime' | 'boolean';
    
}