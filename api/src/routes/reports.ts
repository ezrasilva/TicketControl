import ExcelJs from 'exceljs'
import { FastifyInstance } from 'fastify'
import dayjs from '../lib/dayjs'
import { string, z } from 'zod'
import { prisma } from '../lib/prisma'

export function reportRoutes(fastify: FastifyInstance) {

    const monthToNumber = (monthName: string) => {
        const months = [
            'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
            'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
        ];
        const monthIndex = months.indexOf(monthName.toLowerCase());
        if (monthIndex === -1) {
            throw new Error(`Mês inválido: ${monthName}`);
        }
        return monthIndex +1; // Retorna o número do mês (1-based)
    };

    fastify.get('/monthly_report/:year/:month', async (request, reply) => {
        const paramsSchema = z.object({
            month: z.string(),
            year: z.string()
        })

        const {month,year} = paramsSchema.parse(request.params)

        const monthNumber = monthToNumber(month)

        const date = dayjs(`${year}-${monthNumber}`, 'YYYY-M',true)
        
        const gte = date.startOf('month').toDate()
        const lt = date.endOf('month').toDate()
        
        const isExists = await prisma.monthly_report.findUnique({
            where:{
                month
            }
        })

        if(isExists) await prisma.monthly_report.delete({
            where:{
                month
            }
        })

        const tickets = await prisma.ticket.findMany({
            where: {
                expiresIn: {
                    lt,
                    gte
                }
            }
        })
        const totalAmount = tickets.reduce((sum, ticket) => sum + (ticket.value || 0), 0)

        const workbook = new ExcelJs.Workbook()
        const worksheet = workbook.addWorksheet('Relatório de Tickets')

        worksheet.columns = [
            { header: 'ID', key: 'id', width: 30 },
            { header: 'Empresa', key: 'enterprise', width: 20 },
            { header: 'Código de Barras', key: 'codeBar', width: 40 },
            { header: 'Valor', key: 'value', width: 15 },
            { header: 'Data de vencimento', key: 'expiresIn', width: 20 },
            { header: 'Data de pagamento', key: 'paidAt', width: 20 }

        ]
        for (const ticket of tickets) {
            const enterprise = await prisma.enterprise.findUnique({
                where: {
                    id: ticket.enterpriseId
                }
            });

            const data = {
                id: ticket.id,
                enterprise: enterprise?.name,
                codeBar: ticket.codeBar,
                value: ticket.value,
                expiresIn: ticket.expiresIn,
                paidAt: ticket.paidAt
            };

            worksheet.addRow(data);
        }
        worksheet.addRow({})
        worksheet.addRow({ id: 'Total', value: totalAmount })

        const buffer = await workbook.xlsx.writeBuffer()
        const report = await prisma.monthly_report.create({
            data: {
                month,
                year: parseInt(year),
                total_spend: totalAmount,
                spreadsheet: {
                    create: {
                        name: `relatorio_de_${month}.xlsx`,
                        data: new Uint8Array(buffer)
                    }
                }
            }
        })

        const report_donwload = await prisma.spreadsheet.findUnique({ where: { monthly_reportId: report.id } })

        reply.status(201)
            .header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            .header('Content-Disposition', `attachment; filename="${report_donwload?.name}"`)
            .send(Buffer.from(report_donwload?.data ?? ''));

    })

    fastify.get('/annual_report/:year', async (request,reply) =>{
        const paramsSchema = z.object({
            year: z.string()
        })

        const {year} = paramsSchema.parse(request.params)

        const isExists = await prisma.annual_report.findUnique({
            where:{
                year: parseInt(year)
            }
        })

        if(isExists) await prisma.annual_report.delete({
            where:{
                year: parseInt(year)
            }
        })

        const monthInitial = dayjs('2025','YYYY').startOf('year').format('MMMM')
        const monthFinal = dayjs('2025','YYYY').endOf('year').format('MMMM')

        console.log(monthFinal,monthInitial);
        
        const reports = await prisma.monthly_report.findMany({
            where:{
                year: parseInt(year)
            }
        })

        console.log(reports);
        

        const total = reports.reduce((sum,report) => sum + (report.total_spend || 0),0)

        const workbook = new ExcelJs.Workbook()
        const worksheet = workbook.addWorksheet('Relatorio Anual')

        worksheet.columns = [
            {header:'ID', key: 'id', width: 20},
            {header: 'Mês', key: 'month', width:10},
            {header: 'valor', key: 'total_spend', width: 10}
        ]

        for (const report of reports){
            worksheet.addRow({
                id: report.id,
                month: report.month,
                total_spend: report.total_spend
            })
        }

        worksheet.addRow({})
        worksheet.addRow({
            month: 'Total',
            total_spend: total
        })

        const buffer = await workbook.xlsx.writeBuffer()

        const annual_report = await prisma.annual_report.create({
            data:{
                year: parseInt(year),
                total_spend:total,
                spreadsheet:{
                    create:{
                        name: `Relatorio_Anual_${year}.xlsx`,
                        data: new Uint8Array(buffer)
                    }
                }
            }
        })

        const download_report = await prisma.spreadsheet.findUnique({
            where:{
                annual_reportId: annual_report.id
            }
        })

        reply.status(201)
            .header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            .header('Content-Disposition', `attachment; filename="${download_report?.name}"`)
            .send(Buffer.from(download_report?.data ?? ''));
    })


}