import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import NotificationPanel from "./NotificationPanel";
import {
  ShoppingCart, Heart, Search, User, ChevronDown, X,
  LogOut, Settings, Package, Menu, Wrench, Shield,
  Bell, Store, ChevronRight,
} from "lucide-react";
import { useProducts } from "../hooks/useProducts";
import TVS_logo from "../assets/TVS_logo.png";
import api from "../utils/api";

export default function Navbar({ auth, cartHook, wishlistHook, notifHook, subPillsVisible }) {
  const { user, logout, isLoggedIn } = auth || {};
  const cartCount     = cartHook?.cartCount     ?? 0;
  const wishlistCount = wishlistHook?.wishlistCount ?? 0;
  const { notifications = [], unreadCount = 0, markRead, markAllRead, deleteNotif } = notifHook || {};

  const navigate  = useNavigate();
  const location  = useLocation();
  const { searchResults, searchProducts, clearSearch } = useProducts();

  const [searchQuery,       setSearchQuery]    = useState("");
  const [showMoreMenu,      setShowMoreMenu]   = useState(false);
  const [showUserMenu,      setShowUserMenu]   = useState(false);
  const [showNotifPanel,    setShowNotifPanel] = useState(false);
  const [mobileMenuOpen,    setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen,  setMobileSearchOpen] = useState(false);
  const [categories,        setCategories]     = useState([]);
  const [catsLoading,       setCatsLoading]    = useState(true);
  const [mobileExpandedCat, setMobileExpandedCat] = useState(null);
  const [headerHeight,      setHeaderHeight]   = useState(0);

  const [openCatDropdown, setOpenCatDropdown] = useState(null);
  const [dropdownSubs,    setDropdownSubs]    = useState([]);
  const [dropdownName,    setDropdownName]    = useState("");
  const [dropdownLoading, setDropdownLoading] = useState(false);

  const searchRef       = useRef(null);
  const mobileSearchRef = useRef(null);
  const moreRef         = useRef(null);
  const userRef         = useRef(null);
  const notifRef        = useRef(null);
  const headerRef       = useRef(null);
  const pillRefs        = useRef({});
  const searchTimer     = useRef(null);

  const isDealer = user?.role === "dealer";
  const isAdmin  = user?.role === "admin";
  const isUser   = user?.role === "user";
  const showCartWishlist = isLoggedIn && isUser;

  const activeCatSlug = location.pathname.match(/\/products\/category\/([^/?]+)/)?.[1]?.toLowerCase() || null;
  const activeSubSlug = new URLSearchParams(location.search).get("sub") || null;
  const pillsAreHidden = subPillsVisible === false;

  /* ── Fetch nav categories on mount ── */
  useEffect(() => {
    const load = async () => {
      try {
        setCatsLoading(true);
        const { data } = await api.get("/categories?nav=true");
        if (Array.isArray(data))
          setCategories([...data].sort((a, b) => (a.navOrder ?? 99) - (b.navOrder ?? 99)));
      } catch (e) {
        console.error("Category fetch error:", e);
      } finally {
        setCatsLoading(false);
      }
    };
    load();
  }, []);

  /* ── Measure header height ── */
  useEffect(() => {
    const measure = () => {
      if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  /* ── Close everything on route change ── */
  useEffect(() => {
    setShowMoreMenu(false);
    setShowUserMenu(false);
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
    setShowNotifPanel(false);
    setSearchQuery("");
    setMobileExpandedCat(null);
    setOpenCatDropdown(null);
    setDropdownSubs([]);
    setDropdownName("");
    clearSearch?.();
  }, [location.pathname]);

  /* ── Click-outside handler ── */
  useEffect(() => {
    const h = (e) => {
      if (moreRef.current  && !moreRef.current.contains(e.target))  setShowMoreMenu(false);
      if (userRef.current  && !userRef.current.contains(e.target))  setShowUserMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifPanel(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) clearSearch?.();
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target)) {
        if (!searchQuery) setMobileSearchOpen(false);
      }
      if (openCatDropdown) {
        const el = pillRefs.current[openCatDropdown];
        if (el && !el.contains(e.target)) {
          setOpenCatDropdown(null);
          setDropdownSubs([]);
          setDropdownName("");
        }
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [openCatDropdown, searchQuery]);

  /* ── Search handlers ── */
  const handleSearchChange = useCallback((e) => {
    const val = e.target.value;
    setSearchQuery(val);
    clearTimeout(searchTimer.current);
    if (val.length > 0) searchTimer.current = setTimeout(() => searchProducts?.(val), 220);
    else clearSearch?.();
  }, [searchProducts, clearSearch]);

  const handleSearchSelect = (p) => {
    navigate(`/products/${p._id}`);
    setSearchQuery(""); clearSearch?.();
    setMobileSearchOpen(false);
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      clearSearch?.();
      setMobileSearchOpen(false);
    }
  };

  /* ── Navigation ── */
  const closeDropdown = () => {
    setOpenCatDropdown(null);
    setDropdownSubs([]);
    setDropdownName("");
  };

  const goCategory = useCallback((slug) => {
    setMobileMenuOpen(false);
    closeDropdown();
    navigate(`/products/category/${slug}`);
  }, [navigate]);

  const goSubCategory = useCallback((catSlug, subSlug) => {
    setMobileMenuOpen(false);
    closeDropdown();
    navigate(`/products/category/${catSlug}?sub=${subSlug}`);
  }, [navigate]);

  const goCart     = () => navigate("/cart");
  const goWishlist = () => navigate("/wishlist");
  const toggleMobileCat = (slug) => setMobileExpandedCat(p => p === slug ? null : slug);

  const openSubDropdown = useCallback(async (slug, name) => {
    if (openCatDropdown === slug) { closeDropdown(); return; }
    setOpenCatDropdown(slug);
    setDropdownName(name);
    setDropdownSubs([]);
    setDropdownLoading(true);
    try {
      const { data } = await api.get(`/categories/${slug}`);
      const subs = (data?.subCategories || []).filter(s => s.isActive !== false);
      setDropdownSubs(subs);
    } catch (e) {
      console.error("Failed to load sub-categories:", e);
      setDropdownSubs([]);
    } finally {
      setDropdownLoading(false);
    }
  }, [openCatDropdown]);

  const handlePillClick = (slug, name) => {
    if (slug === activeCatSlug && pillsAreHidden) {
      openSubDropdown(slug, name);
    } else {
      goCategory(slug);
    }
  };

  return (
    <>
      <style>{`
        @keyframes navDropdown {
          from { opacity:0; transform:translateY(-6px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .nav-dd { animation: navDropdown 0.15s ease both; }
        @keyframes slideDown {
          from { opacity:0; transform:translateY(-8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .mobile-search-animate { animation: slideDown 0.18s ease both; }
      `}</style>

      <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        {/* Promo strip — hidden on mobile to save space */}
        <div className="bg-[#de1c0e] text-white py-1.5 px-4 text-center text-xs font-medium hidden md:block">
          Genuine TVS Parts &amp; Accessories — Free shipping above ₹999 — 1 Year Warranty on all parts
        </div>

        <div className="max-w-screen-2xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">

          {/* ══════════════════════════════════════════════════════
              MOBILE SEARCH BAR — slides down when search icon tapped
              Grows at 375px and 425px via Tailwind arbitrary media queries
              Only on screens < sm (< 640px)
          ══════════════════════════════════════════════════════ */}
          {mobileSearchOpen && (
            <div ref={mobileSearchRef} className="mobile-search-animate sm:hidden py-2 border-b border-gray-100">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
                <div className="relative flex-1">

                  {/* Search icon: 16px default → 20px at 375px+ */}
                  <Search className="
                    absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 transition-all
                    w-4 h-4
                    [@media(min-width:375px)]:w-5 [@media(min-width:375px)]:h-5 [@media(min-width:375px)]:left-3.5
                  " />

                  {/* Input:
                      default  → text-sm,  py-2.5, pl-9,  pr-9,  rounded-xl
                      375px+   → text-base, py-3,   pl-11, pr-11, rounded-2xl
                      425px+   → py-3.5 (taller still)
                  */}
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search parts, accessories…"
                    className="
                      w-full border-2 border-gray-200 bg-gray-50 transition-all
                      focus:outline-none focus:border-[#0a1f44]
                      text-sm  py-2.5  pl-9  pr-9  rounded-xl
                      [@media(min-width:375px)]:text-base [@media(min-width:375px)]:py-3 [@media(min-width:375px)]:pl-11 [@media(min-width:375px)]:pr-11 [@media(min-width:375px)]:rounded-2xl
                      [@media(min-width:425px)]:py-3.5
                    "
                  />

                  {/* Clear button */}
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => { setSearchQuery(""); clearSearch?.(); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4 [@media(min-width:375px)]:w-5 [@media(min-width:375px)]:h-5" />
                    </button>
                  )}
                </div>

                {/* Cancel: text-sm px-1 default → text-base px-2 at 375px+ */}
                <button
                  type="button"
                  onClick={() => { setMobileSearchOpen(false); setSearchQuery(""); clearSearch?.(); }}
                  className="
                    text-gray-500 py-2 font-medium flex-shrink-0
                    text-sm  px-1
                    [@media(min-width:375px)]:text-base [@media(min-width:375px)]:px-2
                  "
                >
                  Cancel
                </button>
              </form>

              {/* Search results: card grows at 375px+ */}
              {searchResults?.length > 0 && (
                <div className="
                  mt-1 bg-white shadow-2xl border border-gray-100 z-50 overflow-hidden overflow-y-auto
                  rounded-xl  max-h-64
                  [@media(min-width:375px)]:rounded-2xl [@media(min-width:375px)]:max-h-72
                ">
                  {searchResults.map(product => (
                    <button
                      key={product._id}
                      onClick={() => handleSearchSelect(product)}
                      className="
                        w-full flex items-center gap-3 px-4 text-left
                        hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0
                        py-3
                        [@media(min-width:375px)]:py-3.5
                      "
                    >
                      {/* Product image: 36px default → 44px at 375px+ */}
                      <img
                        src={product.image}
                        alt={product.title}
                        className="
                          object-cover flex-shrink-0 bg-gray-100
                          w-9 h-9 rounded-lg
                          [@media(min-width:375px)]:w-11 [@media(min-width:375px)]:h-11 [@media(min-width:375px)]:rounded-xl
                        "
                        onError={e => { e.currentTarget.style.display = "none"; }}
                      />
                      <div className="flex-1 min-w-0">
                        {/* Product name: text-sm → text-base at 375px+ */}
                        <p className="
                          font-semibold text-gray-800 truncate
                          text-sm
                          [@media(min-width:375px)]:text-base
                        ">
                          {product.title}
                        </p>
                        {/* Meta: text-xs → text-sm at 375px+ */}
                        <p className="
                          text-gray-500
                          text-xs
                          [@media(min-width:375px)]:text-sm
                        ">
                          {product.category} · ₹{product.price?.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </button>
                  ))}
                  {/* "See all" footer: text-sm py-2.5 → text-base py-3 at 375px+ */}
                  <button
                    onClick={handleSearchSubmit}
                    className="
                      w-full px-4 text-[#0a1f44] font-semibold hover:bg-blue-50 text-center transition-colors
                      text-sm  py-2.5
                      [@media(min-width:375px)]:text-base [@media(min-width:375px)]:py-3
                    "
                  >
                    See all results for "{searchQuery}" →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Main row ── */}
          <div className="flex items-center gap-2 py-2.5 sm:py-3">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <img src={TVS_logo} alt="TVS Motors" className="h-9 sm:h-10 w-auto object-contain" />
            </Link>

            {/* ── DESKTOP SEARCH (sm and up) ── */}
            <div className="hidden sm:flex flex-1 relative" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search parts, accessories, bike model…"
                  className="w-full pl-9 pr-9 py-2.5 border-2 border-gray-200 rounded-xl text-sm
                             focus:outline-none focus:border-[#0a1f44] bg-gray-50 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(""); clearSearch?.(); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </form>
              {searchResults?.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl
                                border border-gray-100 z-50 overflow-hidden max-h-80 overflow-y-auto">
                  {searchResults.map(product => (
                    <button
                      key={product._id}
                      onClick={() => handleSearchSelect(product)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors
                                 text-left border-b border-gray-50 last:border-0"
                    >
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-10 h-10 object-cover rounded-lg flex-shrink-0 bg-gray-100"
                        onError={e => { e.currentTarget.style.display = "none"; }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{product.title}</p>
                        <p className="text-xs text-gray-500">{product.category} · ₹{product.price?.toLocaleString("en-IN")}</p>
                      </div>
                      <Search className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                    </button>
                  ))}
                  <button
                    onClick={handleSearchSubmit}
                    className="w-full px-4 py-2.5 text-[#0a1f44] text-sm font-semibold hover:bg-blue-50 text-center transition-colors"
                  >
                    See all results for "{searchQuery}" →
                  </button>
                </div>
              )}
            </div>

            {/* ── Right icons ── */}
            <div className="flex items-center gap-0.5 flex-shrink-0">

              {/* ══ MOBILE ONLY icons (< sm = < 640px) ══ */}

              {/* Mobile: Search icon */}
              <button
                onClick={() => { setMobileSearchOpen(s => !s); setMobileMenuOpen(false); }}
                className="sm:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors relative"
              >
                <Search className="w-5 h-5 text-gray-600" />
              </button>

              {/* Profile — always visible on all screens */}
              {isLoggedIn ? (
                <div className="relative" ref={userRef}>
                  <button
                    onClick={() => setShowUserMenu(s => !s)}
                    className="flex items-center gap-1.5 px-1.5 sm:px-2 md:px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-7 h-7 bg-[#de1c0e] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {user?.name?.[0]?.toUpperCase() ?? "U"}
                    </div>
                    <div className="hidden lg:block text-left">
                      <span className="text-sm font-medium text-gray-700 block max-w-[80px] truncate">{user?.name}</span>
                      <span className={`text-xs font-bold capitalize ${isDealer ? "text-blue-600" : isAdmin ? "text-red-600" : "text-gray-400"}`}>
                        {user?.role}
                      </span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-500 hidden md:block transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <p className="font-semibold text-gray-900 text-sm truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        <span className={`inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-full capitalize
                          ${isDealer ? "bg-blue-100 text-blue-700" : isAdmin ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                          {user?.role}
                        </span>
                      </div>
                      {isUser && (<>
                        <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition-colors">
                          <User className="w-4 h-4 text-[#0a1f44]" /> My Profile
                        </Link>
                        <Link to="/profile?tab=orders" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition-colors">
                          <Package className="w-4 h-4 text-[#0a1f44]" /> My Orders
                        </Link>
                      </>)}
                      {isDealer && (<>
                        <Link to="/dealer" className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 text-sm text-[#0a1f44] font-semibold transition-colors">
                          <Store className="w-4 h-4" /> Dealer Dashboard
                        </Link>
                        <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
                          <p className="text-xs text-gray-700">Dealer ID</p>
                          <p className="text-xs font-bold text-gray-900 font-mono">{user?.dealerId || "—"}</p>
                        </div>
                      </>)}
                      {isAdmin && (
                        <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-sm text-red-700 font-semibold transition-colors">
                          <Settings className="w-4 h-4" /> Admin Dashboard
                        </Link>
                      )}
                      <hr className="border-gray-100" />
                      <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-sm text-red-600 transition-colors">
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-white transition-colors"
                  style={{ backgroundColor: "#0a1f44" }}
                >
                  <User className="w-4 h-4" /><span className="hidden sm:block">Login</span>
                </Link>
              )}

              {/* ── DESKTOP-ONLY icons (sm and up) ── */}

              {/* More dropdown — desktop */}
              <div className="relative hidden sm:block" ref={moreRef}>
                <button
                  onClick={() => setShowMoreMenu(s => !s)}
                  className="flex items-center gap-1 px-2 py-2 rounded-xl hover:bg-gray-100 transition-colors text-sm text-gray-600 font-medium"
                >
                  More <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showMoreMenu ? "rotate-180" : ""}`} />
                </button>
                {showMoreMenu && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                    <Link to="/become-dealer" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm text-gray-700 border-b border-gray-50 transition-colors">
                      <Wrench className="w-4 h-4 text-[#0a1f44]" />
                      <div><p className="font-semibold">Become a Dealer</p><p className="text-xs text-gray-400">Partner with TVS</p></div>
                    </Link>
                    <Link to="/customer-care" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm text-gray-700 transition-colors">
                      <Shield className="w-4 h-4 text-[#0a1f44]" />
                      <div><p className="font-semibold">24×7 Support</p><p className="text-xs text-gray-400">We're here to help</p></div>
                    </Link>
                  </div>
                )}
              </div>

              {/* Notification bell — desktop */}
              {isLoggedIn && (
                <div className="relative hidden sm:block" ref={notifRef}>
                  <button
                    onClick={() => setShowNotifPanel(s => !s)}
                    className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <Bell className="w-5 h-5 text-gray-600" />
                    {unreadCount > 0 && <span className="badge-count">{unreadCount > 9 ? "9+" : unreadCount}</span>}
                  </button>
                  {showNotifPanel && (
                    <NotificationPanel
                      notifications={notifications}
                      unreadCount={unreadCount}
                      markRead={markRead}
                      markAllRead={markAllRead}
                      deleteNotif={deleteNotif}
                      onClose={() => setShowNotifPanel(false)}
                    />
                  )}
                </div>
              )}

              {/* Wishlist — desktop */}
              {showCartWishlist && (
                <button
                  onClick={goWishlist}
                  className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors group hidden sm:flex"
                  title="Wishlist"
                >
                  <Heart className="w-5 h-5 text-gray-600 group-hover:text-[#0a1f44] transition-colors" />
                  {wishlistCount > 0 && <span className="badge-count">{wishlistCount > 9 ? "9+" : wishlistCount}</span>}
                </button>
              )}

              {/* Cart — desktop */}
              {showCartWishlist && (
                <button
                  onClick={goCart}
                  className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors group hidden sm:flex"
                  title="Cart"
                >
                  <ShoppingCart className="w-5 h-5 text-gray-600 group-hover:text-[#0a1f44] transition-colors" />
                  {cartCount > 0 && <span className="badge-count">{cartCount > 9 ? "9+" : cartCount}</span>}
                </button>
              )}

              {/* ── MOBILE hamburger (< sm) ── */}
              <button
                onClick={() => { setMobileMenuOpen(s => !s); setMobileSearchOpen(false); }}
                className="sm:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors relative"
              >
                <Menu className="w-5 h-5 text-gray-600" />
                {/* Badge on hamburger = total of cart+wishlist+notif */}
                {(cartCount + wishlistCount + unreadCount) > 0 && (
                  <span className="badge-count">
                    {Math.min((cartCount + wishlistCount + unreadCount), 9)}
                    {(cartCount + wishlistCount + unreadCount) > 9 ? "+" : ""}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* ── Category pill bar ── */}
          <div className="pb-2.5">
            {catsLoading ? (
              <div className="flex items-center justify-evenly overflow-x-auto no-scrollbar">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="h-7 rounded-full bg-gray-100 animate-pulse flex-shrink-0"
                    style={{ width: `${60 + (i % 3) * 18}px` }}
                  />
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-evenly overflow-x-auto no-scrollbar">
                {[...categories, { name: "All Parts", slug: "__all__" }].map(({ name, slug }) => {
                  const isAll          = slug === "__all__";
                  const isActive       = isAll ? !activeCatSlug : activeCatSlug === slug;
                  const showChevron    = !isAll && isActive && pillsAreHidden;
                  const isDropdownOpen = openCatDropdown === slug;

                  return (
                    <div
                      key={slug}
                      className="relative flex-shrink-0"
                      ref={el => { pillRefs.current[slug] = el; }}
                    >
                      <button
                        onClick={() => isAll ? navigate("/products") : handlePillClick(slug, name)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold
                          whitespace-nowrap border transition-all select-none
                          ${isActive
                            ? "bg-[#0a1f44] text-white border-[#0a1f44]"
                            : "border-gray-200 bg-white text-gray-700 hover:bg-[#0a1f44] hover:text-white hover:border-[#0a1f44]"}`}
                      >
                        {name}
                        {showChevron && (
                          <ChevronDown className={`w-3 h-3 ml-0.5 flex-shrink-0 transition-transform duration-200
                            ${isDropdownOpen ? "rotate-180" : ""}`} />
                        )}
                      </button>

                      {isDropdownOpen && (
                        <div className="nav-dd absolute left-0 top-full mt-2 z-[60] bg-white
                                        rounded-2xl shadow-2xl border border-gray-100 overflow-hidden min-w-[210px]">
                          <div className="px-4 py-2.5 bg-[#0a1f44] flex items-center justify-between">
                            <p className="text-xs font-black text-white uppercase tracking-wider">{dropdownName}</p>
                            {dropdownLoading && (
                              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            )}
                          </div>
                          {dropdownLoading && dropdownSubs.length === 0 ? (
                            <div className="p-3 space-y-2">
                              {[...Array(5)].map((_, i) => (
                                <div
                                  key={i}
                                  className="h-3 bg-gray-100 rounded-full animate-pulse"
                                  style={{ width: `${65 + (i % 3) * 15}%` }}
                                />
                              ))}
                            </div>
                          ) : dropdownSubs.length === 0 ? (
                            <p className="px-4 py-3 text-xs text-gray-400">No sub-categories found</p>
                          ) : (
                            <div className="max-h-72 overflow-y-auto">
                              <button
                                onClick={() => goCategory(slug)}
                                className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors
                                  border-b border-gray-100 flex items-center gap-2.5
                                  ${!activeSubSlug
                                    ? "text-[#0a1f44] bg-blue-50"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-[#0a1f44]"}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${!activeSubSlug ? "bg-[#0a1f44]" : "bg-gray-300"}`} />
                                All {dropdownName}
                              </button>
                              {dropdownSubs.map(sub => (
                                <button
                                  key={sub.slug}
                                  onClick={() => goSubCategory(slug, sub.slug)}
                                  className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors
                                    border-b border-gray-100 last:border-0 flex items-center gap-2.5
                                    ${activeSubSlug === sub.slug
                                      ? "text-[#0a1f44] bg-blue-50"
                                      : "text-gray-600 hover:bg-gray-50 hover:text-[#0a1f44]"}`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0
                                    ${activeSubSlug === sub.slug ? "bg-[#0a1f44]" : "bg-gray-300"}`} />
                                  {sub.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════
          MOBILE DRAWER MENU (< sm = < 640px)
          Contains: Cart, Wishlist, Notifications, More, Become Dealer
      ══════════════════════════════════════════════════════ */}
      {mobileMenuOpen && (
        <div
          className="sm:hidden fixed left-0 right-0 bottom-0 z-40 bg-white border-t border-gray-100 shadow-xl overflow-y-auto"
          style={{ top: headerHeight > 0 ? `${headerHeight}px` : "57px" }}
        >
          <div className="px-4 py-3 space-y-0.5">

            {/* ── Quick action row: Cart + Wishlist + Notifications ── */}
            {isLoggedIn && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {showCartWishlist && (
                  <button
                    onClick={() => { setMobileMenuOpen(false); goCart(); }}
                    className="flex flex-col items-center gap-1 py-3 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors relative"
                  >
                    <ShoppingCart className="w-5 h-5 text-[#0a1f44]" />
                    <span className="text-xs font-semibold text-gray-700">Cart</span>
                    {cartCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-[#0a1f44] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                        {cartCount > 9 ? "9+" : cartCount}
                      </span>
                    )}
                  </button>
                )}
                {showCartWishlist && (
                  <button
                    onClick={() => { setMobileMenuOpen(false); goWishlist(); }}
                    className="flex flex-col items-center gap-1 py-3 rounded-xl bg-gray-50 hover:bg-red-50 transition-colors relative"
                  >
                    <Heart className="w-5 h-5 text-[#0a1f44]" />
                    <span className="text-xs font-semibold text-gray-700">Wishlist</span>
                    {wishlistCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-[#0a1f44] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                        {wishlistCount > 9 ? "9+" : wishlistCount}
                      </span>
                    )}
                  </button>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setTimeout(() => setShowNotifPanel(true), 100);
                  }}
                  className="flex flex-col items-center gap-1 py-3 rounded-xl bg-gray-50 hover:bg-yellow-50 transition-colors relative"
                >
                  <Bell className="w-5 h-5 text-[#0a1f44]" />
                  <span className="text-xs font-semibold text-gray-700">Alerts</span>
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-[#de1c0e] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
              </div>
            )}

            <div className="border-t border-gray-100 my-2" />

            {/* ── More / Become Dealer ── */}
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider pt-1 pb-2">More</p>
            <Link
              to="/become-dealer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 py-2.5 text-sm text-gray-700 hover:text-[#0a1f44]"
            >
              <Wrench className="w-4 h-4 text-[#0a1f44]" />
              <div>
                <p className="font-semibold">Become a Dealer</p>
                <p className="text-xs text-gray-400">Partner with TVS</p>
              </div>
            </Link>
            <Link
              to="/customer-care"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 py-2.5 text-sm text-gray-700 hover:text-[#0a1f44]"
            >
              <Shield className="w-4 h-4 text-[#0a1f44]" />
              <div>
                <p className="font-semibold">24×7 Support</p>
                <p className="text-xs text-gray-400">We're here to help</p>
              </div>
            </Link>

            {isDealer && (
              <Link
                to="/dealer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2.5 text-sm font-semibold text-[#0a1f44]"
              >
                <Store className="w-4 h-4" /> Dealer Dashboard
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2.5 text-sm font-semibold text-red-600"
              >
                <Settings className="w-4 h-4" /> Admin Dashboard
              </Link>
            )}

            <div className="border-t border-gray-100 my-2" />

            {/* ── Shop by Category ── */}
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider py-1">Shop by Category</p>
            {catsLoading ? (
              <div className="space-y-2 py-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-8 rounded-lg bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : (
              categories.map(({ name, slug, subCategories = [] }) => {
                const subs       = (subCategories || []).filter(s => s.isActive !== false);
                const isExpanded = mobileExpandedCat === slug;
                const isActive   = activeCatSlug === slug;
                return (
                  <div key={slug}>
                    <div className="flex items-center">
                      <button
                        onClick={() => goCategory(slug)}
                        className={`flex-1 text-left py-2.5 text-sm font-medium
                          ${isActive ? "text-[#0a1f44] font-semibold" : "text-gray-700"}`}
                      >
                        {name}
                      </button>
                      {subs.length > 0 && (
                        <button onClick={() => toggleMobileCat(slug)} className="p-2 text-gray-400">
                          <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                        </button>
                      )}
                    </div>
                    {isExpanded && subs.length > 0 && (
                      <div className="ml-4 border-l-2 border-gray-100 pl-3 mb-1 space-y-0.5">
                        {subs.map(sub => (
                          <button
                            key={sub.slug}
                            onClick={() => goSubCategory(slug, sub.slug)}
                            className={`w-full text-left text-sm py-2 flex items-center gap-2
                              ${activeSubSlug === sub.slug ? "text-[#0a1f44] font-semibold" : "text-gray-500 hover:text-[#0a1f44]"}`}
                          >
                            <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                            {sub.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Mobile notification panel overlay */}
      {showNotifPanel && (
        <div
          className="sm:hidden fixed inset-0 z-50 bg-black/40"
          onClick={() => setShowNotifPanel(false)}
        >
          <div
            className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <NotificationPanel
              notifications={notifications}
              unreadCount={unreadCount}
              markRead={markRead}
              markAllRead={markAllRead}
              deleteNotif={deleteNotif}
              onClose={() => setShowNotifPanel(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}