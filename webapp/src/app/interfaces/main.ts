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