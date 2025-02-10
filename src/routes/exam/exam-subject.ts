import { FastifyPluginCallback } from "fastify";
import { require_admin } from "../session/require-privilege";
import { Type } from "@sinclair/typebox";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";

const exam_subject_api: FastifyPluginCallback = (f, opts, done) => {
    const fastify = f.withTypeProvider<TypeBoxTypeProvider>();

    // 添加多个科目到考试
    fastify.post('/exam/:exam_id/subjects', {
        preHandler: require_admin,
        schema: {
            params: Type.Object({
                exam_id: Type.Number()
            }),
            body: Type.Object({
                subjects: Type.Array(Type.Object({
                    subject: Type.String(),
                    full_score: Type.Number()
                }))
            })
        }
    }, async (request, reply) => {
        try {
            await fastify.db.exam_module.add_subjects_to_exam(
                request.params.exam_id,
                request.body.subjects
            );
            return reply.status(201).send({ message: 'ok' });
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: 'Failed to add subjects' });
        }
    });

    // 删除考试科目（基于科目ID）
    fastify.delete('/exam_subject/:id', {
        preHandler: require_admin,
        schema: {
            params: Type.Object({
                id: Type.Number()
            })
        }
    }, async (request, reply) => {
        try {
            const subject = await fastify.db.exam_module.get_subject_by_id(request.params.id);
            if (!subject) {
                return reply.status(404).send({ error: 'Subject not found' });
            }

            await fastify.db.exam_module.delete_subject_of_exam_by_id(request.params.id);
            return reply.status(204).send();
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: 'Failed to delete subject' });
        }
    });

    // 修改考试科目信息（基于科目ID）
    fastify.put('/exam_subject/:id', {
        preHandler: require_admin,
        schema: {
            params: Type.Object({
                id: Type.Number()
            }),
            body: Type.Object({
                subject: Type.String(),
                full_score: Type.Number()
            })
        }
    }, async (request, reply) => {
        try {
            const existingSubject = await fastify.db.exam_module.get_subject_by_id(request.params.id);
            if (!existingSubject) {
                return reply.status(404).send({ error: 'Subject not found' });
            }

            const updated = await fastify.db.exam_module.update_subject(
                request.params.id,
                request.body.subject,
                request.body.full_score
            );

            return reply.status(200).send(updated);
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: 'Failed to update subject' });
        }
    });

    done();
};

export default exam_subject_api;