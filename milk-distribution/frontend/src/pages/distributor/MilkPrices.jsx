import { useState, useEffect } from 'react'
import Layout from '../../components/common/Layout'
import Spinner from '../../components/common/Spinner'
import { distributorAPI } from '../../api'
import { toast } from 'react-toastify'

const NAV = [
  { path: '/distributor', icon: '🏠', label: 'Home' },
  { path: '/distributor/customers', icon: '👥', label: 'Customers' },
  { path: '/distributor/delivery-boys', icon: '🚴', label: 'Delivery' },
  { path: '/distributor/billing', icon: '💰', label: 'Billing' },
  { path: '/distributor/milk-prices', icon: '🥛', label: 'Prices' },
  { path: '/distributor/reports', icon: '📊', label: 'Reports' }
]

export default function MilkPrices() {
  const [prices, setPrices] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ COW: '', BUFFALO: '' })
  const [saving, setSaving] = useState({})

  const load = async () => {
    try {
      const { data } = await distributorAPI.getMilkPrices()
      const map = { COW: '', BUFFALO: '' }
      ;(data || []).forEach(p => { map[p.milkType] = p.pricePerLiter })
      setPrices(data || [])
      setForm(map)
    } catch { toast.error('Failed to load prices') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleUpdate = async (milkType) => {
    const price = form[milkType]
    if (!price || isNaN(price) || Number(price) < 1) {
      toast.error('Enter a valid price (min ₹1)')
      return
    }
    setSaving(s => ({ ...s, [milkType]: true }))
    try {
      await distributorAPI.updateMilkPrice({ milkType, pricePerLiter: parseFloat(price) })
      toast.success(`${milkType} milk price updated to ₹${price}/L`)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update price')
    } finally { setSaving(s => ({ ...s, [milkType]: false })) }
  }

  const types = [
    { key: 'COW', icon: '🐄', label: 'Cow Milk' },
    { key: 'BUFFALO', icon: '🐃', label: 'Buffalo Milk' }
  ]

  return (
    <Layout navItems={NAV} title="Milk Prices">
      <div className="page-header">
        <h1 className="page-title">Milk Prices</h1>
      </div>

      {loading ? <Spinner /> : (
        <div style={{ display: 'grid', gap: 16, maxWidth: 500 }}>
          {types.map(({ key, icon, label }) => (
            <div key={key} className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 32 }}>{icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{label}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    Current: {form[key] ? `₹${Number(form[key]).toFixed(2)}/L` : <span style={{ color: 'var(--danger)' }}>Not set</span>}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>₹</span>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    placeholder="Enter price per liter"
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{ paddingLeft: 28 }}
                  />
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => handleUpdate(key)}
                  disabled={saving[key]}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {saving[key] ? 'Saving...' : 'Update'}
                </button>
              </div>
            </div>
          ))}

          {prices.length > 0 && (
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Current Active Prices</h3>
              {prices.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span>{p.milkType === 'COW' ? '🐄 Cow' : '🐃 Buffalo'}</span>
                  <strong style={{ color: 'var(--primary)' }}>₹{Number(p.pricePerLiter).toFixed(2)}/L</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Layout>
  )
}
