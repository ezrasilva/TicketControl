import { FastifyInstance } from 'fastify';
import { ticketRoutes } from './ticket';
import { enterpriseRoutes } from './enterprise';
import { reportRoutes } from './reports';


export async function registerRoutes(fastify: FastifyInstance) {
  await fastify.register(ticketRoutes);
  await fastify.register(enterpriseRoutes);
  await fastify.register(reportRoutes)
}
