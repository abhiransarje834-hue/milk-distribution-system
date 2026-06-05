import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.username, form.password)
      toast.success(`Welcome, ${user.name}!`)
      if (user.role === 'ADMIN') navigate('/admin')
      else if (user.role === 'DISTRIBUTOR') navigate('/distributor')
      else navigate('/delivery')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg)', padding: 16
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div className="card" style={{ padding: 32 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 56, marginBottom: 8 }}>🥛</div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)' }}>MilkDist</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Milk Distribution Manager</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                placeholder="Enter username"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                required
                autoComplete="username"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 8, fontSize: 16, minHeight: 48 }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: 20, padding: 12, background: 'var(--surface2)', borderRadius: 8, fontSize: 12 }}>
            <strong>Demo:</strong> admin / admin123
          </div>
        </div>
      </div>
    </div>
  )
}
