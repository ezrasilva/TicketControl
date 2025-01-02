import Fastify from 'fastify';
import { registerRoutes } from './routes';

async function startServer() {
  const fastify = Fastify({ logger: true });

  // Registrar as rotas
  await registerRoutes(fastify);

  // Iniciar o servidor
  try {
    await fastify.listen({ port: 3000 });
    console.log('Servidor rodando em http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

startServer();
