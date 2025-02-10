import {FastifyPluginCallback} from 'fastify'
import exam_api from "./exam-basic";
import exam_subject_api from "./exam-subject";


const exam_apis: FastifyPluginCallback = (fastify, opts, done) => {
    fastify.register(exam_api)
    fastify.register(exam_subject_api)

    done()
}

export default exam_apis