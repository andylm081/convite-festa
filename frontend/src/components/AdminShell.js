import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Trophy,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/guests', label: 'Convidados', icon: Users },
  { path: '/admin/settings', label: 'Configurações', icon: Settings },
];

export default function AdminShell({ children, title }) {
  const { admin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="theme-admin min-h-screen flex" style={{ background: '#f8fafc' }}>
      {/* Desktop Sidebar */}
      <aside
        data-testid="admin-sidebar"
        className="hidden lg:flex flex-col w-56 min-h-screen admin-sidebar fixed top-0 left-0 z-30"
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
              <Trophy size={16} className="text-green-900" />
            </div>
            <div>
              <p className="text-white text-sm font-bold leading-tight">Copa & Festa</p>
              <p className="text-green-300 text-xs">Painel Admin</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-white/15 text-white'
                    : 'text-green-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon size={17} />
                {item.label}
                {active && <ChevronRight size={14} className="ml-auto opacity-60" />}
              </Link>
            );
          })}
        </nav>

        {/* User info + logout */}
        <div className="px-3 py-4 border-t border-white/10">
          <p className="text-green-300 text-xs px-3 mb-2 truncate">{admin?.email}</p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-green-200 hover:bg-white/10 hover:text-white transition-all w-full"
            data-testid="admin-logout-button"
          >
            <LogOut size={17} />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header
        data-testid="admin-topbar"
        className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 flex items-center justify-between px-4 h-14"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-green-800 rounded-lg flex items-center justify-center">
            <Trophy size={14} className="text-yellow-400" />
          </div>
          <span className="font-bold text-gray-800 text-sm">Copa & Festa</span>
        </div>
        <button onClick={() => setMobileOpen(true)} className="p-2">
          <Menu size={20} className="text-gray-700" />
        </button>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
            <motion.div
              className="absolute left-0 top-0 bottom-0 w-56 admin-sidebar flex flex-col"
              initial={{ x: -224 }}
              animate={{ x: 0 }}
              exit={{ x: -224 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
                    <Trophy size={16} className="text-green-900" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">Copa & Festa</p>
                    <p className="text-green-300 text-xs">Admin</p>
                  </div>
                </div>
                <button onClick={() => setMobileOpen(false)} className="text-green-300">
                  <X size={18} />
                </button>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-1">
                {NAV_ITEMS.map(item => {
                  const active = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        active ? 'bg-white/15 text-white' : 'text-green-200 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <item.icon size={17} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="px-3 py-4 border-t border-white/10">
                <p className="text-green-300 text-xs px-3 mb-2 truncate">{admin?.email}</p>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-green-200 hover:bg-white/10 hover:text-white transition-all w-full"
                >
                  <LogOut size={17} />
                  Sair
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 lg:ml-56 pt-14 lg:pt-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {title && (
            <h1 className="text-xl font-bold text-gray-800 mb-6">{title}</h1>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
