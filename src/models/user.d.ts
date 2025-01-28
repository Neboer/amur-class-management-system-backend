export interface Student {
    id?: number
    name: string
    phone_number: string
    password?: string
}

export interface Admin {
    id?: number
    username: string
    password?: string
}

export interface PasswordResetRecord {
    id?: number
    student_id: number
    token: string
    created_at?: Date
    used_at?: Date
}
