import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import jwt from 'jsonwebtoken'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value
    if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    jwt.verify(token, process.env.JWT_SECRET!)

    const { searchParams } = new URL(req.url)
    const month = searchParams.get('month') || new Date().getMonth() + 1
    const year = searchParams.get('year') || new Date().getFullYear()

    const sales = await sql`
      SELECT * FROM sales
      WHERE EXTRACT(MONTH FROM sale_date) = ${month}
      AND EXTRACT(YEAR FROM sale_date) = ${year}
      ORDER BY sale_date DESC
    `

    const paid = sales.filter((s: any) => s.status === 'paid')
    const refunds = sales.filter((s: any) => s.status === 'refunded')

    const total = paid.reduce((s: number, e: any) => s + parseFloat(e.amount), 0)
    const total_agroquizz = paid.filter((s: any) => s.product === 'AgroQuizz').reduce((s: number, e: any) => s + parseFloat(e.amount), 0)
    const total_alunosafo = paid.filter((s: any) => s.product === 'Aluno Safo').reduce((s: number, e: any) => s + parseFloat(e.amount), 0)
    const count = paid.length
    const count_agroquizz = paid.filter((s: any) => s.product === 'AgroQuizz').length
    const count_alunosafo = paid.filter((s: any) => s.product === 'Aluno Safo').length

    const adsResult = await sql`
      SELECT amount FROM ads_spend WHERE month = ${month} AND year = ${year}
    `
    const ads_spend = adsResult[0]?.amount || 0

    return NextResponse.json({
      sales,
      stats: { total, total_agroquizz, total_alunosafo, count, count_agroquizz, count_alunosafo, refunds: refunds.length, ads_spend }
    })
  } catch (e) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
