import { useState, useEffect } from 'react'
import Layout from '../../components/common/Layout'
import Spinner from '../../components/common/Spinner'
import { distributorAPI } from '../../api'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts'

const NAV = [
  { path: '/distributor', icon: '🏠', label: 'Home' },
  { path: '/distributor/customers', icon: '👥', label: 'Customers' },
  { path: '/distributor/delivery-boys', icon: '🚴', label: 'Delivery' },
  { path: '/distributor/billing', icon: '💰', label: 'Billing' },
  { path: '/distributor/milk-prices', icon: '🥛', label: 'Prices' },
  { path: '/distributor/reports', icon: '📊', label: 'Reports' }
]

const COLORS = ['#1976d2', '#388e3c', '#f57c00', '#d32f2f', '#7b1fa2']

export default function DistributorDashboard() {
  const [stats, setStats] = useState(null)
  const [chart, setChart] = useState([])
  const [loading, setLoading] = useState(true)
  const now = new Date()

  useEffect(() => {
    Promise.all([
      distributorAPI.getDashboard(),
      distributorAPI.getDailyChart(now.getMonth() + 1, now.getFullYear())
    ]).then(([s, c]) => {
      setStats(s.data)
      setChart(c.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <Layout navItems={NAV} title="Dashboard"><Spinner /></Layout>

  const statCards = [
    { icon: '👥', label: 'Customers', value: stats?.totalCustomers || 0 },
    { icon: '🚴', label: 'Delivery Boys', value: stats?.totalDeliveryBoys || 0 },
    { icon: '🥛', label: "Today's Sale", value: `₹${Number(stats?.todaySale || 0).toFixed(0)}` },
    { icon: '📅', label: 'Monthly Sale', value: `₹${Number(stats?.monthlySale || 0).toFixed(0)}` },
    { icon: '💰', label: 'Revenue', value: `₹${Number(stats?.monthlyRevenue || 0).toFixed(0)}` },
    { icon: '⚠️', label: 'Pending', value: `₹${Number(stats?.pendingPayments || 0).toFixed(0)}` }
  ]

  return (
    <Layout navItems={NAV} title="Dashboard">
      <div className="stats-grid">
        {statCards.map(s => (
          <div key={s.label} className="stat-card">
            <span className="stat-icon">{s.icon}</span>
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 700 }}>
          Daily Sales - {now.toLocaleString('default', { month: 'long' })} {now.getFullYear()}
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chart.slice(-15)} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }}
              tickFormatter={d => d.split('-')[2]} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip formatter={v => [`₹${v}`, 'Amount']} />
            <Bar dataKey="amount" fill="#1976d2" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <h3 style={{ marginBottom: 12, fontSize: 15, fontWeight: 700 }}>Milk Type Split</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={[
                { name: 'Cow', value: 60 },
                { name: 'Buffalo', value: 40 }
              ]} cx="50%" cy="50%" outerRadius={60} dataKey="value" label>
                {[0, 1].map(i => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 12, fontSize: 15, fontWeight: 700 }}>Quick Stats</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Today Qty</span>
              <strong>{Number(stats?.todayQuantity || 0).toFixed(1)}L</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Month Qty</span>
              <strong>{Number(stats?.monthlyQuantity || 0).toFixed(1)}L</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Pending</span>
              <strong style={{ color: 'var(--danger)' }}>₹{Number(stats?.pendingPayments || 0).toFixed(0)}</strong>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
