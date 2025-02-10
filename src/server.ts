import Fastify, {FastifyInstance} from 'fastify'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import fastifyEnv from '@fastify/env';
import fastifyDBPlugin from './plugins/database-plugin'
import fastifyBcryptPlugin from './plugins/bcrypt-plugin'
import routes from "./routes";
import {fastifyCookie} from "@fastify/cookie";
import {fastifySession} from "@fastify/session";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";


declare module 'fastify' {
    interface FastifyInstance {
        config: {
            DATABASE: string
            PORT: number
            HOST: string
            SESSION_SECRET: string
        };
    }
}

const schema = {
    type: 'object',
    required: ['DATABASE', "SESSION_SECRET"],
    properties: {
        PORT: {
            type: 'integer',
            default: 3100
        },
        HOST: {
            type: 'string',
            default: '127.0.0.1'
        },
        DATABASE: {
            type: 'string'
        },
        SESSION_SECRET: {
            type: 'string',
        }
    }
}

const options = {
    confKey: 'config', // optional, default: 'config'
    schema: schema,
}


async function main() {
    const server: FastifyInstance = Fastify({
        logger: {
            level: 'debug'
        }
    })

    await server.register(fastifyEnv, options)
    server.register(fastifyDBPlugin)
    server.register(fastifyBcryptPlugin)
    server.register(fastifyCookie)
    server.register(fastifySession, {
        secret: server.config.SESSION_SECRET,
        cookieName: 'session_id',
        cookie: {
            secure: false,
            maxAge: 1000 * 60 * 60 * 24 // 1 day
        }
    })

    // 注册 Swagger
    await server.register(fastifySwagger, {
        swagger: {
            info: {
                title: 'API 文档',
                description: 'Fastify + Swagger API 文档',
                version: '1.0.0'
            },
            host: `${server.config.HOST}:${server.config.PORT}`,
            schemes: ['http'],
            consumes: ['application/json'],
            produces: ['application/json']
        }
    });

    // 注册 Swagger UI
    await server.register(fastifySwaggerUI, {
        routePrefix: '/docs',
        staticCSP: true,
        transformSpecificationClone: true,
    });

    server.register(routes, {prefix: '/api'})

    server.log.info(`Starting server on ${server.config.HOST}:${server.config.PORT}`)
    await server.listen({port: server.config.PORT, host: server.config.HOST})
}

main()