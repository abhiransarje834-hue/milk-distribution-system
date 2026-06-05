import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { toast } from 'react-toastify'

export default function Settings() {
  const { user, logout } = useAuth()
  const { dark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
    toast.info('Logged out')
  }

  const backPath = user?.role === 'ADMIN' ? '/admin'
    : user?.role === 'DISTRIBUTOR' ? '/distributor' : '/delivery'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: 16 }}>
      <div style={{ maxWidth: 500, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button className="btn-icon" onClick={() => navigate(backPath)} style={{ fontSize: 20 }}>←</button>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Settings</h1>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--primary)', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 700
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{user?.name}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>@{user?.username}</div>
              <span className="badge badge-info" style={{ marginTop: 4 }}>{user?.role}</span>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
            <div>
              <div style={{ fontWeight: 600 }}>Dark Mode</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Toggle dark/light theme</div>
            </div>
            <button
              onClick={toggleTheme}
              style={{
                width: 52, height: 28, borderRadius: 14,
                background: dark ? 'var(--primary)' : 'var(--border)',
                position: 'relative', transition: 'background 0.3s', border: 'none', cursor: 'pointer'
              }}
            >
              <div style={{
                width: 22, height: 22, borderRadius: '50%', background: 'white',
                position: 'absolute', top: 3,
                left: dark ? 27 : 3, transition: 'left 0.3s'
              }} />
            </button>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>App Version</div>
          <div style={{ fontWeight: 600 }}>Milk Distribution Manager v1.0.0</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>PWA - Works Offline</div>
        </div>

        <button
          className="btn btn-danger"
          style={{ width: '100%', fontSize: 16, minHeight: 48 }}
          onClick={handleLogout}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  )
}
