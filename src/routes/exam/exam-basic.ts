import {FastifyPluginCallback} from "fastify";
import {TypeBoxTypeProvider} from "@fastify/type-provider-typebox";
import {require_login} from "../session/require-privilege";

const exam_basic_api: FastifyPluginCallback = (f, opts, done) => {
    const fastify = f.withTypeProvider<TypeBoxTypeProvider>()

    // 用户获取所有考试
    fastify.get('/self', {
        preHandler: require_login
    }, async (request, reply) => {
        const {password, ...no_password_session} = request.session.student || request.session.admin
        return {
            admin: !request.session.student,
            ...no_password_session
        }
    })
}