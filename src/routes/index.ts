import {FastifyPluginCallback} from 'fastify'
import session_apis from "./session";
import user_apis from './user'
import captcha_api from "./captcha";
import student_api from "./student";

const routes: FastifyPluginCallback = (fastify, opts, done) => {
    fastify.get('/', async (request, reply) => {
        return {status: 'ok'}
    })

    fastify.register(session_apis)
    fastify.register(captcha_api)
    fastify.register(user_apis)

    done()
}

export default routes
