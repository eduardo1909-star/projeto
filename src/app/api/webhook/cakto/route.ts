import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const status = body.status
    const amount = parseFloat(body.amount || body.price || 0)
    const buyer_name = body.customer?.name || body.buyer?.name || ''
    const buyer_email = body.customer?.email || body.buyer?.email || ''
    const product_name = body.product?.name || body.offer?.name || ''
    const payment_method = body.payment_method || ''

    let product = 'AgroQuizz'
    if (product_name.toLowerCase().includes('safo')) product = 'Aluno Safo'
    else if (product_name.toLowerCase().includes('agro')) product = 'AgroQuizz'

    let saleStatus = 'paid'
    if (status === 'refunded' || status === 'chargedback' || status === 'canceled') {
      saleStatus = 'refunded'
    }

    if (status === 'paid' || status === 'approved' || status === 'refunded' || status === 'chargedback') {
      await sql`
        INSERT INTO sales (product, buyer_name, buyer_email, amount, status, payment_method, sale_date)
        VALUES (${product}, ${buyer_name}, ${buyer_email}, ${amount}, ${saleStatus}, ${payment_method}, NOW())
      `
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
