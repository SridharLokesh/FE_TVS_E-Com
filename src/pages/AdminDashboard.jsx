import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Package,
  ShoppingBag,
  TrendingUp,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  Wrench,
  Plus,
  Trash2,
  Edit2,
  X,
  Search,
  ChevronDown,
  AlertTriangle,
  Check,
  Star,
  BarChart2,
  Tag,
  Image as ImgIcon,
  Clock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import api from "../utils/api";
import toast from "react-hot-toast";

const CATEGORIES = [
  "Engine",
  "Brakes",
  "Electricals",
  "Suspension",
  "Lubricants",
  "Tyres",
  "Body",
  "Accessories",
];

const EMPTY = {
  title: "",
  brand: "TVS",
  model: "",
  category: "",
  price: "",
  originalPrice: "",
  discount: "",
  stock: "",
  rating: "",
  numReviews: "",
  color: "",
  material: "",
  partNumber: "",
  description: "",
  image: "",
  tags: "",
  features: "",
  compatibility: "",
  isFeatured: false,
  availableInIndia: true,
};

const FIELDS = [
  {
    sec: "basic",
    key: "title",
    label: "Part Title *",
    type: "text",
    ph: "e.g. TVS Apache RTR 160 Brake Pad Set",
    wide: true,
  },
  { sec: "basic", key: "brand", label: "Brand *", type: "text", ph: "TVS" },
  {
    sec: "basic",
    key: "model",
    label: "Bike Model",
    type: "text",
    ph: "e.g. Apache RTR 160",
  },
  { sec: "basic", key: "category", label: "Category *", type: "select" },
  {
    sec: "price",
    key: "price",
    label: "Selling Price (₹) *",
    type: "number",
    ph: "0",
  },
  {
    sec: "price",
    key: "originalPrice",
    label: "Original Price (₹)",
    type: "number",
    ph: "0",
  },
  {
    sec: "price",
    key: "discount",
    label: "Discount %",
    type: "number",
    ph: "0",
  },
  { sec: "price", key: "stock", label: "Stock Qty *", type: "number", ph: "0" },
  {
    sec: "detail",
    key: "color",
    label: "Color / Finish",
    type: "text",
    ph: "Silver, Black",
  },
  {
    sec: "detail",
    key: "material",
    label: "Material",
    type: "text",
    ph: "Alloy, Steel, Rubber",
  },
  {
    sec: "detail",
    key: "partNumber",
    label: "OEM Part No.",
    type: "text",
    ph: "TVS-B-APR-001",
  },
  {
    sec: "rating",
    key: "rating",
    label: "Rating (0–5)",
    type: "number",
    ph: "4.5",
  },
  {
    sec: "rating",
    key: "numReviews",
    label: "Review Count",
    type: "number",
    ph: "0",
  },
  {
    sec: "image",
    key: "image",
    label: "Image URL",
    type: "text",
    ph: "https://…",
    wide: true,
  },
  {
    sec: "tags",
    key: "compatibility",
    label: "Compatible Models",
    type: "text",
    ph: "Apache RTR 160, Star City+",
    wide: true,
    hint: "Comma-separated",
  },
  {
    sec: "tags",
    key: "tags",
    label: "Search Tags",
    type: "text",
    ph: "brake pad, disc, apache",
    wide: true,
    hint: "Comma-separated",
  },
  {
    sec: "tags",
    key: "features",
    label: "Key Features",
    type: "text",
    ph: "OEM certified, Heat resistant",
    wide: true,
    hint: "Comma-separated",
  },
  {
    sec: "desc",
    key: "description",
    label: "Description",
    type: "textarea",
    ph: "Detailed product description…",
    wide: true,
  },
];

