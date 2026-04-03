import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import jwt from 'jsonwebtoken'

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value
    if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    jwt.verify(token, process.env.JWT_SECRET!)

    const { month, year, amount } = await req.json()

    await sql`
      INSERT INTO ads_spend (month, year, amount)
      VALUES (${month}, ${year}, ${amount})
      ON CONFLICT (month, year)
      DO UPDATE SET amount = ${amount}
    `

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
