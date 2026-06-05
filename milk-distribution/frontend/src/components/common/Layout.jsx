import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

export default function Layout({ children, navItems, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const { dark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="app-layout">
      {/* Sidebar Overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <span className="logo-icon">🥛</span>
          <div>
            <div className="logo-text">MilkDist</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{user?.name}</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: '12px 0', borderTop: '1px solid var(--border)' }}>
          <button className="nav-item" style={{ width: '100%' }} onClick={handleLogout}>
            <span className="nav-icon">🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Header */}
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn-icon" onClick={() => setSidebarOpen(o => !o)}>☰</button>
          <span style={{ fontWeight: 700, fontSize: 16 }}>{title}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="btn-icon" onClick={toggleTheme} title="Toggle theme">
            {dark ? '☀️' : '🌙'}
          </button>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--primary)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 14
          }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>

      {/* Bottom Nav (mobile) */}
      <nav className="bottom-nav">
        <div className="bottom-nav-items">
          {navItems.slice(0, 5).map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
