import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Vendas Dashboard',
  description: 'Controle de vendas AgroQuizz & Aluno Safo',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
