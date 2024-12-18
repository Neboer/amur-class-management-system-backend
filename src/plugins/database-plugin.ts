'use strict'

import fp from 'fastify-plugin'
import Database from "database";
import {FastifyPluginCallback, FastifyPluginOptions} from "fastify";

// This is a plugin that will add a sqlite3 database connection to Fastify
// Define a new datatype FastifyInstanceDB that extends FastifyInstanceBase

declare module 'fastify' {
    interface FastifyInstance {
        db?: Database;
    }
}

const sqlite_plugin_func: FastifyPluginCallback = (fastify, options: FastifyPluginOptions, done): void => {
    if (!fastify.db) {
        const db = new Database({connectionString: fastify.config.DATABASE}, fastify.log)
        fastify.decorate('db', db)

        fastify.addHook('onClose', (fastify, done) => {
            fastify.db.close().then(() => {
                done()
            }).catch((err) => {
                done(err)
            })
        })
    }

    done()
}

export default fp(sqlite_plugin_func)