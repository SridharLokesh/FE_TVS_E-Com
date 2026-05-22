import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Package, ShoppingBag, TrendingUp,
  LogOut, LayoutDashboard, Settings, ShieldCheck
} from 'lucide-react';
import api from '../../utils/api';

export default function AdminDashboard({ auth }) {
  const { user, logout } = auth;
  const navigate = useNavigate();
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const CARDS = [
    { label: 'Total Users',    icon: Users,      value: stats?.totalUsers,    bg: 'bg-blue-50',   icon_c: 'text-blue-600'   },
    { label: 'Total Products', icon: Package,    value: stats?.totalProducts, bg: 'bg-green-50',  icon_c: 'text-green-600'  },
    { label: 'Total Orders',   icon: ShoppingBag,value: stats?.totalOrders,   bg: 'bg-orange-50', icon_c: 'text-orange-600' },
    {
      label: 'Revenue',
      icon: TrendingUp,
      value: stats?.totalRevenue != null ? `₹${Number(stats.totalRevenue).toLocaleString('en-IN')}` : '₹0',
      bg: 'bg-purple-50', icon_c: 'text-purple-600'
    },
  ];

  return (
    <div className="page-wrapper min-h-screen">

      {/* Hero header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 mb-8 text-white
                      flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
            <LayoutDashboard className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <ShieldCheck className="w-4 h-4 text-green-400" />
              <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">
                Admin Access
              </span>
            </div>
            <h1 className="text-2xl font-extrabold">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm">Welcome, {user?.name} 👋</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600
                     text-white font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1,2,3,4].map(i => (
            <div key={i} className="card h-28 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {CARDS.map(({ label, icon: Icon, value, bg, icon_c }) => (
            <div key={label} className={`${bg} rounded-2xl p-5 border border-white shadow-sm`}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-600">{label}</p>
                <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <Icon className={`w-5 h-5 ${icon_c}`} />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-gray-900">
                {value ?? '—'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Coming soon panels */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { title: 'Manage Products', desc: 'Add, edit, delete listings',   icon: Package,     c: 'text-blue-500'   },
          { title: 'Manage Orders',   desc: 'View & update order statuses', icon: ShoppingBag, c: 'text-orange-500' },
          { title: 'Manage Users',    desc: 'View registered users',        icon: Users,       c: 'text-purple-500' },
        ].map(({ title, desc, icon: Icon, c }) => (
          <div key={title} className="card p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-3">
              <Icon className={`w-6 h-6 ${c}`} />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-400 mb-4">{desc}</p>
            <span className="text-xs font-semibold bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
              Coming Soon
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}