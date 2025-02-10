export interface Exam {
    id?: number
    name: string
    date: string // Date in the format "YYYY-MM-DD"
}

export interface ExamSubjectWithoutExamID {
    id?: number
    subject: string
    full_score: number
}

export interface ExamSubject extends ExamSubjectWithoutExamID {
    exam_id: number
}
