import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  User, Mail, Phone, Lock, MapPin, Plus, Edit2, Trash2,
  CheckCircle, ShoppingBag, Package, RotateCcw, MapPinned, Eye, EyeOff
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const SIDEBAR = [
  { label: 'Profile', icon: User, path: '/profile' },
  { label: 'My Orders', icon: ShoppingBag, path: '/orders' },
  { label: 'Order Tracking', icon: Package, path: '/orders?tab=tracking' },
  { label: 'Order History', icon: ShoppingBag, path: '/orders?tab=history' },
  { label: 'Return Status', icon: RotateCcw, path: '/orders?tab=returns' },
  { label: 'Saved Addresses', icon: MapPinned, path: '/profile?tab=addresses' },
];

export default function ProfilePage({ auth }) {
  const { user, updateUser } = auth;
  const location = useLocation();
  const tab = new URLSearchParams(location.search).get('tab') || 'profile';

  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '', secondaryPhone: user?.secondaryPhone || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmNew: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({ label: 'Home', street: '', city: '', state: '', pincode: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/user/profile');
      setProfile({ name: data.name, phone: data.phone || '', secondaryPhone: data.secondaryPhone || '' });
      setAddresses(data.addresses || []);
    } catch {}
  };

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/user/profile', profile);
      updateUser(data);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally { setSaving(false); }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmNew) {
      toast.error('New passwords do not match'); return;
    }
    setSaving(true);
    try {
      await api.put('/user/password', { currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      toast.success('Password updated!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNew: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally { setSaving(false); }
  };

  const handleAddressSave = async () => {
    setSaving(true);
    try {
      if (editingAddress) {
        const { data } = await api.put(`/user/address/${editingAddress}`, addressForm);
        setAddresses(data);
        toast.success('Address updated!');
      } else {
        const { data } = await api.post('/user/address', addressForm);
        setAddresses(data);
        toast.success('Address added!');
      }
      setShowAddressForm(false);
      setEditingAddress(null);
      setAddressForm({ label: 'Home', street: '', city: '', state: '', pincode: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    } finally { setSaving(false); }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const { data } = await api.delete(`/user/address/${id}`);
      setAddresses(data);
      toast.success('Address deleted');
    } catch {
      toast.error('Failed to delete address');
    }
  };

  const startEditAddress = (addr) => {
    setAddressForm({ label: addr.label, street: addr.street, city: addr.city, state: addr.state, pincode: addr.pincode });
    setEditingAddress(addr._id);
    setShowAddressForm(true);
  };

  return (
    <div className="pt-32 md:pt-28 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            {/* User Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-extrabold flex-shrink-0">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-800 truncate text-sm">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {SIDEBAR.map(({ label, icon: Icon, path }) => (
                <Link
                  key={label}
                  to={path}
                  className={`flex items-center gap-3 px-4 py-3 text-sm hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0 ${location.pathname + location.search === path ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-gray-600'}`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3 space-y-5">
            {/* Profile Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-500" /> Personal Information
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">Full Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">Email (Read Only)</label>
                  <div className="flex items-center gap-2 px-4 py-2.5 border border-gray-100 rounded-xl bg-gray-50">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{user?.email}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">Primary Phone</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">Secondary Phone</label>
                  <input
                    type="tel"
                    value={profile.secondaryPhone}
                    onChange={e => setProfile(p => ({ ...p, secondaryPhone: e.target.value }))}
                    placeholder="Optional"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
              <button
                onClick={handleProfileSave}
                disabled={saving}
                className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-500" /> Change Password
              </h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { label: 'Current Password', key: 'currentPassword' },
                  { label: 'New Password', key: 'newPassword' },
                  { label: 'Confirm New Password', key: 'confirmNew' },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">{label}</label>
                    <div className="relative">
                      <input
                        type={showPwd ? 'text' : 'password'}
                        value={passwordForm[key]}
                        onChange={e => setPasswordForm(p => ({ ...p, [key]: e.target.value }))}
                        className="w-full px-4 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                      <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={handlePasswordChange}
                disabled={saving}
                className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all disabled:opacity-60"
              >
                {saving ? 'Updating...' : 'Update Password'}
              </button>
            </div>

            {/* Addresses */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-500" /> Saved Addresses
                  <span className="text-sm text-gray-400 font-normal">({addresses.length}/10)</span>
                </h2>
                {addresses.length < 10 && (
                  <button
                    onClick={() => { setShowAddressForm(true); setEditingAddress(null); setAddressForm({ label: 'Home', street: '', city: '', state: '', pincode: '' }); }}
                    className="flex items-center gap-1 text-sm text-blue-600 font-semibold hover:underline"
                  >
                    <Plus className="w-4 h-4" /> Add New
                  </button>
                )}
              </div>

              {/* Address Form */}
              {showAddressForm && (
                <div className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-100">
                  <h3 className="text-sm font-bold text-gray-800 mb-3">{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">Label</label>
                      <select
                        value={addressForm.label}
                        onChange={e => setAddressForm(p => ({ ...p, label: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none"
                      >
                        {['Home', 'Office', 'Other'].map(l => <option key={l}>{l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">Street</label>
                      <input type="text" value={addressForm.street} onChange={e => setAddressForm(p => ({ ...p, street: e.target.value }))} placeholder="Street address" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-400" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">City</label>
                      <input type="text" value={addressForm.city} onChange={e => setAddressForm(p => ({ ...p, city: e.target.value }))} placeholder="City" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-400" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">State</label>
                      <input type="text" value={addressForm.state} onChange={e => setAddressForm(p => ({ ...p, state: e.target.value }))} placeholder="State" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-400" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">Pincode</label>
                      <input type="text" value={addressForm.pincode} onChange={e => setAddressForm(p => ({ ...p, pincode: e.target.value }))} placeholder="6-digit pincode" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-400" />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={handleAddressSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-60">
                      {saving ? 'Saving...' : 'Save Address'}
                    </button>
                    <button onClick={() => setShowAddressForm(false)} className="border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {addresses.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-200" />
                  <p className="text-sm">No saved addresses</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {addresses.map((addr) => (
                    <div key={addr._id} className="border border-gray-100 rounded-xl p-4 relative hover:border-blue-200 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${addr.label === 'Home' ? 'bg-blue-100 text-blue-700' : addr.label === 'Office' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {addr.label}
                        </span>
                        <div className="flex gap-1">
                          <button onClick={() => startEditAddress(addr)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDeleteAddress(addr._id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{addr.street}</p>
                      <p className="text-sm text-gray-500">{addr.city}, {addr.state} - {addr.pincode}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}