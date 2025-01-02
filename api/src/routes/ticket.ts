import { FastifyInstance } from "fastify";
import {z} from 'zod'

export function ticketRoutes(fastify: FastifyInstance){
    fastify.post('/ticket', async (request, reply) =>{
        const ticketSchema = z.object({
            codeBar: z.string(),
            expiresIn: z.date(),
            paidAt: z.date(),
            enterpriseId: z.string()
        })


        const {codeBar,expiresIn,paidAt,enterpriseId} = ticketSchema.parse(request.body)

    })
}