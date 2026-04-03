import { NextResponse } from 'next/server'
import { initDB, sql } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    await initDB()

    const users = await sql`SELECT * FROM users`

    if (users.length === 0) {
      const hashEdu = await bcrypt.hash('edu123', 10)
      const hashRaf = await bcrypt.hash('rafael123', 10)

      await sql`
        INSERT INTO users (name, email, password) VALUES
        ('Eduardo', 'edu@vendas.com', ${hashEdu}),
        ('Rafael', 'rafael@vendas.com', ${hashRaf})
      `
    }

    return NextResponse.json({ success: true, message: 'Banco iniciado!' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao iniciar banco' }, { status: 500 })
  }
}
