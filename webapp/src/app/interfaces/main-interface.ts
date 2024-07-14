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
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
    dismissed: boolean;
    remainingTime: number;
    intervalId?: any; // Make it optional as it will be used internally
}