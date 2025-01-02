import Fastify from 'fastify';

const fastify = Fastify({ logger: true });

// Rota inicial
fastify.get('/', async (request, reply) => {
  return { message: 'Hello from Fastify + TypeScript!' };
});

// Rota com parâmetros
fastify.get('/greet/:name', async (request, reply) => {
  const { name } = request.params as { name: string };
  return { message: `Hello, ${name}!` };
});

// Iniciar o servidor
const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    console.log('Servidor rodando em http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
