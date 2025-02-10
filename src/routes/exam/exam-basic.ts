import { FastifyPluginCallback } from 'fastify';
import { require_admin } from '../session/require-privilege';
import { Type } from '@sinclair/typebox';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { Exam, ExamSubject } from 'models/exam';

const exam_api: FastifyPluginCallback = (f, opts, done) => {
    const fastify = f.withTypeProvider<TypeBoxTypeProvider>();
    const examModule = fastify.db.exam_module;

    // 获取所有考试信息
    fastify.get('/exam', {
        preHandler: require_admin,
    }, async (request, reply) => {
        fastify.log.info('Getting all exams');
        const exams = await examModule.get_all_exams();
        return Promise.all(exams.map(async (exam) => {
            const subjects = await examModule.get_subjects_of_exam(exam.id);
            return { ...exam, subjects };
        }));
    });

    // 获取某个考试的详细信息，包括考试科目
    fastify.get('/exam/:exam_id', {
        preHandler: require_admin,
        schema: {
            params: Type.Object({
                exam_id: Type.String(),
            }),
        },
    }, async (request, reply) => {
        const exam_id = Number.parseInt(request.params.exam_id);
        fastify.log.info(`Getting exam ${exam_id}`);
        const exam = await examModule.get_exam_by_id(exam_id);
        if (!exam) {
            return reply.status(404).send({ error: 'Exam not found' });
        }
        const subjects = await examModule.get_subjects_of_exam(exam.id);
        return { ...exam, subjects };
    });

    // 创建考试
    fastify.post('/exam', {
        preHandler: require_admin,
        schema: {
            body: Type.Object({
                name: Type.String(),
                date: Type.String({ format: 'date' }),
                subjects: Type.Array(Type.Object({
                    subject: Type.String(),
                    full_score: Type.Number(),
                })),
            }),
        },
    }, async (request, reply) => {
        const { name, date, subjects } = request.body;
        fastify.log.info(`Creating exam ${name}`);
        try {
            await examModule.create_exam({ name, date }, subjects);
            return reply.status(201).send({ message: 'ok' });
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: 'Failed to create exam' });
        }
    });

    // 更新考试信息（名称、日期）
    fastify.put('/exam/:exam_id', {
        preHandler: require_admin,
        schema: {
            params: Type.Object({
                exam_id: Type.String(),
            }),
            body: Type.Object({
                name: Type.String(),
                date: Type.String({ format: 'date' }),
            }),
        },
    }, async (request, reply) => {
        const exam_id = Number.parseInt(request.params.exam_id);
        const { name, date } = request.body;
        fastify.log.info(`Updating exam ${exam_id} with ${JSON.stringify(request.body)}`);
        const exam = await examModule.get_exam_by_id(exam_id);
        if (!exam) {
            return reply.status(404).send({ error: 'Exam not found' });
        }
        exam.name = name;
        exam.date = date;
        try {
            await examModule.update_exam(exam);
            return { message: 'Exam updated successfully' };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: 'Failed to update exam' });
        }
    });

    // 删除考试
    fastify.delete('/exam/:exam_id', {
        preHandler: require_admin,
        schema: {
            params: Type.Object({
                exam_id: Type.String(),
            }),
        },
    }, async (request, reply) => {
        const exam_id = Number.parseInt(request.params.exam_id);
        fastify.log.info(`Deleting exam ${exam_id}`);
        const exam = await examModule.get_exam_by_id(exam_id);
        if (!exam) {
            return reply.status(404).send({ error: 'Exam not found' });
        }
        try {
            await examModule.delete_exam(exam_id);
            return { message: 'Exam deleted successfully' };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: 'Failed to delete exam' });
        }
    });

    done();
};

export default exam_api;
