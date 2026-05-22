import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingCart, Heart, Search, User, ChevronDown, X,
  LogOut, Settings, Package, Menu, Wrench, Zap,
  Shield, Gauge, CircleDot, Droplets, Wind, Star
} from 'lucide-react';
import { useProducts } from '../hooks/useProducts';

/* ── TVS Bike Parts Categories ── */
const CATEGORIES = [
  { name: 'Engine Parts',   icon: Wrench,    value: 'Engine',    },
  { name: 'Brakes',         icon: CircleDot, value: 'Brakes',    },
  { name: 'Electricals',    icon: Zap,       value: 'Electricals'},
  { name: 'Body Parts',     icon: Shield,    value: 'Body',      },
  { name: 'Tyres & Wheels', icon: Gauge,     value: 'Tyres',     },
  { name: 'Lubricants',     icon: Droplets,  value: 'Lubricants' },
  { name: 'Suspension',     icon: Wind,      value: 'Suspension' },
  { name: 'Accessories',    icon: Star,      value: 'Accessories'},
];

export default function Navbar({ auth, cartHook, wishlistHook }) {
  const { user, logout, isLoggedIn } = auth || {};
  const cartCount     = cartHook?.cartCount     ?? 0;
  const wishlistCount = wishlistHook?.wishlistCount ?? 0;

  const navigate  = useNavigate();
  const location  = useLocation();
  const { searchResults, searchProducts, clearSearch } = useProducts();

  const [searchQuery,    setSearchQuery]    = useState('');
  const [showMoreMenu,   setShowMoreMenu]   = useState(false);
  const [showUserMenu,   setShowUserMenu]   = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const searchRef   = useRef(null);
  const moreRef     = useRef(null);
  const userRef     = useRef(null);
  const searchTimer = useRef(null);

  /* close everything on route change */
  useEffect(() => {
    setShowMoreMenu(false);
    setShowUserMenu(false);
    setMobileMenuOpen(false);
    setSearchQuery('');
    clearSearch?.();
  }, [location.pathname]);

  /* click-outside close */
  useEffect(() => {
    const h = (e) => {
      if (moreRef.current   && !moreRef.current.contains(e.target))   setShowMoreMenu(false);
      if (userRef.current   && !userRef.current.contains(e.target))    setShowUserMenu(false);
      if (searchRef.current && !searchRef.current.contains(e.target))  clearSearch?.();
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  /* debounced search */
  const handleSearchChange = useCallback((e) => {
    const val = e.target.value;
    setSearchQuery(val);
    clearTimeout(searchTimer.current);
    if (val.length > 0) searchTimer.current = setTimeout(() => searchProducts?.(val), 220);
    else clearSearch?.();
  }, [searchProducts, clearSearch]);

  const handleSearchSelect = (product) => {
    navigate(`/products/${product._id}`);
    setSearchQuery('');
    clearSearch?.();
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      clearSearch?.();
    }
  };

  const goCart     = () => { if (!isLoggedIn) navigate('/login'); else navigate('/cart'); };
  const goWishlist = () => { if (!isLoggedIn) navigate('/login'); else navigate('/wishlist'); };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">

      {/* ── TOP STRIP ── */}
      <div className="bg-[#0a1f44] text-white py-1.5 px-4 text-center text-xs font-medium hidden md:block">
        🚗 Genuine TVS Parts &amp; Accessories — Free shipping above ₹999 — 1 Year Warranty on all parts
      </div>

      {/* ── MAIN ROW ── */}
      <div className="max-w-7xl mx-auto px-3 md:px-6">
        <div className="flex items-center gap-3 py-3">

          {/* ── TVS Logo ── */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-10 h-8 bg-[#0a1f44] rounded-lg flex items-center justify-center shadow-sm">
              <svg viewBox="0 0 48 32" className="w-9 h-6" fill="none">
                <text x="24" y="22" textAnchor="middle"
                  style={{fontFamily:'Inter,sans-serif',fontWeight:900,fontSize:16,fill:'white',letterSpacing:1}}>
                  TVS
                </text>
              </svg>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-black text-[#0a1f44] tracking-wider leading-none">TVS MOTORS</p>
              <p className="text-[10px] text-gray-500 tracking-wide">Parts &amp; Accessories</p>
            </div>
          </Link>

          {/* ── Search Bar ── */}
          <div className="flex-1 relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4
                                 text-gray-400 pointer-events-none" />
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
                  onClick={() => { setSearchQuery(''); clearSearch?.(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>

            {/* Search dropdown */}
            {searchResults?.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl
                              shadow-2xl border border-gray-100 z-50 overflow-hidden max-h-80 overflow-y-auto">
                {searchResults.map(product => (
                  <button
                    key={product._id}
                    onClick={() => handleSearchSelect(product)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50
                               transition-colors text-left border-b border-gray-50 last:border-0"
                  >
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-10 h-10 object-cover rounded-lg flex-shrink-0 bg-gray-100"
                      onError={e => { e.currentTarget.style.display = 'none'; }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{product.title}</p>
                      <p className="text-xs text-gray-500">
                        {product.category} · ₹{product.price?.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <Search className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                  </button>
                ))}
                <button
                  onClick={handleSearchSubmit}
                  className="w-full px-4 py-2.5 text-[#0a1f44] text-sm font-semibold
                             hover:bg-blue-50 text-center transition-colors"
                >
                  See all results for "{searchQuery}" →
                </button>
              </div>
            )}
          </div>

          {/* ── Right Actions ── */}
          <div className="flex items-center gap-0.5 md:gap-1 flex-shrink-0">

            {/* Login / Profile */}
            {isLoggedIn ? (
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setShowUserMenu(s => !s)}
                  className="flex items-center gap-1.5 px-2 md:px-3 py-2 rounded-xl
                             hover:bg-gray-100 transition-colors"
                >
                  <div className="w-7 h-7 bg-[#0a1f44] rounded-full flex items-center
                                  justify-center text-white text-xs font-bold">
                    {user?.name?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden lg:block max-w-[80px] truncate">
                    {user?.name}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-500 hidden md:block
                                           transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl
                                  shadow-2xl border border-gray-100 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                      <p className="font-semibold text-gray-900 text-sm truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <Link to="/profile"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50
                                 text-sm text-gray-700 transition-colors">
                      <User className="w-4 h-4 text-[#0a1f44]" /> My Profile
                    </Link>
                    <Link to="/orders"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50
                                 text-sm text-gray-700 transition-colors">
                      <Package className="w-4 h-4 text-[#0a1f44]" /> My Orders
                    </Link>
                    {user?.role === 'admin' && (
                      <Link to="/admin"
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50
                                   text-sm text-[#0a1f44] font-semibold transition-colors">
                        <Settings className="w-4 h-4" /> Admin Dashboard
                      </Link>
                    )}
                    <hr className="border-gray-100" />
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50
                                 text-sm text-red-600 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold
                           text-white transition-colors"
                style={{ backgroundColor: '#0a1f44' }}
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:block">Login</span>
              </Link>
            )}

            {/* More dropdown */}
            <div className="relative hidden md:block" ref={moreRef}>
              <button
                onClick={() => setShowMoreMenu(s => !s)}
                className="flex items-center gap-1 px-2 py-2 rounded-xl hover:bg-gray-100
                           transition-colors text-sm text-gray-600 font-medium"
              >
                More
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showMoreMenu ? 'rotate-180' : ''}`} />
              </button>
              {showMoreMenu && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl
                                shadow-2xl border border-gray-100 z-50 overflow-hidden">
                  <Link to="/become-seller"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm text-gray-700
                               border-b border-gray-50 transition-colors">
                    <Wrench className="w-4 h-4 text-[#0a1f44]" />
                    <div>
                      <p className="font-semibold">Become a Dealer</p>
                      <p className="text-xs text-gray-400">Partner with TVS</p>
                    </div>
                  </Link>
                  <Link to="/customer-care"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm text-gray-700
                               transition-colors">
                    <Shield className="w-4 h-4 text-[#0a1f44]" />
                    <div>
                      <p className="font-semibold">24×7 Support</p>
                      <p className="text-xs text-gray-400">We're here to help</p>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Wishlist */}
            <button
              onClick={goWishlist}
              className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors group"
              title="Wishlist"
            >
              <Heart className="w-5 h-5 text-gray-600 group-hover:text-[#0a1f44] transition-colors" />
              {isLoggedIn && wishlistCount > 0 && (
                <span className="badge-count">{wishlistCount > 9 ? '9+' : wishlistCount}</span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={goCart}
              className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors group"
              title="Cart"
            >
              <ShoppingCart className="w-5 h-5 text-gray-600 group-hover:text-[#0a1f44] transition-colors" />
              {isLoggedIn && cartCount > 0 && (
                <span className="badge-count">{cartCount > 9 ? '9+' : cartCount}</span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(s => !s)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* ── CATEGORY BAR ── */}
        <div className="flex items-center gap-8 overflow-x-auto pb-2.5 no-scrollbar">
          {CATEGORIES.map(({ name, icon: Icon, value }) => (
            <button
              key={value}
              onClick={() => navigate(`/products/category/${value}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
                         whitespace-nowrap flex-shrink-0 border border-gray-200 bg-white text-gray-700
                         hover:bg-[#0a1f44] hover:text-white hover:border-[#0a1f44] transition-all"
            >
              <Icon className="w-3.5 h-3.5" />
              {name}
            </button>
          ))}
          <button
            onClick={() => navigate('/products')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
                       whitespace-nowrap flex-shrink-0 bg-[#0a1f44] text-white border border-[#0a1f44]
                       hover:bg-[#0d2657] transition-all"
          >
            All Parts
          </button>
        </div>
      </div>

      {/* ── MOBILE MENU ── */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1">
          <Link to="/become-seller"
            className="flex items-center gap-2 py-2 text-sm text-gray-700 hover:text-[#0a1f44]">
            <Wrench className="w-4 h-4" /> Become a Dealer
          </Link>
          <Link to="/customer-care"
            className="flex items-center gap-2 py-2 text-sm text-gray-700 hover:text-[#0a1f44]">
            <Shield className="w-4 h-4" /> 24×7 Support
          </Link>
        </div>
      )}
    </header>
  );
}