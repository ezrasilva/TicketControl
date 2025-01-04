import { FastifyInstance } from "fastify";
import {z} from 'zod';
import { prisma } from "../lib/prisma";

export function enterpriseRoutes(fastify: FastifyInstance){
    fastify.post('/enterprise', async (request, reply) =>{
        const enterpriseSchema = z.object({
            name: z.string(),
            cnpj: z.string()
        })

        try{

            const {name, cnpj} = enterpriseSchema.parse(request.body)

            const isExists = await prisma.enterprise.findUnique({
                where:{
                    cnpj
                }
            })

            if (isExists){
                 reply.status(409).send({message: 'Cnpj já está cadastrado em outra empresa'})
            }

            await prisma.enterprise.create({
                data:{
                    name,
                    cnpj
                }
            })

             reply.status(201)
        } catch(e){
             reply.status(500).send({message: e})
        }

        
    })

    fastify.get('/enterprises', async (request, reply) =>{
        try {
            const enterprises = await prisma.enterprise.findMany()

            return reply.status(200).send({message: enterprises})
        } catch (e) {
             reply.status(500).send({message: e})
        }
    })

    fastify.delete('/enterprise', async (request, reply) =>{
        const delete_enterpriseSchema = z.object({
            cnpj: z.string()
        })
        
            const {cnpj} = delete_enterpriseSchema.parse(request.body)

            await prisma.enterprise.delete({
                where:{
                    cnpj
                }
            }).then(()=>{
                 reply.status(200)
            }).catch(()=>{
                 reply.status(500)
            })
    })

    fastify.put('/enterprise/:cnpj', async (request, reply) =>{
        const updateSchema = z.object({
            name: z.string().optional(),
            cnpjUp: z.string().optional()
        })

        const updateParams = z.object({
            cnpj: z.string()
        })

        const {cnpj} = updateParams.parse(request.params)
        const {cnpjUp, name} = updateSchema.parse(request.body)
        
        const data: { name?: string; cnpj?: string } = {};
        if (cnpjUp) data.cnpj = cnpjUp;
        if (name) data.name = name;



        await prisma.enterprise.update({
            data,
            where:{
                cnpj
            }
        })

        reply.status(200)
    })

}