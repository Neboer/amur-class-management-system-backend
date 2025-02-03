import {Admin, Student, PasswordResetRecord} from "models/user";
import BasicDBModule from "./BasicDBModule";

export default class UserModule extends BasicDBModule {
    public async create_admin(admin: Admin): Promise<void> {
        const sql = `INSERT INTO admin (username, password)
                     VALUES ($1, $2)`
        const params = [admin.username, admin.password]
        await this.query(sql, params)
    }

    public async create_student(student: Student): Promise<void> {
        const sql = `INSERT INTO student (name, phone_number, password)
                     VALUES ($1, $2, $3)`
        const params = [student.name, student.phone_number, student.password]
        await this.query(sql, params)
    }

    public async get_student_by_phone(phone_number: string, need_password = false): Promise<Student | null> {
        const sql = `SELECT id, name, phone_number ${need_password ? ', password' : ''}
                     FROM student
                     WHERE phone_number = $1`
        const params = [phone_number]
        return await this.query_one<Student>(sql, params)
    }

    public async get_student_by_id(id: number, need_password = false): Promise<Student | null> {
        const sql = `SELECT id, name, phone_number ${need_password ? ', password' : ''}
                     FROM student
                     WHERE id = $1`
        const params = [id]
        return await this.query_one<Student>(sql, params)
    }

    public async get_admin_by_name(username: string, need_password = false): Promise<Admin | null> {
        const sql = `SELECT id, username ${need_password ? ', password' : ''}
                     FROM admin
                     WHERE username = $1`
        const params = [username]
        return await this.query_one<Admin>(sql, params)
    }

    public async get_all_students(): Promise<Array<Student>> {
        const sql = `SELECT id, name, phone_number
                     FROM student`
        return await this.query<Student>(sql)
    }

    // 更新除了密码外的学生信息
    public async update_student_info(student: Student): Promise<void> {
        const sql = `UPDATE student
                     SET name         = $1,
                         phone_number = $2
                     WHERE id = $3`
        const params = [student.name, student.phone_number, student.id]
        await this.query(sql, params)
    }

    public async update_admin_info(admin: Admin): Promise<void> {
        const sql = `UPDATE admin
                     SET username = $1,
                         password = $2
                     WHERE id = $3`
        const params = [admin.username, admin.password, admin.id]
        await this.query(sql, params)
    }

    public async update_student_password(id: number, password: string): Promise<void> {
        const sql = `UPDATE student
                     SET password = $1
                     WHERE id = $2`
        const params = [password, id]
        await this.query(sql, params)
    }

    public async update_admin_password(id: number, password: string): Promise<void> {
        const sql = `UPDATE admin
                     SET password = $1
                     WHERE id = $2`
        const params = [password, id]
        await this.query(sql, params)
    }

    public async delete_student(id: number): Promise<void> {
        const sql = `DELETE
                     FROM student
                     WHERE id = $1`
        const params = [id]
        await this.query(sql, params)
    }
}