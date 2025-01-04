import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface dataType{
    codeBar: string
    value: number
    expiresIn: Date
    paidAt: Date |null
    enterpriseId: string
}

async function main() {
  // Criar 5 empresas
  const empresa = await prisma.enterprise.createMany({
    data: [
      {
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Empresa ABC",
        cnpj: "12.345.678/0001-99",
      },
      {
        id: "223e4567-e89b-12d3-a456-426614174001",
        name: "Empresa XYZ",
        cnpj: "98.765.432/0001-11",
      },
      {
        id: "323e4567-e89b-12d3-a456-426614174002",
        name: "Tecnologia Inovadora",
        cnpj: "87.654.321/0001-22",
      },
      {
        id: "423e4567-e89b-12d3-a456-426614174003",
        name: "Soluções Digitais",
        cnpj: "34.567.890/0001-33",
      },
      {
        id: "523e4567-e89b-12d3-a456-426614174004",
        name: "Corporação Global",
        cnpj: "12.345.678/0001-88",
      },
    ],
  });

  const empresas = await prisma.enterprise.findMany()

  // Criar 100 tickets variados
  const tickets: dataType[] = [];
  for (let i = 0; i < 100; i++) {
    const paidAt = Math.random() < 0.5 ? new Date() : null; // 50% chance de ter paidAt
    const enterpriseId = empresas[Math.floor(Math.random() * empresas.length)].id;

    tickets.push({
      codeBar: `123456789012${i}`,
      value: Math.random() * 200, // valor aleatório entre 0 e 200
      expiresIn: new Date(Date.now() + Math.floor(Math.random() * 10000000000)), // data futura aleatória
      paidAt,
      enterpriseId,
    });
  }

  // Inserir os tickets no banco de dados
  await prisma.ticket.createMany({
    data: tickets,
  });

  console.log("Dados inseridos com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
