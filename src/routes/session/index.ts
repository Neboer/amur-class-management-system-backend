import {FastifyPluginCallback} from 'fastify'
import {Admin, Student} from "models/user";
import login_logout from "./login-logout";

declare module "fastify" {
    interface Session {
        student?: Student
        admin?: Admin
    }
}

const session_apis: FastifyPluginCallback = (fastify, opts, done) => {
    fastify.register(login_logout)

    done()
}

export default session_apis