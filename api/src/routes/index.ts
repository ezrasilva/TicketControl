import { FastifyInstance } from 'fastify';
import { ticketRoutes } from './ticket';


export async function registerRoutes(fastify: FastifyInstance) {
  await fastify.register(ticketRoutes);

}
