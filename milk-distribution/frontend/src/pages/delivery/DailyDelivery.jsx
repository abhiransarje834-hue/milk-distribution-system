import { useState, useEffect } from 'react'
import Layout from '../../components/common/Layout'
import Spinner from '../../components/common/Spinner'
import { deliveryAPI } from '../../api'
import { toast } from 'react-toastify'

const NAV = [
  { path: '/delivery', icon: '🏠', label: 'Home' },
  { path: '/delivery/entry', icon: '🥛', label: 'Delivery' },
  { path: '/delivery/customers', icon: '👥', label: 'Customers' },
  { path: '/settings', icon: '⚙️', label: 'Settings' }
]

export default function DailyDelivery() {
  const [customers, setCustomers] = useState([])
  const [deliveries, setDeliveries] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState({})
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [tab, setTab] = useState('pending') // 'pending' | 'delivered'
  const [editingId, setEditingId] = useState(null)

  const load = () => {
    setLoading(true)
    Promise.all([
      deliveryAPI.getMyCustomers(),
      deliveryAPI.getDeliveriesForDate(date)
    ]).then(([c, d]) => {
      setCustomers(c.data || [])
      const map = {}
      ;(d.data || []).forEach(del => { map[del.customerId] = del })
      setDeliveries(map)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [date])

  const getDelivery = id => deliveries[id]

  const saveDelivery = async (customer, status, qty = null) => {
    const quantity = qty !== null ? qty : (getDelivery(customer.id)?.quantity || customer.defaultQuantity || 1)
    setSaving(s => ({ ...s, [customer.id]: true }))
    try {
      const { data } = await deliveryAPI.saveDelivery({
        customerId: customer.id,
        deliveryDate: date,
        quantity: status === 'DELIVERED' ? parseFloat(quantity) : 0,
        deliveryStatus: status
      })
      setDeliveries(d => ({ ...d, [customer.id]: data }))
      setEditingId(null)
      if (status === 'DELIVERED') setTab('delivered')
      toast.success(`${customer.name}: ${status}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(s => ({ ...s, [customer.id]: false }))
    }
  }

  const updateQty = (customerId, qty) => {
    setDeliveries(d => ({ ...d, [customerId]: { ...(d[customerId] || {}), quantity: qty } }))
  }

  const pendingCustomers = customers.filter(c => {
    const del = getDelivery(c.id)
    return !del || del.deliveryStatus !== 'DELIVERED'
  })

  const deliveredCustomers = customers.filter(c => {
    const del = getDelivery(c.id)
    return del && del.deliveryStatus === 'DELIVERED'
  })

  const CustomerCard = ({ customer, isDelivered }) => {
    const del = getDelivery(customer.id)
    const qty = del?.quantity ?? customer.defaultQuantity ?? 1
    const isSaving = saving[customer.id]
    const isEditing = editingId === customer.id

    if (isDelivered && !isEditing) {
      return (
        <div className="delivery-card delivered" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700 }}>{customer.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {customer.milkType === 'COW' ? '🐄' : '🐃'} {customer.milkType} | 📱 {customer.mobile}
            </div>
            <div style={{ fontSize: 13, color: 'var(--success)', fontWeight: 600, marginTop: 4 }}>
              ✅ {del.quantity}L — ₹{Number(del.totalAmount).toFixed(2)}
            </div>
          </div>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => { setEditingId(customer.id); setTab('delivered') }}
          >
            ✏️ Edit
          </button>
        </div>
      )
    }

    return (
      <div className={`delivery-card ${del?.deliveryStatus ? del.deliveryStatus.toLowerCase() : ''}`} style={{ opacity: isSaving ? 0.7 : 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{customer.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {customer.milkType === 'COW' ? '🐄' : '🐃'} {customer.milkType} | 📱 {customer.mobile}
            </div>
          </div>
          {isEditing && (
            <button className="btn-icon" style={{ fontSize: 16 }} onClick={() => setEditingId(null)}>✕</button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)', minWidth: 30 }}>Qty:</span>
          <input
            type="number" step="0.5" min="0" value={qty}
            onChange={e => updateQty(customer.id, e.target.value)}
            style={{ width: 80, textAlign: 'center', padding: '6px 8px' }}
          />
          <span style={{ fontSize: 13 }}>L</span>
        </div>

        <div className="quick-actions" style={{ marginBottom: 10 }}>
          {[0.5, 1, 1.5, 2].map(q => (
            <button key={q} className="qty-btn" onClick={() => updateQty(customer.id, q)}>{q}L</button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            className="btn btn-success btn-sm"
            onClick={() => saveDelivery(customer, 'DELIVERED', qty)}
            disabled={isSaving} style={{ flex: 1 }}
          >
            ✅ {isEditing ? 'Update' : 'Deliver'} {qty}L
          </button>
          {!isEditing && (
            <>
              <button className="skip-btn btn-sm" onClick={() => saveDelivery(customer, 'SKIPPED')} disabled={isSaving}>⏭ Skip</button>
              <button className="holiday-btn btn-sm" onClick={() => saveDelivery(customer, 'HOLIDAY')} disabled={isSaving}>🏖 Holiday</button>
            </>
          )}
        </div>

        {del?.totalAmount > 0 && (
          <div style={{ marginTop: 8, fontSize: 13, color: 'var(--success)', fontWeight: 600 }}>
            Amount: ₹{Number(del.totalAmount).toFixed(2)}
          </div>
        )}
      </div>
    )
  }

  return (
    <Layout navItems={NAV} title="Daily Delivery">
      <div className="page-header">
        <h1 className="page-title">Daily Entry</h1>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: 'auto' }} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          className={`btn ${tab === 'pending' ? 'btn-primary' : 'btn-outline'} btn-sm`}
          onClick={() => setTab('pending')}
        >
          ⏳ Pending ({pendingCustomers.length})
        </button>
        <button
          className={`btn ${tab === 'delivered' ? 'btn-success' : 'btn-outline'} btn-sm`}
          onClick={() => setTab('delivered')}
        >
          ✅ Delivered ({deliveredCustomers.length})
        </button>
      </div>

      {loading ? <Spinner /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tab === 'pending' && (
            pendingCustomers.length === 0
              ? <div className="empty-state"><div className="empty-icon">🎉</div><p>All deliveries done for today!</p></div>
              : pendingCustomers.map(c => <CustomerCard key={c.id} customer={c} isDelivered={false} />)
          )}
          {tab === 'delivered' && (
            deliveredCustomers.length === 0
              ? <div className="empty-state"><div className="empty-icon">🥛</div><p>No deliveries recorded yet</p></div>
              : deliveredCustomers.map(c => <CustomerCard key={c.id} customer={c} isDelivered={editingId !== c.id} />)
          )}
        </div>
      )}
    </Layout>
  )
}
