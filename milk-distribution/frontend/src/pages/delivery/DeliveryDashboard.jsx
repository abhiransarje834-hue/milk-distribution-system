import { useState, useEffect } from 'react'
import Layout from '../../components/common/Layout'
import Spinner from '../../components/common/Spinner'
import { deliveryAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const NAV = [
  { path: '/delivery', icon: '🏠', label: 'Home' },
  { path: '/delivery/entry', icon: '🥛', label: 'Delivery' },
  { path: '/delivery/customers', icon: '👥', label: 'Customers' },
  { path: '/settings', icon: '⚙️', label: 'Settings' }
]

export default function DeliveryDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [todayDeliveries, setTodayDeliveries] = useState([])
  const [loading, setLoading] = useState(true)
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    Promise.all([
      deliveryAPI.getMyCustomers(),
      deliveryAPI.getDeliveriesForDate(today)
    ]).then(([c, d]) => {
      setCustomers(c.data || [])
      setTodayDeliveries(d.data || [])
    }).finally(() => setLoading(false))
  }, [])

  const delivered = todayDeliveries.filter(d => d.deliveryStatus === 'DELIVERED').length
  const pending = customers.length - delivered

  return (
    <Layout navItems={NAV} title="My Dashboard">
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Good morning, {user?.name}! 👋</h2>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">👥</span>
          <span className="stat-value">{customers.length}</span>
          <span className="stat-label">My Customers</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">✅</span>
          <span className="stat-value" style={{ color: 'var(--success)' }}>{delivered}</span>
          <span className="stat-label">Delivered Today</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">⏳</span>
          <span className="stat-value" style={{ color: 'var(--warning)' }}>{pending}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">💰</span>
          <span className="stat-value">
            ₹{todayDeliveries.reduce((s, d) => s + Number(d.totalAmount || 0), 0).toFixed(0)}
          </span>
          <span className="stat-label">Today's Amount</span>
        </div>
      </div>

      <button
        className="btn btn-primary"
        style={{ width: '100%', fontSize: 16, minHeight: 52, marginBottom: 20 }}
        onClick={() => navigate('/delivery/entry')}
      >
        🥛 Start Today's Delivery
      </button>

      {loading ? <Spinner /> : (
        <div className="card">
          <h3 style={{ marginBottom: 12, fontWeight: 700 }}>Today's Summary</h3>
          {todayDeliveries.length === 0 ? (
            <div className="empty-state" style={{ padding: 24 }}>
              <p>No deliveries recorded yet today</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {todayDeliveries.map(d => (
                <div key={d.id} className={`delivery-card ${d.deliveryStatus.toLowerCase()}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{d.customerName}</strong>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{d.customerMobile}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {d.deliveryStatus === 'DELIVERED' ? (
                        <>
                          <div style={{ fontWeight: 700 }}>{d.quantity}L</div>
                          <div style={{ fontSize: 12, color: 'var(--success)' }}>₹{Number(d.totalAmount).toFixed(0)}</div>
                        </>
                      ) : (
                        <span className={`badge ${d.deliveryStatus === 'SKIPPED' ? 'badge-warning' : 'badge-danger'}`}>
                          {d.deliveryStatus}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Layout>
  )
}
