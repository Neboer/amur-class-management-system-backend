import {FastifyPluginCallback} from "fastify";
import user_basic_api from "./user-basic";
import reset_student_pass_api from "./reset-student-password";

const user_apis: FastifyPluginCallback = (fastify, opts, done) => {
    fastify.register(user_basic_api)
    fastify.register(reset_student_pass_api)

    done()
}

export default user_apis