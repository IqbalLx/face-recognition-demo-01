import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import multipart from '@fastify/multipart';

/**
 * This plugins adds some utilities to handle multipart file
 *
 * @see https://github.com/fastify/fastify-multipart
 */
export default fp(async function (fastify: FastifyInstance) {
  fastify.register(multipart);
});
