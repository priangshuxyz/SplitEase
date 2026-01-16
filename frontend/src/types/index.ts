export interface User {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Group {
    _id: string;
    name: string;
    description?: string;
    members: User[]; // populated
    createdBy: User; // populated
    createdAt: string;
    updatedAt: string;
}

export interface Split {
    user: User; // populated
    amountOwed: number;
    percentage?: number;
}

export interface Expense {
    _id: string;
    description: string;
    amount: number;
    paidBy: User; // populated
    group?: Group; // populated if exists
    splits: Split[];
    date: string;
    category?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}