import BasicDBModule from "./BasicDBModule";
import {Exam, ExamSubject, ExamSubjectWithoutExamID} from "models/exam";
import {bulk_insert_query} from "../helper/bulk_insert";

export default class ExamModule extends BasicDBModule {
    public async create_exam(exam: Exam, subjects: Array<ExamSubjectWithoutExamID>): Promise<void> {
        await this.client_transaction(async client => {
            const exam_sql = `INSERT INTO exam (name, date)
                              VALUES ($1, $2)
                              RETURNING id`
            const exam_params = [exam.name, exam.date]
            const exam_id = (await client.query(exam_sql, exam_params)).rows[0].id
            await bulk_insert_query(client, `INSERT INTO exam_subject (exam_id, subject, full_score)
                                             VALUES ($1, $2, $3)`,
                subjects.map(subject => [exam_id, subject.subject, subject.full_score]))
        })
    }

    public async get_exam_by_id(id: number): Promise<Exam | null> {
        const sql = `SELECT id, name, date
                     FROM exam
                     WHERE id = $1`
        const params = [id]
        return await this.query_one<Exam>(sql, params)
    }

    public async get_all_exams(): Promise<Array<Exam>> {
        const sql = `SELECT id, name, date
                     FROM exam`
        return await this.query<Exam>(sql)
    }

    public async update_exam(exam: Exam): Promise<void> {
        const sql = `UPDATE exam
                     SET name = $1,
                         date = $2
                     WHERE id = $3`
        const params = [exam.name, exam.date, exam.id]
        await this.query(sql, params)
    }

    public async delete_exam(id: number): Promise<void> {
        const sql = `DELETE
                     FROM exam
                     WHERE id = $1`
        const params = [id]
        await this.query(sql, params)
    }

    public async get_subjects_of_exam(exam_id: number): Promise<Array<ExamSubject>> {
        const sql = `SELECT *
                     FROM exam_subject
                     WHERE exam_id = $1`
        const params = [exam_id]
        return await this.query<ExamSubject>(sql, params)
    }

    public async delete_subject_of_exam_by_name(exam_id: number, subject_name: string): Promise<void> {
        const sql = `DELETE
                     FROM exam_subject
                     WHERE exam_id = $1
                       AND subject = $2`
        const params = [exam_id, subject_name]
        await this.query(sql, params)
    }

    public async add_subjects_to_exam(exam_id: number, subjects: ExamSubjectWithoutExamID[]): Promise<void> {
        return await this.client_transaction(async client => {
            const sql = `INSERT INTO exam_subject (exam_id, subject, full_score)
                         VALUES ($1, $2, $3)`
            await bulk_insert_query(client, sql, subjects.map(subject => [exam_id, subject.subject, subject.full_score]))
        })
    }

    public async get_subject_by_id(id: number): Promise<ExamSubject | null> {
        const sql = `SELECT * FROM exam_subject WHERE id = $1`;
        const params = [id];
        return await this.query_one<ExamSubject>(sql, params);
    }

    public async delete_subject_of_exam_by_id(id: number): Promise<void> {
        const sql = `DELETE FROM exam_subject WHERE id = $1`;
        const params = [id];
        await this.query(sql, params);
    }

    public async update_subject(
        id: number,
        subject: string,
        full_score: number
    ): Promise<ExamSubject> {
        const sql = `
        UPDATE exam_subject 
        SET subject = $1, full_score = $2 
        WHERE id = $3
        RETURNING *
    `;
        const params = [subject, full_score, id];
        return await this.query_one<ExamSubject>(sql, params);
    }
}