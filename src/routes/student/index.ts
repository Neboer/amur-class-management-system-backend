import {FastifyPluginCallback} from 'fastify'
import student_api from "./student";

const student_apis: FastifyPluginCallback = (fastify, opts, done) => {
    fastify.register(student_api)

    done()
}

export default student_apis