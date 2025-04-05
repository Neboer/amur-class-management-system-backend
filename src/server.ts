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
import path from 'path'; // 新增导入 path 模块

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

    // 注册 Swagger UI
    await server.register(fastifySwagger, {
        mode: 'static',
        specification: {
            path: path.join(__dirname, '../docs/openapi.yaml'), // 你的 OpenAPI YAML 文件路径
            baseDir: path.join(__dirname, 'specs'),    // 若有 $ref 外部文件，指定基础目录
        }
    })
    await server.register(fastifySwaggerUI, {
        routePrefix: '/docs',          // UI 访问路径，默认为 /documentation
        uiConfig: {
            docExpansion: 'list',        // 控制文档默认展开方式
            deepLinking: true
        },
        staticCSP: true,               // 启用 CSP 安全头
    });

    server.register(routes, {prefix: '/api'})

    server.log.info(`Starting server on ${server.config.HOST}:${server.config.PORT}`)
    await server.listen({port: server.config.PORT, host: server.config.HOST})
}

main()
