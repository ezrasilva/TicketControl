import { FastifyInstance } from "fastify";
import {z} from 'zod';
import dayjs from "dayjs";
import { prisma } from "../lib/prisma";
import { log } from "console";

export function ticketRoutes(fastify: FastifyInstance){
    fastify.post('/ticket', async (request, reply) =>{
        const ticketSchema = z.object({
            codeBar: z.string(),
            expiresIn: z.string(),
            paidAt: z.date(),
            enterpriseId: z.string()
        });


     

        try{

            const {codeBar,expiresIn,paidAt,enterpriseId} = ticketSchema.parse(request.body);

           if(paidAt){
            await prisma.ticket.create({
                data:{
                    codeBar,
                    expiresIn: dayjs(expiresIn).toDate(),
                    enterpriseId,
                    paidAt: dayjs(paidAt).toDate()
                }
            })
           } else{
            await prisma.ticket.create({
                data:{
                    codeBar,
                    expiresIn: dayjs(expiresIn).toDate(),
                    enterpriseId
                }
            })
           }

           return reply.status(201)
        } catch(e){
           return reply.status(400)
           
        }

    })
}