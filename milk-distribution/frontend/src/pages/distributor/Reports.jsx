import { useState, useEffect } from 'react'
import Layout from '../../components/common/Layout'
import Spinner from '../../components/common/Spinner'
import { distributorAPI } from '../../api'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts'

const NAV = [
  { path: '/distributor', icon: '🏠', label: 'Home' },
  { path: '/distributor/customers', icon: '👥', label: 'Customers' },
  { path: '/distributor/delivery-boys', icon: '🚴', label: 'Delivery' },
  { path: '/distributor/billing', icon: '💰', label: 'Billing' },
  { path: '/distributor/milk-prices', icon: '🥛', label: 'Prices' },
  { path: '/distributor/reports', icon: '📊', label: 'Reports' }
]

export default function Reports() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [dailyData, setDailyData] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [perfData, setPerfData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      distributorAPI.getDailyChart(month, year),
      distributorAPI.getMonthlyTrend(year),
      distributorAPI.getDeliveryBoyPerformance(month, year)
    ]).then(([d, m, p]) => {
      setDailyData(d.data || [])
      setMonthlyData(m.data || [])
      setPerfData(p.data || [])
    }).finally(() => setLoading(false))
  }, [month, year])

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  return (
    <Layout navItems={NAV} title="Reports">
      <div className="page-header">
        <h1 className="page-title">Reports & Analytics</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={month} onChange={e => setMonth(+e.target.value)} style={{ width: 'auto' }}>
            {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select value={year} onChange={e => setYear(+e.target.value)} style={{ width: 'auto' }}>
            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {loading ? <Spinner /> : (
        <>
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Daily Sales - {months[month - 1]} {year}</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dailyData} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.split('-')[2]} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={v => [`₹${v}`, 'Amount']} />
                <Bar dataKey="amount" fill="#1976d2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Monthly Trend - {year}</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthlyData} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} tickFormatter={m => m.slice(0, 3)} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={v => [`₹${v}`, 'Revenue']} />
                <Line type="monotone" dataKey="amount" stroke="#388e3c" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Delivery Boy Performance</h3>
            {perfData.length === 0 ? (
              <div className="empty-state"><p>No data for this period</p></div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Delivery Boy</th>
                      <th>Deliveries</th>
                      <th>Total Qty (L)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {perfData.map((p, i) => (
                      <tr key={i}>
                        <td><strong>{p.name}</strong></td>
                        <td>{p.deliveries}</td>
                        <td>{Number(p.totalQuantity).toFixed(1)}L</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </Layout>
  )
}