export default function AdminDashboard({ auth }) {
  const { user, logout } = auth;
  const navigate = useNavigate();

  const [tab, setTab] = useState("dashboard");

  const [stats, setStats] = useState(null);
  const [statsLoad, setStatsLoad] = useState(true);

  const [products, setProducts] = useState([]);
  const [prodLoad, setProdLoad] = useState(false);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totPages, setTotPages] = useState(1);
  const [totCount, setTotCount] = useState(0);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const [delId, setDelId] = useState(null);

  useEffect(() => {
    api
      .get("/admin/stats")
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setStatsLoad(false));
  }, []);

  const loadProducts = useCallback(
    async (p = 1) => {
      setProdLoad(true);
      try {
        const params = { page: p, limit: 12 };
        if (catFilter) params.category = catFilter;
        if (search.trim()) params.search = search.trim();
        const { data } = await api.get("/products", { params });
        setProducts(data.products || []);
        setTotPages(data.pages || 1);
        setTotCount(data.total || 0);
        setPage(p);
      } catch {
        toast.error("Failed to load products");
      } finally {
        setProdLoad(false);
      }
    },
    [catFilter, search],
  );

  useEffect(() => {
    if (tab === "products") loadProducts(1);
  }, [tab, catFilter]); // eslint-disable-line

  const toArr = (s) =>
    s
      ? s
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean)
      : [];

  const openAdd = () => {
    setForm(EMPTY);
    setEditId(null);
    setShowForm(true);
  };
  const openEdit = (p) => {
    setForm({
      title: p.title || "",
      brand: p.brand || "TVS",
      model: p.model || "",
      category: p.category || "",
      price: p.price ?? "",
      originalPrice: p.originalPrice ?? "",
      discount: p.discount ?? "",
      stock: p.stock ?? "",
      rating: p.rating ?? "",
      numReviews: p.numReviews ?? "",
      color: p.color || "",
      material: p.material || "",
      partNumber: p.partNumber || "",
      description: p.description || "",
      image: p.image || "",
      tags: (p.tags || []).join(", "),
      features: (p.features || []).join(", "),
      compatibility: (p.compatibility || []).join(", "),
      isFeatured: p.isFeatured || false,
      availableInIndia: p.availableInIndia ?? true,
    });
    setEditId(p._id);
    setShowForm(true);
  };
  const closeForm = () => {
    setShowForm(false);
    setEditId(null);
    setForm(EMPTY);
  };

  const validate = () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return false;
    }
    if (!form.category) {
      toast.error("Category is required");
      return false;
    }
    if (!form.price || +form.price <= 0) {
      toast.error("Valid price required");
      return false;
    }
    if (form.stock === "" || +form.stock < 0) {
      toast.error("Valid stock required");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const body = {
        ...form,
        price: +form.price || 0,
        originalPrice: +form.originalPrice || 0,
        discount: +form.discount || 0,
        stock: +form.stock || 0,
        rating: +form.rating || 0,
        numReviews: +form.numReviews || 0,
        tags: toArr(form.tags),
        features: toArr(form.features),
        compatibility: toArr(form.compatibility),
      };
      if (editId) {
        await api.put(`/products/${editId}`, body);
        toast.success("Product updated!");
      } else {
        await api.post("/products", body);
        toast.success("Product added!");
      }
      closeForm();
      loadProducts(1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!delId) return;
    try {
      await api.delete(`/products/${delId}`);
      toast.success("Product deleted");
      setDelId(null);
      loadProducts(page);
    } catch {
      toast.error("Delete failed");
    }
  };

  const STAT_CARDS = [
    {
      label: "Total Users",
      icon: Users,
      value: stats?.totalUsers,
      bg: "bg-blue-50",
      ic: "text-[#0a1f44]",
    },
    {
      label: "Total Parts",
      icon: Wrench,
      value: stats?.totalProducts,
      bg: "bg-slate-50",
      ic: "text-[#0a1f44]",
    },
    {
      label: "Total Orders",
      icon: ShoppingBag,
      value: stats?.totalOrders,
      bg: "bg-gray-50",
      ic: "text-gray-700",
    },
    {
      label: "Revenue",
      icon: TrendingUp,
      value:
        stats?.totalRevenue != null
          ? `₹${Number(stats.totalRevenue).toLocaleString("en-IN")}`
          : "₹0",
      bg: "bg-green-50",
      ic: "text-green-700",
    },
  ];

  const STATUS_CFG = {
    Placed: { cls: "bg-blue-100 text-blue-700", icon: Clock },
    Processing: { cls: "bg-yellow-100 text-yellow-700", icon: Package },
    Shipped: { cls: "bg-indigo-100 text-indigo-700", icon: Package },
    Delivered: { cls: "bg-green-100 text-green-700", icon: CheckCircle },
    Cancelled: { cls: "bg-red-100 text-red-700", icon: AlertCircle },
  };

  /* ── Tab definitions (including future ones) ── */
  const TABS = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "products", label: "Manage Parts", icon: Wrench },
    { id: "orders", label: "Manage Orders", icon: ShoppingBag, soon: true },
    { id: "users", label: "Manage Users", icon: Users, soon: true },
  ];

  return (
    <div className="page-wrapper min-h-screen">
      {/* Top bar */}
      <div
        className="bg-[#0a1f44] rounded-2xl p-5 mb-6 text-white
                      flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 bg-white/10 border border-white/20 rounded-xl
                          flex items-center justify-center"
          >
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-300" />
              <span className="text-xs font-bold text-blue-300 uppercase tracking-widest">
                Admin Access
              </span>
            </div>
            <h1 className="text-xl font-black">TVS Admin Panel</h1>
            <p className="text-blue-300 text-xs">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            navigate("/");
          }}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600
                     text-white font-semibold px-4 py-2 rounded-xl transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto no-scrollbar">
        {TABS.map(({ id, label, icon: Icon, soon }) => (
          <button
            key={id}
            onClick={() => !soon && setTab(id)}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold
                        rounded-t-xl border-b-2 transition-all whitespace-nowrap flex-shrink-0
                        ${
                          tab === id
                            ? "text-[#0a1f44] border-[#0a1f44] bg-blue-50"
                            : soon
                              ? "text-gray-300 border-transparent cursor-not-allowed"
                              : "text-gray-500 border-transparent hover:text-gray-700"
                        }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            {soon && (
              <span
                className="text-[10px] font-bold bg-yellow-100 text-yellow-600
                               px-1.5 py-0.5 rounded-full ml-1"
              >
                Soon
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ══════ DASHBOARD TAB ══════ */}
      {tab === "dashboard" && (
        <div className="space-y-6">
          {/* Stat cards */}
          {statsLoad ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="card h-28 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {STAT_CARDS.map(({ label, icon: Icon, value, bg, ic }) => (
                <div
                  key={label}
                  className={`${bg} rounded-2xl p-5 border border-white shadow-sm`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-gray-600">
                      {label}
                    </p>
                    <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <Icon className={`w-5 h-5 ${ic}`} />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-gray-900">
                    {value ?? "—"}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Low stock alert */}
          {stats?.lowStockCount > 0 && (
            <div className="flex items-center gap-3 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-2xl">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <p className="text-sm font-semibold text-yellow-800">
                {stats.lowStockCount} product
                {stats.lowStockCount > 1 ? "s" : ""} are running low on stock
                (10 or fewer units).
              </p>
              <button
                onClick={() => setTab("products")}
                className="ml-auto text-xs font-bold text-yellow-700 underline whitespace-nowrap"
              >
                View Products →
              </button>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Category breakdown */}
            {stats?.categoryStats?.length > 0 && (
              <div className="card p-5">
                <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-[#0a1f44]" /> Parts by
                  Category
                </h3>
                <div className="space-y-2.5">
                  {stats.categoryStats.map(({ _id, count }) => {
                    const pct = Math.round(
                      (count / (stats.totalProducts || 1)) * 100,
                    );
                    return (
                      <div key={_id}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">
                            {_id}
                          </span>
                          <span className="text-xs font-bold text-gray-500">
                            {count} parts
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#0a1f44] rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent orders */}
            {stats?.recentOrders?.length > 0 && (
              <div className="card p-5">
                <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#0a1f44]" /> Recent
                  Orders
                </h3>
                <div className="space-y-3">
                  {stats.recentOrders.map((order) => {
                    const cfg =
                      STATUS_CFG[order.orderStatus] || STATUS_CFG.Placed;
                    const Icon = cfg.icon;
                    return (
                      <div
                        key={order._id}
                        className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                      >
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {order.user?.name || "Unknown"}
                          </p>
                          <p className="text-xs text-gray-400">
                            #{order._id.slice(-6).toUpperCase()} ·{" "}
                            {new Date(order.createdAt).toLocaleDateString(
                              "en-IN",
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-gray-900">
                            ₹{order.totalPrice?.toLocaleString("en-IN")}
                          </p>
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.cls}`}
                          >
                            <Icon className="w-3 h-3" /> {order.orderStatus}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Active: Manage Parts */}
            <button
              onClick={() => setTab("products")}
              className="card p-6 flex flex-col items-center text-center hover:shadow-md
                         hover:border-[#0a1f44] transition-all"
            >
              <div className="w-12 h-12 bg-[#0a1f44] rounded-xl flex items-center justify-center mb-3">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-black text-gray-900 mb-1">Manage Parts</h3>
              <p className="text-sm text-gray-400">
                Add, edit or delete TVS spare parts —{" "}
                {stats?.totalProducts || 0} listed
              </p>
            </button>

            {/* Coming soon: Manage Orders */}
            <div className="card p-6 flex flex-col items-center text-center opacity-60 cursor-not-allowed">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                <ShoppingBag className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="font-black text-gray-900 mb-1">Manage Orders</h3>
              <p className="text-sm text-gray-400 mb-4">
                View and update order statuses
              </p>
              <span className="text-xs font-semibold bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                Coming Soon
              </span>
            </div>

            {/* Coming soon: Manage Users */}
            <div className="card p-6 flex flex-col items-center text-center opacity-60 cursor-not-allowed">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                <Users className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="font-black text-gray-900 mb-1">Manage Users</h3>
              <p className="text-sm text-gray-400 mb-4">
                View registered user accounts
              </p>
              <span className="text-xs font-semibold bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                Coming Soon
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ══════ PRODUCTS TAB ══════ */}
      {tab === "products" && (
        <div>
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadProducts(1)}
                placeholder="Search parts…"
                className="input-field pl-9 py-2 text-sm"
              />
            </div>
            <div className="relative">
              <select
                value={catFilter}
                onChange={(e) => setCatFilter(e.target.value)}
                className="input-field pr-8 appearance-none cursor-pointer py-2 text-sm"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <button
              onClick={() => loadProducts(1)}
              className="btn-secondary px-4 py-2 text-sm"
            >
              Search
            </button>
            <button
              onClick={openAdd}
              className="btn-primary px-4 py-2 text-sm ml-auto flex-shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Part
            </button>
          </div>

          <p className="text-sm text-gray-500 mb-4">
            {totCount} products · page {page} of {totPages}
          </p>

          {prodLoad ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="card h-14 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="card p-14 text-center">
              <Package className="w-14 h-14 text-gray-200 mx-auto mb-3" />
              <p className="font-bold text-gray-600 mb-4">No products found</p>
              <button onClick={openAdd} className="btn-primary text-sm">
                <Plus className="w-4 h-4" /> Add First Product
              </button>
            </div>
          ) : (
            <>
              <div className="card overflow-hidden mb-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#0a1f44] text-white text-xs uppercase tracking-wider">
                      <tr>
                        <th className="text-left px-4 py-3">Part</th>
                        <th className="text-left px-4 py-3 hidden md:table-cell">
                          Category
                        </th>
                        <th className="text-left px-4 py-3 hidden sm:table-cell">
                          Price
                        </th>
                        <th className="text-left px-4 py-3 hidden lg:table-cell">
                          Stock
                        </th>
                        <th className="text-left px-4 py-3 hidden lg:table-cell">
                          Rating
                        </th>
                        <th className="text-right px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {products.map((p) => (
                        <tr
                          key={p._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  p.image || "https://via.placeholder.com/40"
                                }
                                alt={p.title}
                                className="w-10 h-10 object-cover rounded-lg bg-gray-100 flex-shrink-0"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "https://via.placeholder.com/40";
                                }}
                              />
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-900 truncate max-w-[160px] md:max-w-[200px]">
                                  {p.title}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {p.brand} · {p.model || "—"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span className="text-xs font-semibold bg-blue-100 text-[#0a1f44] px-2.5 py-1 rounded-full">
                              {p.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <p className="font-bold text-gray-900">
                              ₹{p.price?.toLocaleString("en-IN")}
                            </p>
                            {p.originalPrice > p.price && (
                              <p className="text-xs text-gray-400 line-through">
                                ₹{p.originalPrice?.toLocaleString("en-IN")}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                p.stock > 10
                                  ? "bg-green-100 text-green-700"
                                  : p.stock > 0
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-600"
                              }`}
                            >
                              {p.stock > 0 ? `${p.stock} left` : "Out of stock"}
                            </span>
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <div className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                              <span className="text-xs font-semibold">
                                {p.rating}
                              </span>
                              <span className="text-xs text-gray-400">
                                ({p.numReviews})
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openEdit(p)}
                                className="p-2 text-[#0a1f44] hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDelId(p._id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {totPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => loadProducts(Math.max(page - 1, 1))}
                    disabled={page === 1}
                    className="btn-ghost px-3 py-1.5 text-sm border border-gray-200 disabled:opacity-40"
                  >
                    ← Prev
                  </button>
                  {Array.from(
                    { length: Math.min(totPages, 7) },
                    (_, i) => i + 1,
                  ).map((p) => (
                    <button
                      key={p}
                      onClick={() => loadProducts(p)}
                      className={`w-8 h-8 rounded-xl text-sm font-semibold transition-colors ${
                        page === p
                          ? "bg-[#0a1f44] text-white"
                          : "bg-white border border-gray-200 hover:border-[#0a1f44]"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => loadProducts(Math.min(page + 1, totPages))}
                    disabled={page === totPages}
                    className="btn-ghost px-3 py-1.5 text-sm border border-gray-200 disabled:opacity-40"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ══════ ADD/EDIT MODAL ══════ */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50
                        flex items-start justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-6">
            <div className="flex items-center justify-between px-6 py-4 bg-[#0a1f44] rounded-t-2xl text-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center">
                  {editId ? (
                    <Edit2 className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </div>
                <h2 className="text-lg font-black">
                  {editId ? "Edit Product" : "Add New Part"}
                </h2>
              </div>
              <button
                onClick={closeForm}
                className="w-8 h-8 bg-white/15 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[74vh] p-6 space-y-5">
              <Sec icon={Tag} title="Basic Information">
                <div className="grid sm:grid-cols-2 gap-4">
                  {FIELDS.filter((f) => f.sec === "basic").map((f) => (
                    <Field key={f.key} f={f} form={form} setForm={setForm} />
                  ))}
                </div>
              </Sec>
              <Sec icon={BarChart2} title="Pricing & Stock">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {FIELDS.filter((f) => f.sec === "price").map((f) => (
                    <Field key={f.key} f={f} form={form} setForm={setForm} />
                  ))}
                </div>
              </Sec>
              <Sec icon={Wrench} title="Part Details">
                <div className="grid sm:grid-cols-3 gap-4">
                  {FIELDS.filter((f) => f.sec === "detail").map((f) => (
                    <Field key={f.key} f={f} form={form} setForm={setForm} />
                  ))}
                </div>
              </Sec>
              <Sec icon={Star} title="Ratings">
                <div className="grid grid-cols-2 gap-4">
                  {FIELDS.filter((f) => f.sec === "rating").map((f) => (
                    <Field key={f.key} f={f} form={form} setForm={setForm} />
                  ))}
                </div>
              </Sec>
              <Sec icon={ImgIcon} title="Product Image">
                <div className="flex gap-4 items-start">
                  <div className="flex-1">
                    <Field
                      f={FIELDS.find((f) => f.key === "image")}
                      form={form}
                      setForm={setForm}
                    />
                  </div>
                  {form.image && (
                    <img
                      src={form.image}
                      alt="preview"
                      className="w-20 h-20 object-cover rounded-xl border border-gray-200 flex-shrink-0 mt-6"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                </div>
              </Sec>
              <Sec icon={Tag} title="Tags, Features & Compatibility">
                <div className="space-y-4">
                  {FIELDS.filter((f) => f.sec === "tags").map((f) => (
                    <Field key={f.key} f={f} form={form} setForm={setForm} />
                  ))}
                </div>
              </Sec>
              <Sec icon={LayoutDashboard} title="Description">
                <Field
                  f={FIELDS.find((f) => f.key === "description")}
                  form={form}
                  setForm={setForm}
                />
              </Sec>
              <Sec icon={Check} title="Options">
                <div className="flex flex-wrap gap-5">
                  {[
                    { key: "isFeatured", label: "Featured Product" },
                    { key: "availableInIndia", label: "Available in India" },
                  ].map(({ key, label }) => (
                    <label
                      key={key}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={!!form[key]}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, [key]: e.target.checked }))
                        }
                        className="w-4 h-4 accent-[#0a1f44] rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </Sec>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button
                onClick={closeForm}
                className="flex-1 border-2 border-gray-200 hover:border-gray-300 text-gray-600 font-semibold py-2.5 rounded-xl transition-all text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 btn-primary py-2.5 text-sm"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving…
                  </span>
                ) : editId ? (
                  "Save Changes"
                ) : (
                  "Add Product"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════ DELETE CONFIRM ══════ */}
      {delId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">
              Delete Product?
            </h3>
            <p className="text-sm text-gray-500 mb-7">
              This will permanently remove the product from the database and
              cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDelId(null)}
                className="flex-1 border-2 border-gray-200 hover:border-gray-300 text-gray-600 font-semibold py-2.5 rounded-xl text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl transition-colors text-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Sec({ icon: Icon, title, children }) {
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
        <Icon className="w-4 h-4 text-[#0a1f44]" />
        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
          {title}
        </span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Field({ f, form, setForm }) {
  if (!f) return null;
  const { key, label, type, ph, hint } = f;
  const val = form[key] ?? "";
  const set = (v) => setForm((p) => ({ ...p, [key]: v }));

  return (
    <div className={f.wide ? "col-span-full" : ""}>
      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {type === "select" ? (
        <div className="relative">
          <select
            value={val}
            onChange={(e) => set(e.target.value)}
            className="input-field appearance-none pr-8 cursor-pointer text-sm"
          >
            <option value="">Select category…</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      ) : type === "textarea" ? (
        <textarea
          rows={4}
          value={val}
          onChange={(e) => set(e.target.value)}
          placeholder={ph}
          className="input-field resize-none text-sm"
        />
      ) : (
        <input
          type={type}
          value={val}
          onChange={(e) => set(e.target.value)}
          placeholder={ph}
          min={type === "number" ? 0 : undefined}
          step={type === "number" ? "any" : undefined}
          className="input-field text-sm"
        />
      )}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}
