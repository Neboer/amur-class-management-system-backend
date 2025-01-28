import {FastifyPluginCallback} from "fastify";
import {TypeBoxTypeProvider} from "@fastify/type-provider-typebox";
import {Type} from "@sinclair/typebox";
import {require_admin} from "../session/require-privilege";
import {PasswordResetRecord} from "models/user";
import {v4 as uuidv4} from 'uuid';


const reset_student_pass_api: FastifyPluginCallback = (f, opts, done) => {
    const fastify = f.withTypeProvider<TypeBoxTypeProvider>()

    fastify.get('/student/:student_id/password_reset_key', {
        preHandler: require_admin,
        schema: {
            params: Type.Object({
                student_id: Type.String()
            })
        }
    }, async (request, reply) => {
        const reset_record: PasswordResetRecord = {
            student_id: Number.parseInt(request.params.student_id),
            token: uuidv4()
        }
        await fastify.db.reset_pass_module.create_password_reset_record(reset_record)
        fastify.log.info(`Password reset token created for student ${request.params.student_id}`)
        return {status: 'ok', token: reset_record.token}
    })

    fastify.post('/student/password_reset', {
        schema: {
            body: Type.Object({
                phone_number: Type.String(),
                token: Type.String(),
                new_password: Type.String()
            })
        }
    }, async (request, reply) => {
        const record = await fastify.db.reset_pass_module.query_password_reset_record_by_token(request.body.token)
        if (!record) {
            fastify.log.info(`Token not found: ${request.body.token}`)
            return reply.status(404).send({error: 'Token not found'})
        }
        if (record.used_at) {
            fastify.log.info(`Token already used: ${request.body.token}`)
            return reply.status(403).send({error: 'Token already used'})
        }
        // token是合法的，检查token与phone_number是否对应。
        const student = await fastify.db.user_module.get_student_by_phone(request.body.phone_number)
        if (!student) {
            fastify.log.info(`Student not found: ${request.body.phone_number}`)
            return reply.status(404).send({error: 'Student not found'})
        } else if (student.id !== record.student_id) {
            fastify.log.info(`Token ${request.body.token} is not for student ${request.body.phone_number}`)
            return reply.status(403).send({error: 'Token not for this student'})
        } else {
            // 与phone_number对应，准许重置密码。
            fastify.log.info(`Password reset for student ${request.body.phone_number}`)
            student.password = await fastify.bcrypt_hash(request.body.new_password)
            await fastify.db.user_module.update_student_password(student.id, student.password)
            await fastify.db.reset_pass_module.mark_password_reset_record_used_by_id(record.id)
            return {status: 'ok'}
        }
    })

    done()
}

export default reset_student_pass_api
