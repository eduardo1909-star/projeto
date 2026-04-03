'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Sale {
  id: number
  product: string
  buyer_name: string
  buyer_email: string
  amount: number
  status: string
  payment_method: string
  sale_date: string
}

interface Stats {
  total: number
  total_agroquizz: number
  total_alunosafo: number
  count: number
  count_agroquizz: number
  count_alunosafo: number
  refunds: number
  ads_spend: number
}

export default function Dashboard() {
  const router = useRouter()
  const [sales, setSales] = useState<Sale[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'overview' | 'sales' | 'ads'>('overview')
  const [adsInput, setAdsInput] = useState('')

  useEffect(() => { fetchData() }, [month, year])

  async function fetchData() {
    setLoading(true)
    try {
      const res = await fetch(`/api/sales?month=${month}&year=${year}`)
      if (res.status === 401) { router.push('/'); return }
      const data = await res.json()
      setSales(data.sales || [])
      setStats(data.stats || null)
      setAdsInput(data.stats?.ads_spend || '')
    } catch (e) {}
    setLoading(false)
  }

  async function saveAds() {
    await fetch('/api/ads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month, year, amount: parseFloat(adsInput) })
    })
    fetchData()
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  function fmt(v: number) {
    return 'R$ ' + Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
  }

  const daysInMonth = new Date(year, month, 0).getDate()
  const daysPassed = month === new Date().getMonth() + 1 && year === new Date().getFullYear()
    ? new Date().getDate() : daysInMonth
  const avgPerDay = stats ? (stats.total / daysPassed) : 0
  const projection = avgPerDay * daysInMonth
  const roi = stats?.ads_spend ? ((stats.total - stats.ads_spend) / stats.ads_spend * 100) : 0
  const margin = stats?.total ? ((stats.total - (stats.ads_spend || 0)) / stats.total * 100) : 0
  const eduShare = stats ? (stats.total / 2) : 0
  const rafShare = stats ? (stats.total / 2) : 0
  const eduAds = stats?.ads_spend ? (stats.ads_spend / 2) : 0
  const rafAds = stats?.ads_spend ? (stats.ads_spend / 2) : 0
  const avgTicket = stats?.count ? (stats.total / stats.count) : 0

  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #1a1a1a', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Vendas Dashboard</h1>
          <select
            value={month}
            onChange={e => setMonth(Number(e.target.value))}
            style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#fff', padding: '6px 10px', borderRadius: '8px', fontSize: '13px' }}
          >
            {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#fff', padding: '6px 10px', borderRadius: '8px', fontSize: '13px' }}
          >
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <button onClick={logout} style={{ background: 'transparent', border: '1px solid #2a2a2a', color: '#888', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Sair</button>
      </div>

      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {(['overview', 'sales', 'ads'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '8px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 500,
              background: tab === t ? '#22c55e' : '#1a1a1a', color: tab === t ? '#000' : '#888'
            }}>
              {t === 'overview' ? 'Visão Geral' : t === 'sales' ? 'Vendas' : 'ADS & ROI'}
            </button>
          ))}
        </div>

        {loading ? <p style={{ color: '#666' }}>Carregando...</p> : (
          <>
            {tab === 'overview' && (
              <div>
                {/* Cards principais */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                  {[
                    { label: 'Faturamento total', value: fmt(stats?.total || 0), color: '#22c55e' },
                    { label: 'Total de vendas', value: stats?.count || 0, color: '#3b82f6' },
                    { label: 'Ticket médio', value: fmt(avgTicket), color: '#eab308' },
                    { label: 'Projeção do mês', value: fmt(projection), color: '#a855f7' },
                  ].map((c, i) => (
                    <div key={i} style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '20px' }}>
                      <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>{c.label}</p>
                      <p style={{ fontSize: '22px', fontWeight: 700, color: c.color }}>{c.value}</p>
                    </div>
                  ))}
                </div>

                {/* Por produto */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                  {[
                    { name: 'AgroQuizz', total: stats?.total_agroquizz || 0, count: stats?.count_agroquizz || 0 },
                    { name: 'Aluno Safo', total: stats?.total_alunosafo || 0, count: stats?.count_alunosafo || 0 },
                  ].map((p, i) => (
                    <div key={i} style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '20px' }}>
                      <p style={{ fontSize: '13px', color: '#888', marginBottom: '12px', fontWeight: 500 }}>{p.name}</p>
                      <p style={{ fontSize: '28px', fontWeight: 700, marginBottom: '4px' }}>{fmt(p.total)}</p>
                      <p style={{ fontSize: '13px', color: '#666' }}>{p.count} vendas</p>
                    </div>
                  ))}
                </div>

                {/* Sócios */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                  {[
                    { name: 'Eduardo (você)', share: eduShare, ads: eduAds },
                    { name: 'Rafael', share: rafShare, ads: rafAds },
                  ].map((s, i) => (
                    <div key={i} style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '20px' }}>
                      <p style={{ fontSize: '13px', color: '#888', marginBottom: '12px' }}>{s.name} — 50%</p>
                      <p style={{ fontSize: '22px', fontWeight: 700, color: '#22c55e', marginBottom: '4px' }}>{fmt(s.share)}</p>
                      {s.ads > 0 && <p style={{ fontSize: '12px', color: '#ef4444' }}>- {fmt(s.ads)} em ADS</p>}
                    </div>
                  ))}
                </div>

                {/* Reembolsos */}
                {(stats?.refunds || 0) > 0 && (
                  <div style={{ background: '#1a0a0a', border: '1px solid #2a1a1a', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                    <p style={{ fontSize: '13px', color: '#ef4444' }}>⚠ {stats?.refunds} reembolso(s) este mês</p>
                  </div>
                )}
              </div>
            )}

            {tab === 'sales' && (
              <div>
                <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '12px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                        {['Data', 'Nome', 'Email', 'Produto', 'Valor', 'Status'].map(h => (
                          <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#666', fontWeight: 500 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sales.length === 0 ? (
                        <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#666' }}>Nenhuma venda neste período</td></tr>
                      ) : sales.map(s => (
                        <tr key={s.id} style={{ borderBottom: '1px solid #111' }}>
                          <td style={{ padding: '12px 16px', color: '#888' }}>{new Date(s.sale_date).toLocaleDateString('pt-BR')}</td>
                          <td style={{ padding: '12px 16px
