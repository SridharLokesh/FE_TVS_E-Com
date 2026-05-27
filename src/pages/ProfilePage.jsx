import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  User,
  Lock,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  ShoppingBag,
  Package,
  RotateCcw,
  MapPinned,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import api from "../utils/api";
import toast from "react-hot-toast";

/* ─── Input — defined outside to prevent remount on re-render ─── */
function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  readOnly,
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`input-field ${readOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
      />
    </div>
  );
}

/* ─── Constants ─── */
const STATUS_CFG = {
  Placed: { color: "bg-blue-100 text-blue-700", icon: Clock },
  Processing: { color: "bg-yellow-100 text-yellow-700", icon: Package },
  Shipped: { color: "bg-indigo-100 text-indigo-700", icon: Truck },
  Delivered: { color: "bg-green-100 text-green-700", icon: CheckCircle },
  Cancelled: { color: "bg-red-100 text-red-700", icon: XCircle },
  Returned: { color: "bg-gray-100 text-gray-600", icon: RotateCcw },
};

const TRACK_STEPS = ["Placed", "Processing", "Shipped", "Delivered"];

const TABS = {
  PROFILE: "profile",
  ORDERS: "orders",
  TRACKING: "tracking",
  HISTORY: "history",
  RETURNS: "returns",
  ADDRESSES: "addresses",
};
const ORDER_TABS = [TABS.ORDERS, TABS.TRACKING, TABS.HISTORY, TABS.RETURNS];

const TAB_URL = {
  [TABS.PROFILE]: "/profile",
  [TABS.ORDERS]: "/profile?tab=orders",
  [TABS.TRACKING]: "/profile?tab=tracking",
  [TABS.HISTORY]: "/profile?tab=history",
  [TABS.RETURNS]: "/profile?tab=returns",
  [TABS.ADDRESSES]: "/profile?tab=addresses",
};

const PAGE_TITLES = {
  [TABS.PROFILE]: "My Profile",
  [TABS.ORDERS]: "All Orders",
  [TABS.TRACKING]: "Order Tracking",
  [TABS.HISTORY]: "Order History",
  [TABS.RETURNS]: "Return Status",
  [TABS.ADDRESSES]: "Saved Addresses",
};

const SIDEBAR = [
  { label: "My Profile", icon: User, tab: TABS.PROFILE },
  {
    label: "My Orders",
    icon: ShoppingBag,
    children: [
      { label: "All Orders", icon: ShoppingBag, tab: TABS.ORDERS },
      { label: "Order Tracking", icon: Truck, tab: TABS.TRACKING },
      { label: "Order History", icon: Package, tab: TABS.HISTORY },
      { label: "Return Status", icon: RotateCcw, tab: TABS.RETURNS },
    ],
  },
  { label: "Saved Addresses", icon: MapPinned, tab: TABS.ADDRESSES },
];

const ADDR_BLANK = {
  label: "Home",
  street: "",
  city: "",
  state: "",
  pincode: "",
};

const urlToTab = (search) => {
  const t = new URLSearchParams(search).get("tab");
  return Object.values(TABS).includes(t) ? t : TABS.PROFILE;
};

/* ─── Address Form ─── */
function AddressForm({
  addrForm,
  setAddrForm,
  onSave,
  onCancel,
  saving,
  editingAddr,
}) {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-5">
      <h3 className="text-sm font-bold text-gray-800 mb-3">
        {editingAddr ? "Edit Address" : "Add New Address"}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
            Label
          </label>
          <select
            value={addrForm.label}
            onChange={(e) =>
              setAddrForm((p) => ({ ...p, label: e.target.value }))
            }
            className="input-field"
          >
            {["Home", "Office", "Other"].map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </div>
        {[
          { key: "street", label: "Street *", ph: "Street address" },
          { key: "city", label: "City *", ph: "City" },
          { key: "state", label: "State", ph: "State" },
          { key: "pincode", label: "Pincode *", ph: "6-digit pincode" },
        ].map(({ key, label, ph }) => (
          <div key={key}>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
              {label}
            </label>
            <input
              type="text"
              value={addrForm[key]}
              onChange={(e) =>
                setAddrForm((p) => ({ ...p, [key]: e.target.value }))
              }
              placeholder={ph}
              className="input-field"
            />
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mt-4">
        <button
          onClick={onSave}
          disabled={saving}
          className="btn-primary px-4 py-2 text-sm"
        >
          {saving ? "Saving…" : "Save Address"}
        </button>
        <button
          onClick={onCancel}
          className="btn-ghost border border-gray-200 px-4 py-2 text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ─── Address List ─── */
function AddressList({
  addresses,
  onEdit,
  onDelete,
  onAdd,
  showAddrForm,
  addrForm,
  setAddrForm,
  saveAddress,
  setShowAddrForm,
  editingAddr,
  saving,
}) {
  return (
    <>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#0a1f44]" />
          Saved Addresses
          <span className="text-sm font-normal text-gray-400">
            ({addresses.length}/10)
          </span>
        </h2>
        {addresses.length < 10 && (
          <button
            onClick={onAdd}
            className="flex items-center gap-1 text-sm text-[#0a1f44] font-semibold hover:underline"
          >
            <Plus className="w-4 h-4" /> Add New
          </button>
        )}
      </div>

      {showAddrForm && (
        <AddressForm
          addrForm={addrForm}
          setAddrForm={setAddrForm}
          onSave={saveAddress}
          onCancel={() => setShowAddrForm(false)}
          saving={saving}
          editingAddr={editingAddr}
        />
      )}

      {addresses.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl">
          <MapPin className="w-10 h-10 text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No saved addresses yet</p>
          {!showAddrForm && (
            <button
              onClick={onAdd}
              className="mt-3 btn-primary px-5 py-2 text-sm"
            >
              Add Address
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr._id}
              className="border-2 border-gray-100 hover:border-blue-200 rounded-2xl p-4 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-full ${
                    addr.label === "Home"
                      ? "bg-blue-100 text-[#0a1f44]"
                      : addr.label === "Office"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {addr.label}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => onEdit(addr)}
                    className="p-1.5 text-gray-400 hover:text-[#0a1f44] hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(addr._id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-700">{addr.street}</p>
              <p className="text-sm text-gray-500 mt-1">
                {addr.city}
                {addr.state ? `, ${addr.state}` : ""} — {addr.pincode}
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
export default function ProfilePage({ auth }) {
  const { user, updateUser } = auth;
  const navigate = useNavigate();
  const location = useLocation();

  /* ── Tab state ── */
  const [activeTab, setActiveTab] = useState(() => urlToTab(location.search));
  const [ordersOpen, setOrdersOpen] = useState(() =>
    ORDER_TABS.includes(urlToTab(location.search)),
  );

  useEffect(() => {
    const tab = urlToTab(location.search);
    setActiveTab(tab);
    if (ORDER_TABS.includes(tab)) setOrdersOpen(true);
  }, [location.search]);

  /* ── Profile form ── */
  const [profile, setProfile] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    secondaryPhone: user?.secondaryPhone || "",
  });

  /* ── Password form ── */
  const [pwdForm, setPwdForm] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [showPwd, setShowPwd] = useState(false);

  /* ── Address state ── */
  const [addresses, setAddresses] = useState([]);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [editingAddr, setEditingAddr] = useState(null);
  const [addrForm, setAddrForm] = useState(ADDR_BLANK);

  /* ── Orders state ── */
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersFetched, setOrdersFetched] = useState(false);

  const [saving, setSaving] = useState(false);

  /* ── Fetch profile + addresses on mount ── */
  useEffect(() => {
    api
      .get("/user/profile")
      .then(({ data }) => {
        setProfile({
          name: data.name || "",
          phone: data.phone || "",
          secondaryPhone: data.secondaryPhone || "",
        });
        setAddresses(data.addresses || []);
      })
      .catch(() => {});
  }, []);

  /* ── Fetch orders lazily ── */
  useEffect(() => {
    if (ORDER_TABS.includes(activeTab) && !ordersFetched) {
      setOrdersLoading(true);
      api
        .get("/orders/my")
        .then(({ data }) => {
          setOrders(data);
          setOrdersFetched(true);
        })
        .catch(() => {})
        .finally(() => setOrdersLoading(false));
    }
  }, [activeTab, ordersFetched]);

  /* ── Handlers ── */
  const saveProfile = async () => {
    if (!profile.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.put("/user/profile", profile);
      updateUser(data);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async () => {
    if (!pwdForm.current) {
      toast.error("Enter your current password");
      return;
    }
    if (pwdForm.next !== pwdForm.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (pwdForm.next.length < 6) {
      toast.error("Minimum 6 characters required");
      return;
    }
    setSaving(true);
    try {
      await api.put("/user/password", {
        currentPassword: pwdForm.current,
        newPassword: pwdForm.next,
      });
      toast.success("Password updated!");
      setPwdForm({ current: "", next: "", confirm: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  const saveAddress = async () => {
    if (
      !addrForm.street.trim() ||
      !addrForm.city.trim() ||
      !addrForm.pincode.trim()
    ) {
      toast.error("Street, City and Pincode are required");
      return;
    }
    if (!/^\d{6}$/.test(addrForm.pincode)) {
      toast.error("Pincode must be exactly 6 digits");
      return;
    }
    setSaving(true);
    try {
      const { data } = editingAddr
        ? await api.put(`/user/address/${editingAddr}`, addrForm)
        : await api.post("/user/address", addrForm);
      setAddresses(data);
      toast.success(editingAddr ? "Address updated!" : "Address added!");
      setShowAddrForm(false);
      setEditingAddr(null);
      setAddrForm(ADDR_BLANK);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  const deleteAddress = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      const { data } = await api.delete(`/user/address/${id}`);
      setAddresses(data);
      toast.success("Address deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const startEdit = (addr) => {
    setAddrForm({
      label: addr.label,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
    });
    setEditingAddr(addr._id);
    setShowAddrForm(true);
    setTimeout(
      () =>
        document
          .getElementById("addr-form-anchor")
          ?.scrollIntoView({ behavior: "smooth" }),
      50,
    );
  };

  const cancelOrder = async (id) => {
    if (!window.confirm("Cancel this order?")) return;
    try {
      await api.put(`/orders/${id}/cancel`);
      setOrders((prev) =>
        prev.map((o) =>
          o._id === id ? { ...o, orderStatus: "Cancelled" } : o,
        ),
      );
      toast.success("Order cancelled");
    } catch {
      toast.error("Failed to cancel order");
    }
  };

  const handleTabClick = (tab) => navigate(TAB_URL[tab] ?? "/profile");

  /* ── Address props (shared between profile tab and addresses tab) ── */
  const addrListProps = {
    addresses,
    onEdit: startEdit,
    onDelete: deleteAddress,
    onAdd: () => {
      setAddrForm(ADDR_BLANK);
      setEditingAddr(null);
      setShowAddrForm(true);
    },
    showAddrForm,
    addrForm,
    setAddrForm,
    saveAddress,
    setShowAddrForm,
    editingAddr,
    saving,
  };

  /* ── Filtered orders ── */
  const filteredOrders =
    activeTab === TABS.HISTORY
      ? orders.filter((o) => ["Delivered", "Cancelled"].includes(o.orderStatus))
      : activeTab === TABS.RETURNS
        ? orders.filter((o) => o.orderStatus === "Returned")
        : activeTab === TABS.TRACKING
          ? orders.filter((o) =>
              ["Placed", "Processing", "Shipped"].includes(o.orderStatus),
            )
          : orders;

  /* ── Order list renderer ── */
  const renderOrders = () => {
    if (ordersLoading)
      return (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="card h-32 animate-pulse bg-gray-100 rounded-2xl"
            />
          ))}
        </div>
      );

    if (filteredOrders.length === 0)
      return (
        <div className="card p-12 text-center">
          <Package className="w-14 h-14 text-gray-200 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-700 mb-1">
            No orders found
          </h2>
          <p className="text-gray-400 text-sm mb-5">
            Order genuine TVS parts to see them here
          </p>
          <button
            onClick={() => navigate("/products")}
            className="btn-primary px-8"
          >
            Browse Parts
          </button>
        </div>
      );

    return (
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const cfg = STATUS_CFG[order.orderStatus] || STATUS_CFG.Placed;
          const StatusIcon = cfg.icon;
          const currentIdx = TRACK_STEPS.indexOf(order.orderStatus);
          return (
            <div key={order._id} className="card p-5">
              {/* Meta */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Order ID</p>
                  <p className="text-sm font-mono font-bold text-gray-800">
                    #{order._id.slice(-8).toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Ordered On</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Total</p>
                  <p className="text-sm font-black text-gray-900">
                    ₹{order.totalPrice?.toLocaleString("en-IN")}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.color}`}
                >
                  <StatusIcon className="w-3.5 h-3.5" /> {order.orderStatus}
                </span>
              </div>

              {/* Items preview */}
              <div className="flex flex-wrap gap-3 mb-4">
                {order.orderItems?.slice(0, 3).map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-10 h-10 object-cover rounded-lg bg-gray-100"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                    <div>
                      <p className="text-xs font-semibold text-gray-700 line-clamp-1 max-w-[120px]">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        Qty: {item.quantity} · ₹
                        {item.price?.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))}
                {order.orderItems?.length > 3 && (
                  <span className="text-xs text-gray-400 self-center">
                    +{order.orderItems.length - 3} more
                  </span>
                )}
              </div>

              {/* Tracker */}
              {TRACK_STEPS.includes(order.orderStatus) && (
                <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1">
                  {TRACK_STEPS.map((step, i) => {
                    const done = i <= currentIdx;
                    return (
                      <div
                        key={step}
                        className="flex items-center gap-1 flex-shrink-0"
                      >
                        <div
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            done
                              ? "bg-[#0a1f44] text-white"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {done ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {step}
                        </div>
                        {i < TRACK_STEPS.length - 1 && (
                          <div
                            className={`w-5 h-0.5 rounded-full ${i < currentIdx ? "bg-[#0a1f44]" : "bg-gray-200"}`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {order.orderStatus === "Placed" && (
                <button
                  onClick={() => cancelOrder(order._id)}
                  className="text-xs text-red-500 hover:text-red-700 font-semibold hover:underline transition-colors"
                >
                  Cancel Order
                </button>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  /* ── Tab content ── */
  const renderContent = () => {
    switch (activeTab) {
      case TABS.PROFILE:
        return (
          <>
            {/* Personal Info */}
            <div className="card p-4 sm:p-6">
              <h2 className="text-lg font-black text-gray-900 mb-5 flex items-center gap-2">
                <User className="w-5 h-5 text-[#0a1f44]" /> Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      name: e.target.value.replace(/[^a-zA-Z\s]/g, ""),
                    }))
                  }
                  placeholder="Your full name"
                />
                <Input
                  label="Email Address"
                  value={user?.email || ""}
                  readOnly
                  type="email"
                />
                <Input
                  label="Primary Phone"
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      phone: e.target.value.replace(/\D/g, "").slice(0, 15),
                    }))
                  }
                  placeholder="+91 XXXXX XXXXX"
                />
                <Input
                  label="Secondary Phone"
                  value={profile.secondaryPhone}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      secondaryPhone: e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 15),
                    }))
                  }
                  placeholder="Optional"
                />
              </div>
              <button
                onClick={saveProfile}
                disabled={saving}
                className="btn-primary mt-5 px-6 py-2.5 text-sm"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>

            {/* Change Password */}
            <div className="card p-4 sm:p-6">
              <h2 className="text-lg font-black text-gray-900 mb-5 flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#0a1f44]" /> Change Password
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "Current Password", key: "current" },
                  { label: "New Password", key: "next" },
                  { label: "Confirm New", key: "confirm" },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      {label}
                    </label>
                    <div className="relative">
                      <input
                        type={showPwd ? "text" : "password"}
                        value={pwdForm[key]}
                        onChange={(e) =>
                          setPwdForm((p) => ({ ...p, [key]: e.target.value }))
                        }
                        placeholder="••••••"
                        className="input-field pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPwd ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={savePassword}
                disabled={saving}
                className="btn-primary mt-5 px-6 py-2.5 text-sm"
              >
                {saving ? "Updating…" : "Update Password"}
              </button>
            </div>

            {/* Addresses */}
            <div className="card p-4 sm:p-6">
              <div id="addr-form-anchor" />
              <AddressList {...addrListProps} />
            </div>
          </>
        );

      case TABS.ADDRESSES:
        return (
          <div className="card p-4 sm:p-6">
            <div id="addr-form-anchor" />
            <AddressList {...addrListProps} />
          </div>
        );

      case TABS.ORDERS:
      case TABS.TRACKING:
      case TABS.HISTORY:
      case TABS.RETURNS:
        return renderOrders();

      default:
        return null;
    }
  };

  /* ── JSX ── */
  return (
    <div className="page-wrapper min-h-screen bg-gray-50">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* User card */}
          <div className="card p-4 mb-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#0a1f44] flex items-center justify-center text-white text-xl font-black flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-gray-900 text-sm truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>

          {/* Nav */}
          <div className="card overflow-hidden">
            {SIDEBAR.map((item) => {
              const Icon = item.icon;
              if (item.children) {
                const anyChildActive = item.children.some(
                  (c) => c.tab === activeTab,
                );
                return (
                  <div key={item.label}>
                    <button
                      onClick={() => setOrdersOpen((o) => !o)}
                      className={`w-full flex items-center justify-between px-4 py-3 border-b border-gray-100 transition-colors ${
                        anyChildActive ? "bg-gray-100" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 ${anyChildActive ? "text-[#0a1f44]" : "text-gray-700"}`}
                        />
                        <span
                          className={`text-sm font-semibold ${anyChildActive ? "text-[#0a1f44]" : "text-gray-700"}`}
                        >
                          {item.label}
                        </span>
                      </div>
                      {ordersOpen ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                    {ordersOpen && (
                      <div className="bg-gray-50">
                        {item.children.map((child) => {
                          const ChildIcon = child.icon;
                          const isActive = activeTab === child.tab;
                          return (
                            <button
                              key={child.label}
                              onClick={() => handleTabClick(child.tab)}
                              className={`w-full flex items-center gap-3 px-8 py-3 text-sm border-b border-gray-100 transition-colors text-left ${
                                isActive
                                  ? "bg-[#0a1f44] text-white font-semibold"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`}
                            >
                              <ChildIcon className="w-4 h-4 flex-shrink-0" />
                              {child.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const isActive = activeTab === item.tab;
              return (
                <button
                  key={item.label}
                  onClick={() => handleTabClick(item.tab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm border-b border-gray-100 transition-colors text-left ${
                    isActive
                      ? "bg-[#0a1f44] text-white font-semibold"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3 space-y-5">
          <div className="card p-4 sm:p-5 flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900">
                {PAGE_TITLES[activeTab]}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your account information and orders
              </p>
            </div>
          </div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
