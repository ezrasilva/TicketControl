import { FastifyInstance } from "fastify";
import {z} from 'zod';
import dayjs from "../lib/dayjs";
import { prisma } from "../lib/prisma";

export function ticketRoutes(fastify: FastifyInstance){
    fastify.post('/ticket', async (request, reply) =>{
        const ticketSchema = z.object({
            codeBar: z.string(),
            expiresIn: z.string(),
            paidAt: z.string().optional(),
            enterpriseId: z.string(),
            value: z.number()
        });

        try{

            const {codeBar,expiresIn,paidAt,enterpriseId, value} = ticketSchema.parse(request.body);

            const data: {codeBar: string, paidAt?: Date, expiresIn: Date, enterpriseId: string, value: number} = {
                codeBar,
                enterpriseId,
                value,
                expiresIn: dayjs(expiresIn).toDate()
            }

            if(paidAt) data.paidAt = dayjs(paidAt).toDate()

           await prisma.ticket.create({
            data
           })
        
           
            reply.status(201)
        } catch(e){
            reply.status(400).send(e)
        }
    })

    fastify.get('/tickets', async (request,reply) =>{

        const tickets = await prisma.ticket.findMany()

        reply.status(200).send({tickets})
    })

    fastify.put('/ticket/:id', async (request,reply) =>{
        const paramSchema = z.object({
            id: z.string()
        })

        const updateSchema = z.object({
            paidAt: z.string()
        })

        const {id} = paramSchema.parse(request.params)
        const {paidAt} = updateSchema.parse(request.body)

        const isExists = await prisma.ticket.findUnique({
            where:{
                id
            }
        })

        if (!isExists) reply.status(500)

        await prisma.ticket.update({
            data:{
                paidAt: dayjs(paidAt).toDate()
            },
            where:{
                id
            }
        })

        reply.status(200)
    })
}