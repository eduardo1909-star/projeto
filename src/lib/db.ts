import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function initDB() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS sales (
      id SERIAL PRIMARY KEY,
      product VARCHAR(100) NOT NULL,
      buyer_name VARCHAR(200),
      buyer_email VARCHAR(200),
      amount DECIMAL(10,2) NOT NULL,
      status VARCHAR(20) DEFAULT 'paid',
      payment_method VARCHAR(50),
      sale_date TIMESTAMP DEFAULT NOW(),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS ads_spend (
      id SERIAL PRIMARY KEY,
      month INT NOT NULL,
      year INT NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(month, year)
    )
  `
}

export { sql }
