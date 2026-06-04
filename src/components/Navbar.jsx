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

export default function Navbar({ auth, cartHook, wishlistHook, notifHook, subPillsVisible }) {
  const { user, logout, isLoggedIn } = auth || {};
  const cartCount     = cartHook?.cartCount     ?? 0;
  const wishlistCount = wishlistHook?.wishlistCount ?? 0;
  const { notifications = [], unreadCount = 0, markRead, markAllRead, deleteNotif } = notifHook || {};

  const navigate = useNavigate();
  const location = useLocation();
  const { searchResults, searchProducts, clearSearch } = useProducts();

  const [searchQuery,       setSearchQuery]       = useState("");
  const [showMoreMenu,      setShowMoreMenu]       = useState(false);
  const [showUserMenu,      setShowUserMenu]       = useState(false);
  const [showNotifPanel,    setShowNotifPanel]     = useState(false);
  const [mobileMenuOpen,    setMobileMenuOpen]     = useState(false);
  const [categories,        setCategories]         = useState([]);
  const [catsLoading,       setCatsLoading]        = useState(true);
  const [mobileExpandedCat, setMobileExpandedCat]  = useState(null);
  const [headerHeight,      setHeaderHeight]        = useState(0);
  const [openCatDropdown,   setOpenCatDropdown]    = useState(null); // slug of open dropdown

  const searchRef   = useRef(null);
  const moreRef     = useRef(null);
  const userRef     = useRef(null);
  const notifRef    = useRef(null);
  const searchTimer = useRef(null);
  const headerRef   = useRef(null);
  // Map of slug → pill button DOM node, for positioning the dropdown
  const pillRefs    = useRef({});

  const isDealer = user?.role === "dealer";
  const isAdmin  = user?.role === "admin";
  const isUser   = user?.role === "user";

  const activeCatSlug = location.pathname.match(/\/products\/category\/([^/?]+)/)?.[1]?.toLowerCase() || null;
  const activeSubSlug = new URLSearchParams(location.search).get("sub") || null;

  /* ── subPillsVisible: treat undefined/null as true (not yet observed) ── */
  // The dropdown should only show when subPillsVisible is explicitly false
  const pillsAreHidden = subPillsVisible === false;

  /* ── Fetch categories ── */
  useEffect(() => {
    setCatsLoading(true);
    fetch("/api/categories?nav=true")
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (Array.isArray(data))
          setCategories([...data].sort((a, b) => (a.navOrder ?? 99) - (b.navOrder ?? 99)));
      })
      .catch(() => {})
      .finally(() => setCatsLoading(false));
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

  /* ── Auto-close dropdown when sub-pills come back into view ── */
  useEffect(() => {
    if (!pillsAreHidden) setOpenCatDropdown(null);
  }, [pillsAreHidden]);

  /* ── Close all panels on route change ── */
  useEffect(() => {
    setShowMoreMenu(false);
    setShowUserMenu(false);
    setMobileMenuOpen(false);
    setShowNotifPanel(false);
    setSearchQuery("");
    setMobileExpandedCat(null);
    setOpenCatDropdown(null);
    clearSearch?.();
  }, [location.pathname, location.search]);

  /* ── Global click-outside handler ── */
  useEffect(() => {
    const h = (e) => {
      if (moreRef.current   && !moreRef.current.contains(e.target))   setShowMoreMenu(false);
      if (userRef.current   && !userRef.current.contains(e.target))   setShowUserMenu(false);
      if (notifRef.current  && !notifRef.current.contains(e.target))  setShowNotifPanel(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) clearSearch?.();
      // Cat dropdown close-on-outside is handled by stopPropagation on the pill button,
      // so any click that reaches the document means it was outside — just close it.
      setOpenCatDropdown(null);
    };
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, []);

  /* ── Search ── */
  const handleSearchChange = useCallback((e) => {
    const val = e.target.value;
    setSearchQuery(val);
    clearTimeout(searchTimer.current);
    if (val.length > 0)
      searchTimer.current = setTimeout(() => searchProducts?.(val), 220);
    else clearSearch?.();
  }, [searchProducts, clearSearch]);

  const handleSearchSelect = (product) => {
    navigate(`/products/${product._id}`);
    setSearchQuery(""); clearSearch?.();
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      clearSearch?.();
    }
  };

  /* ── Navigation helpers ── */
  const goCategory = useCallback((slug) => {
    setMobileMenuOpen(false);
    setOpenCatDropdown(null);
    navigate(`/products/category/${slug}`);
  }, [navigate]);

  const goSubCategory = useCallback((catSlug, subSlug) => {
    setMobileMenuOpen(false);
    setOpenCatDropdown(null);
    navigate(`/products/category/${catSlug}?sub=${subSlug}`);
  }, [navigate]);

  const goCart     = () => isLoggedIn ? navigate("/cart")     : navigate("/login");
  const goWishlist = () => isLoggedIn ? navigate("/wishlist") : navigate("/login");
  const toggleMobileCat = (slug) => setMobileExpandedCat(p => p === slug ? null : slug);

  /* ── Derived ── */
  const activeCatObj  = categories.find(c => c.slug === activeCatSlug) || null;
  const activeSubs    = (activeCatObj?.subCategories || []).filter(s => s.isActive !== false);
  const hasActiveSubs = activeSubs.length > 0;

  // The dropdown trigger is visible only when:
  // 1. We're on a category page  2. That category has subs  3. Page pills are scrolled away
  const showDropdownTrigger = !!activeCatSlug && hasActiveSubs && pillsAreHidden;

  /* ── Handle pill click ── */
  const handlePillClick = (slug) => {
    const isActive = slug === activeCatSlug;
    if (isActive && showDropdownTrigger) {
      // Toggle the sub-category dropdown instead of navigating
      setOpenCatDropdown(p => p === slug ? null : slug);
    } else {
      goCategory(slug);
    }
  };

  return (
    <>
      {/* Dropdown animation keyframes injected once */}
      <style>{`
        @keyframes navDropdown {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        .nav-dropdown-enter { animation: navDropdown 0.18s cubic-bezier(.22,.68,0,1.2) both; }
      `}</style>

      <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        {/* Promo strip */}
        <div className="bg-[#de1c0e] text-white py-1.5 px-4 text-center text-xs font-medium hidden md:block">
          Genuine TVS Parts &amp; Accessories — Free shipping above ₹999 — 1 Year Warranty on all parts
        </div>

        <div className="max-w-7xl mx-auto px-3 md:px-6">

          {/* ── Main row ── */}
          <div className="flex items-center gap-3 py-3">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
              <img src={TVS_logo} alt="TVS Motors" className="h-10 w-auto object-contain" />
            </Link>

            {/* Search */}
            <div className="flex-1 relative" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text" value={searchQuery} onChange={handleSearchChange}
                  placeholder="Search parts, accessories, bike model…"
                  className="w-full pl-9 pr-9 py-2.5 border-2 border-gray-200 rounded-xl text-sm
                             focus:outline-none focus:border-[#0a1f44] bg-gray-50 transition-all"
                />
                {searchQuery && (
                  <button type="button" onClick={() => { setSearchQuery(""); clearSearch?.(); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </form>

              {searchResults?.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl
                                border border-gray-100 z-50 overflow-hidden max-h-80 overflow-y-auto">
                  {searchResults.map((product) => (
                    <button key={product._id} onClick={() => handleSearchSelect(product)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors
                                 text-left border-b border-gray-50 last:border-0">
                      <img src={product.image} alt={product.title}
                        className="w-10 h-10 object-cover rounded-lg flex-shrink-0 bg-gray-100"
                        onError={e => { e.currentTarget.style.display = "none"; }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{product.title}</p>
                        <p className="text-xs text-gray-500">
                          {product.category} · ₹{product.price?.toLocaleString("en-IN")}
                        </p>
                      </div>
                      <Search className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                    </button>
                  ))}
                  <button onClick={handleSearchSubmit}
                    className="w-full px-4 py-2.5 text-[#0a1f44] text-sm font-semibold hover:bg-blue-50 text-center transition-colors">
                    See all results for "{searchQuery}" →
                  </button>
                </div>
              )}
            </div>

            {/* ── Right icons ── */}
            <div className="flex items-center gap-0.5 md:gap-1 flex-shrink-0">

              {/* User menu */}
              {isLoggedIn ? (
                <div className="relative" ref={userRef}>
                  <button onClick={() => setShowUserMenu(s => !s)}
                    className="flex items-center gap-1.5 px-2 md:px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="w-7 h-7 bg-[#de1c0e] rounded-full flex items-center justify-center text-white text-xs font-bold">
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
                <Link to="/login" className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors"
                  style={{ backgroundColor: "#0a1f44" }}>
                  <User className="w-4 h-4" /><span className="hidden sm:block">Login</span>
                </Link>
              )}

              {/* More */}
              <div className="relative hidden md:block" ref={moreRef}>
                <button onClick={() => setShowMoreMenu(s => !s)}
                  className="flex items-center gap-1 px-2 py-2 rounded-xl hover:bg-gray-100 transition-colors text-sm text-gray-600 font-medium">
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

              {/* Notifications */}
              {isLoggedIn && (
                <div className="relative" ref={notifRef}>
                  <button onClick={() => setShowNotifPanel(s => !s)}
                    className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors">
                    <Bell className="w-5 h-5 text-gray-600" />
                    {unreadCount > 0 && <span className="badge-count">{unreadCount > 9 ? "9+" : unreadCount}</span>}
                  </button>
                  {showNotifPanel && (
                    <NotificationPanel notifications={notifications} unreadCount={unreadCount}
                      markRead={markRead} markAllRead={markAllRead} deleteNotif={deleteNotif}
                      onClose={() => setShowNotifPanel(false)} />
                  )}
                </div>
              )}

              {/* Wishlist */}
              {isUser && (
                <button onClick={goWishlist} className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors group" title="Wishlist">
                  <Heart className="w-5 h-5 text-gray-600 group-hover:text-[#0a1f44] transition-colors" />
                  {wishlistCount > 0 && <span className="badge-count">{wishlistCount > 9 ? "9+" : wishlistCount}</span>}
                </button>
              )}

              {/* Cart */}
              {isUser && (
                <button onClick={goCart} className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors group" title="Cart">
                  <ShoppingCart className="w-5 h-5 text-gray-600 group-hover:text-[#0a1f44] transition-colors" />
                  {cartCount > 0 && <span className="badge-count">{cartCount > 9 ? "9+" : cartCount}</span>}
                </button>
              )}

              {/* Mobile hamburger */}
              <button onClick={() => setMobileMenuOpen(s => !s)}
                className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* ── Category pill bar ──────────────────────────────────────────
              Uses justify-evenly so pills are evenly spaced across the
              full width instead of left-aligned with a fixed gap.
          ──────────────────────────────────────────────────────────────── */}
          <div className="pb-2.5">
            {catsLoading ? (
              <div className="flex items-center justify-evenly gap-1 overflow-x-auto no-scrollbar">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-7 rounded-full bg-gray-100 animate-pulse flex-shrink-0"
                    style={{ width: `${60 + (i % 3) * 18}px` }} />
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-evenly overflow-x-auto no-scrollbar">
                {[...categories, { name: "All Parts", slug: "__all__" }].map(({ name, slug, subCategories = [] }) => {
                  const isAll    = slug === "__all__";
                  const isActive = isAll ? !activeCatSlug : activeCatSlug === slug;
                  const subs     = !isAll ? (subCategories || []).filter(s => s.isActive !== false) : [];

                  // Show the dropdown chevron only when:
                  // this is the active category AND it has subs AND the page sub-pills are hidden
                  const showChevron   = !isAll && isActive && showDropdownTrigger;
                  const isDropdownOpen = openCatDropdown === slug;

                  return (
                    <div
                      key={slug}
                      className="relative flex-shrink-0"
                      ref={el => { pillRefs.current[slug] = el; }}
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        onClick={() => isAll
                          ? navigate("/products")
                          : handlePillClick(slug)
                        }
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold
                          whitespace-nowrap border transition-all select-none
                          ${isActive
                            ? "bg-[#0a1f44] text-white border-[#0a1f44]"
                            : "border-gray-200 bg-white text-gray-700 hover:bg-[#0a1f44] hover:text-white hover:border-[#0a1f44]"}`}
                      >
                        {name}
                        {showChevron && (
                          <ChevronDown
                            className={`w-3 h-3 ml-0.5 flex-shrink-0 transition-transform duration-200
                              ${isDropdownOpen ? "rotate-180" : ""}`}
                          />
                        )}
                      </button>

                      {/* ── Sub-category dropdown ── */}
                      {isDropdownOpen && subs.length > 0 && (
                        <div className="nav-dropdown-enter absolute left-0 top-full mt-2 z-[60] bg-white
                                        rounded-2xl shadow-2xl border border-gray-100 overflow-hidden min-w-[190px]">
                          {/* Header */}
                          <div className="px-4 py-2 bg-[#0a1f44]">
                            <p className="text-xs font-black text-white uppercase tracking-wider">{name}</p>
                          </div>

                          {/* All [Category] */}
                          <button
                            onClick={() => goCategory(slug)}
                            className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors
                              border-b border-gray-50 flex items-center gap-2.5
                              ${!activeSubSlug
                                ? "text-[#0a1f44] bg-blue-50"
                                : "text-gray-600 hover:bg-gray-50 hover:text-[#0a1f44]"}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0
                              ${!activeSubSlug ? "bg-[#0a1f44]" : "bg-gray-300"}`}
                            />
                            All {name}
                          </button>

                          {/* Each sub */}
                          {subs.map(sub => (
                            <button
                              key={sub.slug}
                              onClick={() => goSubCategory(slug, sub.slug)}
                              className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors
                                border-b border-gray-50 last:border-0 flex items-center gap-2.5
                                ${activeSubSlug === sub.slug
                                  ? "text-[#0a1f44] bg-blue-50"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-[#0a1f44]"}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0
                                ${activeSubSlug === sub.slug ? "bg-[#0a1f44]" : "bg-gray-300"}`}
                              />
                              {sub.name}
                            </button>
                          ))}
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

      {/* ── Mobile menu ── */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed left-0 right-0 bottom-0 z-40 bg-white border-t border-gray-100 shadow-xl overflow-y-auto"
          style={{ top: headerHeight > 0 ? `${headerHeight}px` : "57px" }}
        >
          <div className="px-4 py-3 space-y-0.5">
            {isDealer && (
              <Link to="/dealer" className="flex items-center gap-2 py-2 text-sm font-semibold text-[#0a1f44]">
                <Store className="w-4 h-4" /> Dealer Dashboard
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className="flex items-center gap-2 py-2 text-sm font-semibold text-red-600">
                <Settings className="w-4 h-4" /> Admin Dashboard
              </Link>
            )}
            <Link to="/become-dealer" className="flex items-center gap-2 py-2 text-sm text-gray-700 hover:text-[#0a1f44]">
              <Wrench className="w-4 h-4" /> Become a Dealer
            </Link>
            <Link to="/customer-care" className="flex items-center gap-2 py-2 text-sm text-gray-700 hover:text-[#0a1f44]">
              <Shield className="w-4 h-4" /> 24×7 Support
            </Link>
            <div className="border-t border-gray-100 my-2" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider py-1">Shop by Category</p>

            {catsLoading ? (
              <div className="space-y-2 py-2">
                {[...Array(6)].map((_, i) => <div key={i} className="h-8 rounded-lg bg-gray-100 animate-pulse" />)}
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
                              ${activeSubSlug === sub.slug
                                ? "text-[#0a1f44] font-semibold"
                                : "text-gray-500 hover:text-[#0a1f44]"}`}
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
    </>
  );
}