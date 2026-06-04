import { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, Users, ShoppingBag, Store, Bell,
  CheckCircle, XCircle, Trash2, ToggleLeft, ToggleRight,
  TrendingUp, Package, IndianRupee, AlertTriangle,
  RefreshCw, X, Plus, Search, Send, Edit3, Key,
  Eye, EyeOff, Copy, Mail, Tag, ChevronDown, ChevronUp,
  GripVertical, ArrowUp, ArrowDown, Save, Layers,
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const STATUS_BADGE = {
  Placed: 'bg-gray-100 text-[#0a1f44]', Processing: 'bg-gray-100 text-[#0a1f44]',
  Packed: 'bg-gray-100 text-[#0a1f44]', Shipped: 'bg-gray-100 text-[#0a1f44]',
  Delivered: 'bg-[#0a1f44]/10 text-[#0a1f44]', Cancelled: 'bg-red-50 text-red-500',
  Returned: 'bg-red-50 text-red-500', Refunded: 'bg-gray-100 text-gray-600',
};
const ORDER_STATUSES = ['Placed','Processing','Packed','Shipped','Delivered','Cancelled','Returned','Refunded'];
const INDIAN_STATES  = ['Tamil Nadu','Maharashtra','Karnataka','Telangana','Gujarat','Delhi','Uttar Pradesh','Rajasthan','Punjab','Kerala','West Bengal','Madhya Pradesh','Bihar','Odisha','Assam'];
const EMPTY_DEALER   = { name:'', email:'', phone:'', password:'', dealerId:'', businessName:'', businessLocation:'', state:'' };
const EMPTY_CAT      = { name:'', icon:'', description:'', showInNav:true, showInFooter:true, isActive:true, subCategories:[] };

/* ── Field ── */
function Field({ label, value, onChange, type='text', placeholder='', required=false, mono=false }) {
  const [show, setShow] = useState(false);
  const isPass = type === 'password';
  return (
    <div>
      <label className="label">{label}{required && ' *'}</label>
      <div className="relative">
        <input type={isPass ? (show ? 'text' : 'password') : type}
          value={value} onChange={onChange} placeholder={placeholder}
          className={`input-field text-sm ${mono ? 'font-mono' : ''}`} />
        {isPass && (
          <button type="button" onClick={() => setShow(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Category Manager Tab ── */
function CategoryManager() {
  const [cats, setCats]           = useState([]);
  const [loading, setLoading]     = useState(false);
  const [showForm, setShowForm]   = useState(false);
  const [editingCat, setEditingCat] = useState(null); // null = create, obj = edit
  const [form, setForm]           = useState(EMPTY_CAT);
  const [saving, setSaving]       = useState(false);
  const [newSubName, setNewSubName] = useState('');

  const fetchCats = useCallback(async () => {
    setLoading(true);
    try { const { data } = await api.get('/categories/admin/all'); setCats(data); }
    catch { toast.error('Failed to load categories'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCats(); }, [fetchCats]);

  const openCreate = () => {
    setForm(EMPTY_CAT); setEditingCat(null); setShowForm(true); setNewSubName('');
  };

  const openEdit = (cat) => {
    setForm({
      name: cat.name, icon: cat.icon || '', description: cat.description || '',
      showInNav: cat.showInNav, showInFooter: cat.showInFooter, isActive: cat.isActive,
      subCategories: cat.subCategories.map(s => ({ ...s })),
    });
    setEditingCat(cat); setShowForm(true); setNewSubName('');
  };

  const cancelForm = () => { setShowForm(false); setEditingCat(null); setNewSubName(''); };

  const addSub = () => {
    if (!newSubName.trim()) return;
    setForm(f => ({
      ...f,
      subCategories: [
        ...f.subCategories,
        { name: newSubName.trim(), slug: newSubName.trim().toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,''), order: f.subCategories.length, isActive: true },
      ],
    }));
    setNewSubName('');
  };

  const removeSub = (i) => setForm(f => ({ ...f, subCategories: f.subCategories.filter((_, idx) => idx !== i) }));

  const moveSub = (i, dir) => {
    setForm(f => {
      const arr = [...f.subCategories];
      const target = i + dir;
      if (target < 0 || target >= arr.length) return f;
      [arr[i], arr[target]] = [arr[target], arr[i]];
      return { ...f, subCategories: arr.map((s, idx) => ({ ...s, order: idx })) };
    });
  };

  const saveCat = async () => {
    if (!form.name.trim()) { toast.error('Category name is required'); return; }
    setSaving(true);
    try {
      if (editingCat) {
        await api.put(`/categories/${editingCat._id}`, form);
        toast.success('Category updated!');
      } else {
        await api.post('/categories', form);
        toast.success('Category created!');
      }
      fetchCats(); cancelForm();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const deleteCat = async (cat) => {
    if (!window.confirm(`Delete category "${cat.name}"? Products in this category will NOT be deleted.`)) return;
    try { await api.delete(`/categories/${cat._id}`); toast.success('Deleted'); fetchCats(); }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  const toggleCatActive = async (cat) => {
    try {
      await api.put(`/categories/${cat._id}`, { isActive: !cat.isActive });
      fetchCats();
    } catch { toast.error('Failed'); }
  };

  const moveCategory = async (idx, dir) => {
    const arr = [...cats];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    const reorder = arr.map((c, i) => ({ _id: c._id, navOrder: i }));
    try {
      await api.put('/categories/reorder', { order: reorder });
      fetchCats();
    } catch { toast.error('Reorder failed'); }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#0a1f44]" /> Categories & Sub-categories
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">These appear in the Navbar and Footer. Drag arrows to reorder.</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm px-4 py-2.5 flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Category
        </button>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <div className="card p-5 border-2 border-[#0a1f44]/20 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-gray-900 text-sm">
              {editingCat ? `Edit — ${editingCat.name}` : 'New Category'}
            </h4>
            <button onClick={cancelForm} className="p-1.5 hover:bg-gray-100 rounded-lg">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Name *</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                placeholder="e.g. Tyres & Wheels" className="input-field text-sm" />
            </div>
            <div>
              <label className="label">Icon (emoji)</label>
              <input type="text" value={form.icon} onChange={e => setForm(f => ({...f, icon: e.target.value}))}
                placeholder="e.g. 🔧" className="input-field text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description (optional)</label>
              <input type="text" value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
                placeholder="Short description shown in footer" className="input-field text-sm" />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-4">
            {[
              { key: 'showInNav',    label: 'Show in Navbar' },
              { key: 'showInFooter', label: 'Show in Footer' },
              { key: 'isActive',     label: 'Active' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                <div onClick={() => setForm(f => ({...f, [key]: !f[key]}))}
                  className={`w-10 h-5 rounded-full transition-colors relative ${form[key] ? 'bg-[#0a1f44]' : 'bg-gray-200'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form[key] ? 'left-5' : 'left-0.5'}`} />
                </div>
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>

          {/* Sub-categories */}
          <div>
            <label className="label">Sub-categories</label>
            <div className="space-y-1.5 mb-2">
              {form.subCategories.map((s, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl">
                  <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  <span className="text-sm text-gray-700 flex-1">{s.name}</span>
                  <button onClick={() => moveSub(i, -1)} disabled={i === 0}
                    className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30">
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => moveSub(i, 1)} disabled={i === form.subCategories.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30">
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => removeSub(i)} className="p-1 text-red-400 hover:text-red-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {form.subCategories.length === 0 && (
                <p className="text-xs text-gray-400 py-2">No sub-categories yet</p>
              )}
            </div>
            <div className="flex gap-2">
              <input type="text" value={newSubName} onChange={e => setNewSubName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSub()}
                placeholder="Sub-category name (e.g. Front Tyre)" className="input-field text-sm flex-1" />
              <button onClick={addSub} className="btn-primary text-sm px-4 flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={cancelForm} className="btn-secondary flex-1 py-2.5 text-sm">Cancel</button>
            <button onClick={saveCat} disabled={saving}
              className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2">
              {saving
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
                : <><Save className="w-4 h-4" /> {editingCat ? 'Save Changes' : 'Create Category'}</>}
            </button>
          </div>
        </div>
      )}

      {/* Category list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-16 rounded-2xl bg-gray-100 animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {cats.map((cat, idx) => (
            <div key={cat._id} className={`card p-4 ${!cat.isActive ? 'opacity-50' : ''}`}>
              <div className="flex items-start gap-3">
                {/* Reorder */}
                <div className="flex flex-col gap-1 flex-shrink-0 mt-0.5">
                  <button onClick={() => moveCategory(idx, -1)} disabled={idx === 0}
                    className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-20">
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => moveCategory(idx, 1)} disabled={idx === cats.length - 1}
                    className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-20">
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Icon + info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {cat.icon && <span className="text-xl">{cat.icon}</span>}
                    <span className="font-bold text-gray-900">{cat.name}</span>
                    {!cat.isActive && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">Inactive</span>}
                    {cat.showInNav && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">Nav</span>}
                    {cat.showInFooter && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Footer</span>}
                  </div>
                  {cat.subCategories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {cat.subCategories.filter(s => s.isActive).map(s => (
                        <span key={s._id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {s.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => toggleCatActive(cat)} title={cat.isActive ? 'Deactivate' : 'Activate'}
                    className={`p-1.5 rounded-lg ${cat.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                    {cat.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  </button>
                  <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteCat(cat)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {cats.length === 0 && !loading && (
            <div className="card p-10 text-center text-gray-400 text-sm">
              No categories yet. Click "New Category" to create the first one.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ════════ MAIN ADMIN DASHBOARD ════════ */
export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);

  // Users
  const [users, setUsers]          = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage]     = useState(1);
  const [userTotal, setUserTotal]   = useState(0);

  // Dealers
  const [dealers, setDealers]                    = useState([]);
  const [dealerRequests, setDealerRequests]       = useState([]);
  const [dealerSearch, setDealerSearch]           = useState('');
  const [dealerStateFilter, setDealerStateFilter] = useState('');
  const [showDealerModal, setShowDealerModal]     = useState(false);
  const [dealerModalMode, setDealerModalMode]     = useState('create');
  const [selectedDealer, setSelectedDealer]       = useState(null);
  const [selectedRequest, setSelectedRequest]     = useState(null);
  const [dealerForm, setDealerForm]               = useState(EMPTY_DEALER);
  const [resetPassword, setResetPassword]         = useState('');
  const [approveForm, setApproveForm]             = useState({ dealerId:'', password:'' });
  const [savingDealer, setSavingDealer]           = useState(false);

  // Orders
  const [orders, setOrders]                = useState([]);
  const [orderStatusFilter, setOrderFilter] = useState('');
  const [orderPage, setOrderPage]           = useState(1);
  const [orderTotal, setOrderTotal]         = useState(0);
  const [selectedOrder, setSelectedOrder]   = useState(null);
  const [orderUpdateForm, setOrderUpdateForm] = useState({ status:'', trackingNumber:'', notes:'' });

  // Notify
  const [notifForm, setNotifForm] = useState({ type:'best_deal', title:'', message:'', link:'', targetRole:'user' });
  const [loadingState, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    try { const { data } = await api.get('/admin/stats'); setStats(data); } catch {}
  }, []);

  const fetchUsers = useCallback(async (search='', page=1) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/users?role=user&search=${encodeURIComponent(search)}&page=${page}&limit=15`);
      setUsers(data.users); setUserTotal(data.total);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, []);

  const fetchDealers = useCallback(async (search='', state='') => {
    try {
      const q = new URLSearchParams();
      if (search) q.set('search', search);
      if (state)  q.set('state', state);
      const { data } = await api.get(`/dealer/all?${q}`);
      setDealers(data);
    } catch {}
  }, []);

  const fetchDealerRequests = useCallback(async () => {
    try { const { data } = await api.get('/dealer/requests'); setDealerRequests(data); } catch {}
  }, []);

  const fetchOrders = useCallback(async (status='', page=1) => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page, limit: 15 });
      if (status) q.set('status', status);
      const { data } = await api.get(`/admin/orders?${q}`);
      setOrders(data.orders); setOrderTotal(data.total);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStats(); fetchDealerRequests(); }, []);

  useEffect(() => {
    if (tab === 'users')   fetchUsers(userSearch, userPage);
    if (tab === 'dealers') { fetchDealers(dealerSearch, dealerStateFilter); fetchDealerRequests(); }
    if (tab === 'orders')  fetchOrders(orderStatusFilter, orderPage);
  }, [tab, userPage, orderPage]);

  const toggleUser = async (id) => {
    try {
      const { data } = await api.put(`/admin/users/${id}/toggle`);
      setUsers(p => p.map(u => u._id === id ? { ...u, isActive: data.isActive } : u));
      toast.success(`User ${data.isActive ? 'activated' : 'deactivated'}`);
    } catch { toast.error('Action failed'); }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Permanently delete this user?')) return;
    try { await api.delete(`/admin/users/${id}`); fetchUsers(userSearch, userPage); toast.success('Deleted'); }
    catch { toast.error('Delete failed'); }
  };

  const openCreate = () => { setDealerForm(EMPTY_DEALER); setDealerModalMode('create'); setSelectedDealer(null); setShowDealerModal(true); };
  const openEdit   = (d)  => { setDealerForm({ name:d.name, email:d.email, phone:d.phone||'', password:'', dealerId:d.dealerId, businessName:d.businessName||'', businessLocation:d.businessLocation||'', state:d.dealerState||'' }); setSelectedDealer(d); setDealerModalMode('edit'); setShowDealerModal(true); };
  const openReset  = (d)  => { setSelectedDealer(d); setResetPassword(''); setDealerModalMode('reset'); setShowDealerModal(true); };
  const openApprove= (req)=> { setSelectedRequest(req); setApproveForm({ dealerId:`TVSD-${String(Math.floor(Math.random()*9000)+1000)}`, password:'' }); setDealerModalMode('approve'); setShowDealerModal(true); };
  const setDF = (k) => (e) => setDealerForm(p => ({ ...p, [k]: e.target.value }));

  const saveDealer = async () => {
    setSavingDealer(true);
    try {
      if (dealerModalMode === 'create') {
        const { data } = await api.post('/dealer/create', dealerForm);
        toast.success(data.message); fetchDealers(dealerSearch, dealerStateFilter); fetchStats();
      } else if (dealerModalMode === 'edit') {
        const { data } = await api.put(`/dealer/${selectedDealer._id}/edit`, dealerForm);
        toast.success(data.message); fetchDealers(dealerSearch, dealerStateFilter);
      } else if (dealerModalMode === 'reset') {
        if (!resetPassword || resetPassword.length < 6) { toast.error('Min 6 characters'); return; }
        const { data } = await api.put(`/dealer/${selectedDealer._id}/reset-password`, { newPassword: resetPassword });
        toast.success(data.message);
      } else if (dealerModalMode === 'approve') {
        if (!approveForm.dealerId || !approveForm.password) { toast.error('Dealer ID and password required'); return; }
        const { data } = await api.post(`/dealer/approve/${selectedRequest._id}`, approveForm);
        toast.success(data.message); fetchDealerRequests(); fetchDealers(dealerSearch, dealerStateFilter); fetchStats();
      }
      setShowDealerModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
    finally { setSavingDealer(false); }
  };

  const deleteDealer = async (dealer) => {
    if (!window.confirm(`Delete dealer ${dealer.dealerId}?`)) return;
    try { const { data } = await api.delete(`/dealer/${dealer._id}`); toast.success(data.message); fetchDealers(dealerSearch, dealerStateFilter); fetchStats(); }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  const toggleDealer = async (dealer) => {
    try { const { data } = await api.put(`/dealer/${dealer.dealerId}/toggle`); toast.success(data.message); fetchDealers(dealerSearch, dealerStateFilter); }
    catch { toast.error('Failed'); }
  };

  const rejectRequest = async (id) => {
    if (!window.confirm('Reject this dealer request?')) return;
    try { await api.put(`/dealer/reject/${id}`); fetchDealerRequests(); toast.success('Rejected'); }
    catch { toast.error('Failed'); }
  };

  const updateOrder = async () => {
    if (!orderUpdateForm.status) { toast.error('Select a status'); return; }
    try { await api.put(`/orders/${selectedOrder._id}/status`, orderUpdateForm); toast.success('Order updated'); setSelectedOrder(null); fetchOrders(orderStatusFilter, orderPage); fetchStats(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const sendNotification = async () => {
    if (!notifForm.title.trim() || !notifForm.message.trim()) { toast.error('Title and message required'); return; }
    try { const { data } = await api.post('/admin/notifications', notifForm); toast.success(data.message); setNotifForm({ type:'best_deal', title:'', message:'', link:'', targetRole:'user' }); }
    catch { toast.error('Failed to send'); }
  };

  const copyToClipboard = (text) => navigator.clipboard.writeText(text).then(() => toast.success('Copied!'));

  const pendingRequests = dealerRequests.filter(r => r.status === 'pending');

  const TABS = [
    { id:'overview',    label:'Overview',    icon: LayoutDashboard },
    { id:'categories',  label:'Categories',  icon: Tag },
    { id:'users',       label:'Users',       icon: Users },
    { id:'dealers',     label:`Dealers${pendingRequests.length ? ` (${pendingRequests.length})` : ''}`, icon: Store },
    { id:'orders',      label:'Orders',      icon: ShoppingBag },
    { id:'notify',      label:'Broadcast',   icon: Bell },
  ];

  const MODAL_META = {
    create:  { title:'Create New Dealer',         btnLabel:'Create & Email Credentials', btnClass:'bg-green-600 hover:bg-green-700' },
    edit:    { title:'Edit Dealer Details',        btnLabel:'Save Changes',               btnClass:'bg-[#0a1f44] hover:bg-[#0d2657]' },
    reset:   { title:'Reset Dealer Password',      btnLabel:'Reset & Email New Password', btnClass:'bg-orange-600 hover:bg-orange-700' },
    approve: { title:'Approve Dealer Application', btnLabel:'Approve & Send Credentials', btnClass:'bg-green-600 hover:bg-green-700' },
  };

  return (
    <div className="page-wrapper space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-[#0a1f44]" /> Admin Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">TVS AutoParts — Full Platform Control</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1.5 rounded-2xl overflow-x-auto no-scrollbar">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all
              ${tab === id ? 'bg-white shadow text-[#0a1f44]' : 'text-gray-500 hover:text-gray-700'}`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label:'Total Users',        value: stats?.totalUsers    ?? '—', icon: Users,         color:'bg-[#0a1f44]' },
              { label:'Active Users',       value: stats?.activeUsers   ?? '—', icon: CheckCircle,   color:'bg-[#0a1f44]' },
              { label:'Total Dealers',      value: stats?.totalDealers  ?? '—', icon: Store,         color:'bg-[#0a1f44]' },
              { label:'Revenue',            value:`₹${(stats?.totalRevenue||0).toLocaleString('en-IN')}`, icon: IndianRupee, color:'bg-[#0a1f44]' },
              { label:'Total Orders',       value: stats?.totalOrders   ?? '—', icon: ShoppingBag,   color:'bg-[#0a1f44]' },
              { label:'Delivered',          value: stats?.deliveredOrders ?? '—', icon: CheckCircle, color:'bg-[#0a1f44]' },
              { label:'Cancelled',          value: stats?.cancelledOrders ?? '—', icon: XCircle,     color:'bg-red-500' },
              { label:'Pending Applications', value: stats?.pendingDealerRequests ?? '—', icon: AlertTriangle, color:'bg-[#0a1f44]' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="card p-5">
                <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-xl font-black text-gray-900">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="card p-5">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Package className="w-4 h-4 text-[#0a1f44]" /> Products by Category</h3>
              {stats?.categoryStats?.map(({ _id, count }) => (
                <div key={_id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0 text-sm">
                  <span className="text-gray-700">{_id}</span><span className="font-bold text-[#0a1f44]">{count}</span>
                </div>
              ))}
            </div>
            <div className="card p-5">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-[#0a1f44]" /> Order Status</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(stats?.orderStatusBreakdown || {}).map(([status, count]) => (
                  <div key={status} className={`rounded-xl p-3 text-center ${STATUS_BADGE[status] || 'bg-gray-100 text-gray-600'}`}>
                    <p className="text-lg font-black">{count}</p><p className="text-xs">{status}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 mb-4">Recent Orders</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-xs text-gray-500 uppercase border-b border-gray-100">
                  <th className="text-left pb-2">Invoice</th><th className="text-left pb-2">Customer</th>
                  <th className="text-left pb-2">Amount</th><th className="text-left pb-2">Status</th><th className="text-left pb-2">Date</th>
                </tr></thead>
                <tbody>
                  {(stats?.recentOrders || []).map(o => (
                    <tr key={o._id} className="border-b border-gray-50 text-sm">
                      <td className="py-2 font-mono text-xs text-gray-400">{o.invoiceNumber}</td>
                      <td className="py-2 font-medium">{o.user?.name}</td>
                      <td className="py-2 font-bold">₹{o.totalPrice?.toLocaleString('en-IN')}</td>
                      <td className="py-2"><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_BADGE[o.orderStatus]}`}>{o.orderStatus}</span></td>
                      <td className="py-2 text-gray-400 text-xs">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── CATEGORIES ── */}
      {tab === 'categories' && <CategoryManager />}

      {/* ── USERS ── */}
      {tab === 'users' && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input type="text" placeholder="Search by name or email…" value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchUsers(userSearch, 1)}
                className="input-field pl-9 text-sm" />
            </div>
            <button onClick={() => fetchUsers(userSearch, 1)} className="btn-primary text-sm px-4 py-2.5"><Search className="w-4 h-4" /></button>
          </div>
          <p className="text-sm text-gray-500">{userTotal} total customers</p>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr className="text-xs text-gray-500 uppercase">
                    <th className="text-left px-4 py-3">User</th><th className="text-left px-4 py-3">Phone</th>
                    <th className="text-left px-4 py-3">Joined</th><th className="text-left px-4 py-3">Status</th><th className="text-left px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3"><p className="font-semibold">{u.name}</p><p className="text-xs text-gray-400">{u.email}</p></td>
                      <td className="px-4 py-3 text-xs text-gray-600">{u.phone || '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-bold ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => toggleUser(u._id)} className={`p-1.5 rounded-lg ${u.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                            {u.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                          </button>
                          <button onClick={() => deleteUser(u._id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <button disabled={userPage<=1} onClick={() => setUserPage(p=>p-1)} className="btn-secondary text-sm px-4 py-2 disabled:opacity-40">← Prev</button>
            <span className="text-sm text-gray-500">Page {userPage} · {userTotal} users</span>
            <button disabled={userPage*15>=userTotal} onClick={() => setUserPage(p=>p+1)} className="btn-secondary text-sm px-4 py-2 disabled:opacity-40">Next →</button>
          </div>
        </div>
      )}

      {/* ── DEALERS ── */}
      {tab === 'dealers' && (
        <div className="space-y-6">
          {pendingRequests.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-yellow-500" /> Pending Applications ({pendingRequests.length})</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {pendingRequests.map(req => (
                  <div key={req._id} className="card p-5 border-l-4 border-yellow-400">
                    <p className="font-bold text-gray-900">{req.name}</p>
                    <p className="text-xs text-gray-400">{req.email} · {req.phone}</p>
                    <p className="text-sm text-gray-700 mt-1"><strong>{req.businessName}</strong></p>
                    <p className="text-xs text-gray-500">📍 {req.businessLocation}, {req.state}</p>
                    {req.message && <p className="text-xs text-gray-400 mt-1 italic">"{req.message}"</p>}
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => openApprove(req)} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-xl text-xs font-bold hover:bg-green-200"><CheckCircle className="w-3.5 h-3.5" /> Approve</button>
                      <button onClick={() => rejectRequest(req._id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-600 rounded-xl text-xs font-bold hover:bg-red-200"><XCircle className="w-3.5 h-3.5" /> Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-bold text-gray-900 flex-1">Dealers ({dealers.length})</h3>
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" /><input type="text" placeholder="Search dealers…" value={dealerSearch} onChange={e => setDealerSearch(e.target.value)} onKeyDown={e => e.key==='Enter' && fetchDealers(dealerSearch, dealerStateFilter)} className="input-field pl-9 text-sm w-52" /></div>
            <select value={dealerStateFilter} onChange={e => { setDealerStateFilter(e.target.value); fetchDealers(dealerSearch, e.target.value); }} className="input-field text-sm py-2 w-44"><option value="">All States</option>{INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}</select>
            <button onClick={openCreate} className="btn-primary text-sm px-4 py-2.5 flex items-center gap-2"><Plus className="w-4 h-4" /> Create Dealer</button>
          </div>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100"><tr className="text-xs text-gray-500 uppercase"><th className="text-left px-4 py-3">Dealer</th><th className="text-left px-4 py-3">Dealer ID</th><th className="text-left px-4 py-3">Location</th><th className="text-left px-4 py-3">Status</th><th className="text-left px-4 py-3">Joined</th><th className="text-left px-4 py-3">Actions</th></tr></thead>
                <tbody>
                  {dealers.map(d => (
                    <tr key={d._id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3"><p className="font-semibold">{d.businessName||d.name}</p><p className="text-xs text-gray-400">{d.email}</p></td>
                      <td className="px-4 py-3"><div className="flex items-center gap-1.5"><span className="font-mono text-sm font-bold text-[#0a1f44]">{d.dealerId}</span><button onClick={() => copyToClipboard(d.dealerId)} className="text-gray-300 hover:text-gray-600"><Copy className="w-3.5 h-3.5" /></button></div></td>
                      <td className="px-4 py-3 text-xs text-gray-500">{d.businessLocation}, {d.dealerState}</td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-bold ${d.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{d.isActive ? 'Active' : 'Suspended'}</span></td>
                      <td className="px-4 py-3 text-xs text-gray-400">{new Date(d.createdAt).toLocaleDateString('en-IN')}</td>
                      <td className="px-4 py-3"><div className="flex items-center gap-1.5">
                        <button onClick={() => toggleDealer(d)} className={`p-1.5 rounded-lg ${d.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}>{d.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}</button>
                        <button onClick={() => openEdit(d)} className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => openReset(d)} className="p-1.5 rounded-lg text-orange-500 hover:bg-orange-50"><Key className="w-4 h-4" /></button>
                        <button onClick={() => deleteDealer(d)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                      </div></td>
                    </tr>
                  ))}
                  {dealers.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm">No dealers found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── ORDERS ── */}
      {tab === 'orders' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {['', ...ORDER_STATUSES].map(s => (
              <button key={s} onClick={() => { setOrderFilter(s); setOrderPage(1); fetchOrders(s,1); }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${orderStatusFilter===s ? 'bg-[#0a1f44] text-white border-[#0a1f44]' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                {s || 'All'}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500">{orderTotal} orders</p>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100"><tr className="text-xs text-gray-500 uppercase"><th className="text-left px-4 py-3">Invoice</th><th className="text-left px-4 py-3">Customer</th><th className="text-left px-4 py-3">Amount</th><th className="text-left px-4 py-3">Status</th><th className="text-left px-4 py-3">Date</th><th className="text-left px-4 py-3">Action</th></tr></thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o._id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-400">{o.invoiceNumber}</td>
                      <td className="px-4 py-3"><p className="font-medium">{o.user?.name}</p><p className="text-xs text-gray-400">{o.user?.email}</p></td>
                      <td className="px-4 py-3 font-bold">₹{o.totalPrice?.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-bold ${STATUS_BADGE[o.orderStatus]}`}>{o.orderStatus}</span></td>
                      <td className="px-4 py-3 text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                      <td className="px-4 py-3"><button onClick={() => { setSelectedOrder(o); setOrderUpdateForm({ status:o.orderStatus, trackingNumber:o.trackingNumber||'', notes:o.notes||'' }); }} className="p-1.5 rounded-lg text-[#0a1f44] hover:bg-blue-50"><Edit3 className="w-4 h-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <button disabled={orderPage<=1} onClick={() => setOrderPage(p=>p-1)} className="btn-secondary text-sm px-4 py-2 disabled:opacity-40">← Prev</button>
            <span className="text-sm text-gray-500">Page {orderPage} · {orderTotal} orders</span>
            <button disabled={orderPage*15>=orderTotal} onClick={() => setOrderPage(p=>p+1)} className="btn-secondary text-sm px-4 py-2 disabled:opacity-40">Next →</button>
          </div>
        </div>
      )}

      {/* ── BROADCAST ── */}
      {tab === 'notify' && (
        <div className="max-w-xl space-y-5">
          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-gray-900">Broadcast Notification</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Target</label><select value={notifForm.targetRole} onChange={e=>setNotifForm(p=>({...p,targetRole:e.target.value}))} className="input-field text-sm"><option value="user">All Customers</option><option value="dealer">All Dealers</option></select></div>
              <div><label className="label">Type</label><select value={notifForm.type} onChange={e=>setNotifForm(p=>({...p,type:e.target.value}))} className="input-field text-sm"><option value="best_deal">Best Deal</option><option value="new_arrival">New Arrival</option><option value="discount">Discount</option><option value="dealer_request">Dealer News</option></select></div>
            </div>
            <div><label className="label">Title *</label><input type="text" value={notifForm.title} onChange={e=>setNotifForm(p=>({...p,title:e.target.value}))} className="input-field text-sm" placeholder="e.g. 🔥 Flash Sale!" /></div>
            <div><label className="label">Message *</label><textarea rows={3} value={notifForm.message} onChange={e=>setNotifForm(p=>({...p,message:e.target.value}))} className="input-field text-sm resize-none" /></div>
            <div><label className="label">Link (optional)</label><input type="text" value={notifForm.link} onChange={e=>setNotifForm(p=>({...p,link:e.target.value}))} className="input-field text-sm" placeholder="/products?category=Engine" /></div>
            <button onClick={sendNotification} className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2"><Send className="w-4 h-4" /> Send to All {notifForm.targetRole === 'user' ? 'Customers' : 'Dealers'}</button>
          </div>
        </div>
      )}

      {/* ── DEALER MODAL ── */}
      {showDealerModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg my-6 animate-slide-up">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h3 className="font-black text-gray-900">{MODAL_META[dealerModalMode].title}</h3>
                {dealerModalMode === 'approve' && selectedRequest && <p className="text-xs text-gray-400 mt-0.5">{selectedRequest.name} · {selectedRequest.businessName}</p>}
                {dealerModalMode === 'reset'   && selectedDealer  && <p className="text-xs text-gray-400 mt-0.5">New password emailed to {selectedDealer.email}</p>}
              </div>
              <button onClick={() => setShowDealerModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {(dealerModalMode === 'create' || dealerModalMode === 'edit') && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Full Name"     value={dealerForm.name}             onChange={setDF('name')}             required={dealerModalMode==='create'} />
                  <Field label="Phone"         value={dealerForm.phone}            onChange={setDF('phone')}            required={dealerModalMode==='create'} />
                  {dealerModalMode === 'create' && <Field label="Email" value={dealerForm.email} onChange={setDF('email')} type="email" required />}
                  {dealerModalMode === 'create' && <Field label="Password" value={dealerForm.password} onChange={setDF('password')} type="password" placeholder="Min 6 chars" required />}
                  <Field label="Dealer ID"     value={dealerForm.dealerId}         onChange={setDF('dealerId')}         placeholder="TVSD-1001" required mono />
                  <Field label="Business Name" value={dealerForm.businessName}     onChange={setDF('businessName')}     required={dealerModalMode==='create'} />
                  <Field label="Location"      value={dealerForm.businessLocation} onChange={setDF('businessLocation')} required={dealerModalMode==='create'} />
                  <div><label className="label">State{dealerModalMode==='create'&&' *'}</label><select value={dealerForm.state} onChange={setDF('state')} className="input-field text-sm"><option value="">Select…</option>{INDIAN_STATES.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
                </div>
              )}
              {dealerModalMode === 'reset' && (
                <div className="space-y-3">
                  <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-xs text-orange-700 flex items-start gap-2"><Key className="w-4 h-4 flex-shrink-0 mt-0.5" /><span>New password emailed to <strong>{selectedDealer?.email}</strong>.</span></div>
                  <Field label="New Password" value={resetPassword} onChange={e=>setResetPassword(e.target.value)} type="password" placeholder="Min 6 characters" required />
                </div>
              )}
              {dealerModalMode === 'approve' && (
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-xs text-green-700 flex items-start gap-2"><CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /><span>Credentials will be emailed to <strong>{selectedRequest?.email}</strong>.</span></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="label">Dealer ID *</label><input type="text" value={approveForm.dealerId} onChange={e=>setApproveForm(p=>({...p,dealerId:e.target.value}))} className="input-field text-sm font-mono" /></div>
                    <div><label className="label">Password *</label><input type="text" value={approveForm.password} onChange={e=>setApproveForm(p=>({...p,password:e.target.value}))} className="input-field text-sm" /></div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowDealerModal(false)} className="btn-secondary flex-1 py-3 text-sm">Cancel</button>
              <button onClick={saveDealer} disabled={savingDealer} className={`btn-primary flex-1 py-3 text-sm ${MODAL_META[dealerModalMode].btnClass}`}>
                {savingDealer ? <span className="flex items-center gap-2 justify-center"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing…</span> : MODAL_META[dealerModalMode].btnLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ORDER UPDATE MODAL ── */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <div><h3 className="font-black text-gray-900">Update Order</h3><p className="text-xs text-gray-400 font-mono">{selectedOrder.invoiceNumber}</p></div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="label">Status *</label><select value={orderUpdateForm.status} onChange={e=>setOrderUpdateForm(p=>({...p,status:e.target.value}))} className="input-field text-sm">{ORDER_STATUSES.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
              <div><label className="label">Tracking Number</label><input type="text" value={orderUpdateForm.trackingNumber} onChange={e=>setOrderUpdateForm(p=>({...p,trackingNumber:e.target.value}))} className="input-field text-sm font-mono" placeholder="Optional" /></div>
              <div><label className="label">Internal Notes</label><textarea rows={2} value={orderUpdateForm.notes} onChange={e=>setOrderUpdateForm(p=>({...p,notes:e.target.value}))} className="input-field text-sm resize-none" /></div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setSelectedOrder(null)} className="btn-secondary flex-1 py-2.5 text-sm">Cancel</button>
              <button onClick={updateOrder} className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2"><RefreshCw className="w-4 h-4" /> Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}