'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Sale = {
  id: number
  product: string
  buyer_name: string
  buyer_email: string
  amount: number
  status: string
  payment_method: string
  sale_date: string
}

type Stats = {
  total: number
  total_agroquizz: number
  total_alunosafo: number
  count: number
  count_agroquizz: number
  count_alunosafo: number
  refunds: number
  ads_spend: number
}

type Tab = 'overview' | 'sales' | 'ads'

export default function Dashboard() {
  const router = useRouter()
  const [sales, setSales] = useState<Sale[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('overview')
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
    } catch (e) { console.error(e) }
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
  const today = new Date()
  const daysPassed = (month === today.getMonth() + 1 && year === today.getFullYear()) ? today.getDate() : daysInMonth
  const avgPerDay = stats ? (stats.total / daysPassed) : 0
  const projection = avgPerDay * daysInMonth
  const adsSpend = stats?.ads_spend ? Number(stats.ads_spend) : 0
  const roi = adsSpend > 0 ? ((stats!.total - adsSpend) / adsSpend * 100) : 0
  const margin = stats?.total ? ((stats.total - adsSpend) / stats.total * 100) : 0
  const eduShare = stats ? (stats.total / 2) : 0
  const rafShare = stats ? (stats.total / 2) : 0
  const eduAds = adsSpend / 2
  const rafAds = adsSpend / 2
  const avgTicket = stats?.count ? (stats.total / stats.count) : 0
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

  const tabStyle = (t: Tab) => ({
    padding: '8px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer',
    fontSize: '13px', fontWeight: 500,
    background: tab === t ? '#22c55e' : '#1a1a1a',
    color: tab === t ? '#000' : '#888',
  } as React.CSSProperties)

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff' }}>
      <div style={{ borderBottom: '1px solid #1a1a1a', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Vendas Dashboard</h1>
          <select value={month} onChange={e => setMonth(Number(e.target.value))} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#fff', padding: '6px 10px', borderRadius: '8px', fontSize: '13px' }}>
            {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select value={year} onChange={e => setYear(Number(e.target.value))} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#fff', padding: '6px 10px', borderRadius: '8px', fontSize: '13px' }}>
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <button onClick={logout} style={{ background: 'transparent', border: '1px solid #2a2a2a', color: '#888', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Sair</button>
      </div>

      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <button onClick={() => setTab('overview')} style={tabStyle('overview')}>Visão Geral</button>
          <button onClick={() => setTab('sales')} style={tabStyle('sales')}>Vendas</button>
          <button onClick={() => setTab('ads')} style={tabStyle('ads')}>ADS & ROI</button>
        </div>

        {loading ? (
          <p style={{ color: '#666' }}>Carregando...</p>
        ) : (
          <div>
            {tab === 'overview' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                  {[
                    { label: 'Faturamento total', value: fmt(stats?.total || 0), color: '#22c55e' },
                    { label: 'Total de vendas', value: String(stats?.count || 0), color: '#3b82f6' },
                    { label: 'Ticket médio', value: fmt(avgTicket), color: '#eab308' },
                    { label: 'Projeção do mês', value: fmt(projection), color: '#a855f7' },
                  ].map((c, i) => (
                    <div key={i} style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '20px' }}>
                      <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>{c.label}</p>
                      <p style={{ fontSize: '22px', fontWeight: 700, color: c.color }}>{c.value}</p>
                    </div>
                  ))}
                </div>

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

                {(stats?.refunds || 0) > 0 && (
                  <div style={{ background: '#1a0a0a', border: '1px solid #2a1a1a', borderRadius: '12px', padding: '16px' }}>
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
                          <td style={{ padding: '12px 16px' }}>{s.buyer_name || '—'}</td>
                          <td style={{ padding: '12px 16px', color: '#888' }}>{s.buyer_email || '—'}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ background: s.product === 'AgroQuizz' ? '#0a2a0a' : '#0a0a2a', color: s.product === 'AgroQuizz' ? '#22c55e' : '#3b82f6', padding: '3px 8px', borderRadius: '6px', fontSize: '12px' }}>
                              {s.product}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', fontWeight: 600 }}>{fmt(s.amount)}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ color: s.status === 'paid' ? '#22c55e' : '#ef4444', fontSize: '12px' }}>
                              {s.status === 'paid' ? 'Pago' : 'Reembolsado'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <button onClick={() => exportCSV(sales)} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Exportar CSV</button>
                  <button onClick={() => exportPDF(sales)} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Exportar PDF</button>
                </div>
              </div>
            )}

            {tab === 'ads' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
                  {[
                    { label: 'Gasto em ADS', value: fmt(adsSpend), color: '#ef4444' },
                    { label: 'ROI', value: adsSpend > 0 ? roi.toFixed(1) + '%' : '—', color: roi >= 0 ? '#22c55e' : '#ef4444' },
                    { label: 'Margem', value: stats?.total ? margin.toFixed(1) + '%' : '—', color: '#eab308' },
                  ].map((c, i) => (
                    <div key={i} style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '20px' }}>
                      <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>{c.label}</p>
                      <p style={{ fontSize: '28px', fontWeight: 700, color: c.color }}>{c.value}</p>
                    </div>
                  ))}
                </div>
                <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '24px' }}>
                  <p style={{ fontSize: '14px', color: '#888', marginBottom: '16px' }}>Lançar gasto em ADS — {months[month - 1]}/{year}</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="number" value={adsInput} onChange={e => setAdsInput(e.target.value)} placeholder="Ex: 1500.00"
                      style={{ flex: 1, padding: '10px 14px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#fff', fontSize: '14px' }} />
                    <button onClick={saveAds} style={{ padding: '10px 20px', background: '#22c55e', border: 'none', borderRadius: '8px', color: '#000', fontWeight: 600, cursor: 'pointer' }}>Salvar</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function exportCSV(sales: Sale[]) {
  const rows = [
    ['Data', 'Nome', 'Email', 'Produto', 'Valor', 'Status'],
    ...sales.map(s => [
      new Date(s.sale_date).toLocaleDateString('pt-BR'),
      s.buyer_name, s.buyer_email, s.product,
      String(s.amount), s.status === 'paid' ? 'Pago' : 'Reembolsado'
    ])
  ]
  const csv = rows.map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'vendas.csv'
  a.click()
}

function exportPDF(sales: Sale[]) {
  const rows = sales.map(s => [
    new Date(s.sale_date).toLocaleDateString('pt-BR'),
    s.buyer_name || '—', s.buyer_email || '—', s.product,
    'R$ ' + Number(s.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
    s.status === 'paid' ? 'Pago' : 'Reembolsado'
  ])
  const win = window.open('', '_blank')!
  win.document.write('<html><head><title>Vendas</title></head><body>')
  win.document.write('<h2>Relatório de Vendas</h2>')
  win.document.write('<table border="1" cellpadding="6" style="border-collapse:collapse;font-size:12px">')
  win.document.write('<tr><th>Data</th><th>Nome</th><th>Email</th><th>Produto</th><th>Valor</th><th>Status</th></tr>')
  rows.forEach(r => { win.document.write('<tr>' + r.map(c => `<td>${c}</td>`).join('') + '</tr>') })
  win.document.write('</table></body></html>')
  win.print()
}
