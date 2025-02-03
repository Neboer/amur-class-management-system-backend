import {FastifyPluginCallback} from "fastify";
import {TypeBoxTypeProvider} from "@fastify/type-provider-typebox";
import svgCaptcha from "svg-captcha";

declare module "fastify" {
    interface Session {
        captcha?: string
    }
}

const captcha_api: FastifyPluginCallback = (f, opts, done) => {
    const fastify = f.withTypeProvider<TypeBoxTypeProvider>()

    fastify.get('/captcha', async (request, reply) => {
        fastify.log.info('Generating captcha')
        const captcha = svgCaptcha.create({
            ignoreChars: '0oO1iIlb69gq2zZ',
            width: 166,
            height: 50
        });
        request.session.captcha = captcha.text
        fastify.log.info(`requested Captcha: ${captcha.text}`)
        return reply.type('image/svg+xml').status(200).send(captcha.data)
    })

    done()
}

export default captcha_api