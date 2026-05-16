import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, UserSquare2, FileBarChart, Bell, Settings, Sprout } from 'lucide-react';

export default function Layout() {
  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <Sprout size={28} />
          AgroManage
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} end>
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
          <NavLink to="/farmers" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <Users size={20} /> Farmers (Material In)
          </NavLink>
          <NavLink to="/traders" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <UserSquare2 size={20} /> Traders (Material Out)
          </NavLink>
          <NavLink to="/reports" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <FileBarChart size={20} /> Reports & Cash Flow
          </NavLink>
        </nav>
      </aside>
      
      <main className="main-content">
        <header className="topbar">
          <div className="search-bar">
            {/* Optional search */}
          </div>
          <div className="topbar-actions flex-between" style={{ gap: '1.5rem' }}>
            <button className="btn-outline" style={{ border: 'none' }}><Bell size={20} /></button>
            <button className="btn-outline" style={{ border: 'none' }}><Settings size={20} /></button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '36px', height: '36px', background: 'var(--primary)', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>A</div>
              <span style={{ fontWeight: 500 }}>Admin</span>
            </div>
          </div>
        </header>
        
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
