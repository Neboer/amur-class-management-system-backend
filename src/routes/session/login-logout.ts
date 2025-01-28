import {FastifyPluginCallback} from "fastify";
import {Type} from '@sinclair/typebox'
import {TypeBoxTypeProvider} from "@fastify/type-provider-typebox";
import {Student} from "../../models/user";


const login_api: FastifyPluginCallback = (f, opts, done) => {
    const fastify = f.withTypeProvider<TypeBoxTypeProvider>()
    fastify.post('/login', {
        schema: {
            body: Type.Object({
                username: Type.String(),
                password: Type.String(),
                remember_me: Type.Boolean(),
                captcha: Type.String()
            })
        }
    }, async (request, reply) => {
        if (request.session.student || request.session.admin) {
            fastify.log.info(`User ${request.body.username} already logged in`)
            return reply.status(403).send({error: 'Already logged in'})
        }

        if (!request.session.captcha || request.body.captcha.toLowerCase() !== request.session.captcha.toLowerCase()) {
            fastify.log.info(`Incorrect captcha: ${request.body.captcha} != ${request.session.captcha}`)
            return reply.status(401).send({error: 'Incorrect captcha'})
        } else {
            fastify.log.info(`Captcha correct: ${request.body.captcha}, reset it.`)
            request.session.captcha = undefined
        }

        // 普通的用户和管理员账号不同之处在于，管理员账号拥有……
        let db_student: Student | null = await fastify.db.user_module.get_student_by_phone(request.body.username, true)
        let db_admin;
        if (!db_student) {
            // maybe not a normal student, check if it's an admin
            db_admin = await fastify.db.user_module.get_admin_by_name(request.body.username, true)
            if (!db_admin) {
                // not an admin either, return error
                fastify.log.info(`User not found: ${request.body.username}`)
                return reply.status(404).send({error: 'Invalid username or password'})
            }
        }

        const db_bcrypt_password = db_student ? db_student.password : db_admin.password
        if (!await fastify.bcrypt_compare(request.body.password, db_bcrypt_password)) {
            fastify.log.info(`Incorrect password for user: ${request.body.username}`)
            return reply.status(401).send({error: 'Invalid username or password'})
        } else {
            fastify.log.info(`User ${request.body.username} logged in`)
            request.session.student = db_student
            request.session.admin = db_admin
            if (request.body.remember_me) {
                request.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 30; // 30 days
            } else {
                request.session.cookie.maxAge = 1000 * 60 * 60 * 24; // 1 day
            }
        }
        return {status: 'ok'}
    })

    fastify.post('/logout', async (request, reply) => {
        if (request.session.student) {
            fastify.log.info(`Student ${request.session.student} logged out`)
            delete request.session.student
        } else if (request.session.admin) {
            fastify.log.info(`Admin ${request.session.admin} logged out`)
            delete request.session.admin
        } else {
            fastify.log.info(`No user logged in`)
            return reply.status(403).send({error: 'No user logged in'})
        }
        return {status: 'ok'}
    })

    done()
}

export default login_api