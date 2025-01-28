import {FastifyPluginCallback} from "fastify";
import {require_admin} from "../session/require-privilege";
import {Type} from "@sinclair/typebox";
import {TypeBoxTypeProvider} from "@fastify/type-provider-typebox";

const student_api: FastifyPluginCallback = (f, opts, done) => {
    const fastify = f.withTypeProvider<TypeBoxTypeProvider>()

    // 管理员获取某个学生信息
    fastify.get('/student/:student_id', {
        preHandler: require_admin,
        schema: {
            params: Type.Object({
                student_id: Type.String()
            })
        }
    }, async (request, reply) => {
        fastify.log.info(`Getting student ${request.params.student_id}`)
        const student = await fastify.db.user_module.get_student_by_id(Number.parseInt(request.params.student_id))
        if (!student) {
            return reply.status(404).send({error: 'Student not found'})
        }
        return student
    })

    // 管理员获取所有学生
    fastify.get('/student', {
        preHandler: require_admin
    }, async (request, reply) => {
        fastify.log.info('Getting all students')
        return await fastify.db.user_module.get_all_students()
    })

    // 管理员添加学生
    fastify.post('/student', {
        preHandler: require_admin,
        schema: {
            body: Type.Object({
                name: Type.String(),
                phone_number: Type.String(),
            })
        }
    }, async (request, reply) => {
        fastify.log.info(`Creating student ${request.body.name}`)
        // 学生的默认密码，应该与手机号相同。
        return await fastify.db.user_module.create_student({
            name: request.body.name,
            phone_number: request.body.phone_number,
            password: await fastify.bcrypt_hash(request.body.phone_number)
        })
    })

    // 管理员更新某个学生的姓名和电话
    fastify.put('/student/:student_id', {
        preHandler: require_admin,
        schema: {
            params: Type.Object({
                student_id: Type.String()
            }),
            body: Type.Object({
                name: Type.String(),
                phone_number: Type.String(),
            })
        }
    }, async (request, reply) => {
        fastify.log.info(`Updating student ${request.params.student_id} with ${JSON.stringify(request.body)}`)
        const student = await fastify.db.user_module.get_student_by_id(Number.parseInt(request.params.student_id))
        if (!student) {
            return reply.status(404).send({error: 'Student not found'})
        }
        student.name = request.body.name
        return await fastify.db.user_module.update_student_info(student)
    })

    // 管理员更新学生的密码
    fastify.put('/student/:student_id/password', {
        preHandler: require_admin,
        schema: {
            params: Type.Object({
                student_id: Type.String()
            }),
            body: Type.Object({
                password: Type.String()
            })
        }
    }, async (request, reply) => {
        fastify.log.info(`Updating student ${request.params.student_id} password`)
        const student = await fastify.db.user_module.get_student_by_id(Number.parseInt(request.params.student_id))
        if (!student) {
            return reply.status(404).send({error: 'Student not found'})
        }
        student.password = await fastify.bcrypt_hash(request.body.password)
        return await fastify.db.user_module.update_student_password(student.id, student.password)
    })

    // 管理员删除学生
    fastify.delete('/student/:student_id', {
        preHandler: require_admin,
        schema: {
            params: Type.Object({
                student_id: Type.String()
            })
        }
    }, async (request, reply) => {
        fastify.log.info(`Deleting student ${request.params.student_id}`)
        return await fastify.db.user_module.delete_student(Number.parseInt(request.params.student_id))
    })

    done()
}

export default student_api