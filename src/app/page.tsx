'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    const data = await res.json()

    if (res.ok) {
      router.push('/dashboard')
    } else {
      setError(data.error || 'Erro ao fazer login')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0a0a'
    }}>
      <div style={{
        background: '#111',
        border: '1px solid #222',
        borderRadius: '16px',
        padding: '48px',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px' }}>Vendas Dashboard</h1>
        <p style={{ color: '#666', marginBottom: '32px', fontSize: '14px' }}>AgroQuizz & Aluno Safo</p>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#888', marginBottom: '6px' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                width: '100%', padding: '12px', background: '#1a1a1a',
                border: '1px solid #2a2a2a', borderRadius: '8px',
                color: '#fff', fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#888', marginBottom: '6px' }}>Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                width: '100%', padding: '12px', background: '#1a1a1a',
                border: '1px solid #2a2a2a', borderRadius: '8px',
                color: '#fff', fontSize: '14px'
              }}
            />
          </div>

          {error && <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '16px' }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '12px', background: '#22c55e',
              border: 'none', borderRadius: '8px', color: '#000',
              fontWeight: 600, fontSize: '15px', cursor: 'pointer'
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
