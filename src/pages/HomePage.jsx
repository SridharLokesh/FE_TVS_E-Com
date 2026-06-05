import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, Truck, Shield, RotateCcw, Headphones,
  Wrench, Zap, CircleDot, Wind, Droplets, Gauge, Star,
  ChevronLeft, ChevronRight, CheckCircle, Tag,
} from "lucide-react";
import ProductCard from "../components/ProductCard";
import { useProducts } from "../hooks/useProducts";
import api from "../utils/api";

/* ── Banners — catSlug matches EXACT slug from seed file ── */
const BANNERS = [
  {
    title:    "Genuine TVS Engine Parts",
    subtitle: "OEM-certified parts for peak performance",
    btn:      "Shop Engine Parts",
    catSlug:  "engine-parts",
    from: "from-[#0a1f44]", to: "to-slate-700",
  },
  {
    title:    "Brake & Safety Components",
    subtitle: "Stop safely with certified TVS brake systems",
    btn:      "Shop Brakes",
    catSlug:  "brakes",
    from: "from-slate-900", to: "to-[#0a1f44]",
  },
  {
    title:    "TVS Accessories Sale",
    subtitle: "Personalise your ride — up to 40% off",
    btn:      "Shop Accessories",
    catSlug:  "accessories",
    from: "from-[#0d2657]", to: "to-slate-800",
  },
];

/* ── Icon map keyed to exact category names from seed ── */
const ICON_MAP = {
  "engine parts": Wrench,
  "brakes":       CircleDot,
  "electricals":  Zap,
  "body parts":   Shield,
  "tyres & wheels": Gauge,
  "lubricants":   Droplets,
  "suspension":   Wind,
  "accessories":  Star,
};

function getCatIcon(name = "") {
  const lower = name.toLowerCase();
  // exact match first
  if (ICON_MAP[lower]) return ICON_MAP[lower];
  // fallback: partial match
  for (const [key, Icon] of Object.entries(ICON_MAP)) {
    if (lower.includes(key.split(" ")[0])) return Icon;
  }
  return Tag;
}

/* ── Trust badges ── */
const TRUST = [
  { icon: Truck,      title: "Free Delivery",  sub: "Orders above ₹999",  bg: "bg-blue-50",  ic: "text-[#0a1f44]" },
  { icon: Shield,     title: "100% Genuine",   sub: "OEM certified parts", bg: "bg-slate-50", ic: "text-[#0a1f44]" },
  { icon: RotateCcw,  title: "10-Day Returns", sub: "Hassle-free policy",  bg: "bg-gray-50",  ic: "text-[#0a1f44]" },
  { icon: Headphones, title: "24×7 Support",   sub: "1800-258-6454",       bg: "bg-blue-50",  ic: "text-[#0a1f44]" },
];

/* ── Skeleton ── */
const Skeleton = () => (
  <div className="card animate-pulse">
    <div className="bg-gray-200 h-44 rounded-t-2xl" />
    <div className="p-3 space-y-2">
      <div className="h-3 bg-gray-200 rounded w-1/3" />
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-2/3" />
      <div className="h-8 bg-gray-200 rounded-xl" />
    </div>
  </div>
);

export default function HomePage({ auth, cartHook, wishlistHook }) {
  const navigate = useNavigate();
  const { products = [], loading, fetchProducts } = useProducts();
  const [bannerIdx,  setBannerIdx]  = useState(0);
  const [categories, setCategories] = useState([]);

  /* ── Fetch categories (same API as Navbar, uses real slugs) ── */
  useEffect(() => {
    api.get("/categories?nav=true")
      .then(({ data }) => {
        if (Array.isArray(data))
          setCategories([...data].sort((a, b) => (a.navOrder ?? 99) - (b.navOrder ?? 99)));
      })
      .catch(() => {});
  }, []);

  /* ── Fetch products ── */
  useEffect(() => {
    fetchProducts({ limit: 20, sort: "-createdAt" });
  }, []); // eslint-disable-line

  /* ── Auto-rotate banner ── */
  useEffect(() => {
    const t = setInterval(() => setBannerIdx(i => (i + 1) % BANNERS.length), 5000);
    return () => clearInterval(t);
  }, []);

  /* ── Shuffle once ── */
  const shuffledProducts = useMemo(() => {
    if (products.length === 0) return [];
    return [...products].sort(() => Math.random() - 0.5);
  }, [products.length]); // eslint-disable-line

  const b = BANNERS[bannerIdx];

  return (
    <div className="page-wrapper">

      {/* ══ HERO BANNER ══ */}
      <section className="relative mb-8 rounded-2xl overflow-hidden shadow-lg">
        <div className={`bg-gradient-to-r ${b.from} ${b.to} min-h-56 md:min-h-64
                         flex items-center px-6 md:px-14 transition-all duration-700 relative`}>
          <div className="absolute inset-0 opacity-5 pointer-events-none"
            style={{ backgroundImage: "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)", backgroundSize: "20px 20px" }} />
          <div className="relative z-10 max-w-lg">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1 rounded-full mb-4">
              <div className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-blue-200 uppercase tracking-widest">Official TVS Parts</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-3 leading-tight">{b.title}</h1>
            <p className="text-blue-200 text-base md:text-lg mb-6">{b.subtitle}</p>
            {/* Uses exact catSlug — no lookup needed, never wrong */}
            <button
              onClick={() => navigate(`/products/category/${b.catSlug}`)}
              className="inline-flex items-center gap-2 bg-white text-[#0a1f44] font-bold
                         px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors text-sm shadow-md">
              {b.btn} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/3 pointer-events-none opacity-10">
            <div className="absolute top-6 right-8 w-40 h-40 bg-white rounded-full" />
            <div className="absolute bottom-4 right-28 w-20 h-20 bg-white rounded-full" />
          </div>
        </div>

        <button onClick={() => setBannerIdx(i => (i - 1 + BANNERS.length) % BANNERS.length)}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20
                     hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button onClick={() => setBannerIdx(i => (i + 1) % BANNERS.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20
                     hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {BANNERS.map((_, i) => (
            <button key={i} onClick={() => setBannerIdx(i)}
              className={`h-1.5 rounded-full transition-all ${i === bannerIdx ? "w-6 bg-white" : "w-1.5 bg-white/40"}`} />
          ))}
        </div>
      </section>

      {/* ══ TRUST BADGES ══ */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {TRUST.map(({ icon: Icon, title, sub, bg, ic }) => (
          <div key={title} className={`${bg} rounded-2xl p-4 flex items-center gap-3 border border-gray-100`}>
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
              <Icon className={`w-5 h-5 ${ic}`} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{title}</p>
              <p className="text-xs text-gray-500">{sub}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ══ CATEGORIES — live from API, real slugs ══ */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="section-title">Shop by Category</h2>
            <p className="text-sm text-gray-500 mt-0.5">Genuine parts for every TVS model</p>
          </div>
          <button onClick={() => navigate("/products")}
            className="flex items-center gap-1 text-[#0a1f44] hover:underline font-semibold text-sm">
            All Parts <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {categories.length === 0 ? (
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-100 rounded-2xl animate-pulse" />
                <div className="h-3 w-12 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {categories.map(({ name, slug }) => {
              const Icon = getCatIcon(name);
              return (
                <button
                  key={slug}
                  onClick={() => navigate(`/products/category/${slug}`)}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-[#0a1f44] rounded-2xl flex items-center
                                  justify-center shadow-sm group-hover:bg-[#0d2657] group-hover:scale-105
                                  group-hover:shadow-md transition-all duration-200">
                    <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 text-center leading-tight">{name}</span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* ══ FEATURED PRODUCTS ══ */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="section-title">Featured Parts</h2>
            <p className="text-sm text-gray-500 mt-0.5">Top-selling genuine TVS components</p>
          </div>
          <button onClick={() => navigate("/products")}
            className="flex items-center gap-1 text-[#0a1f44] hover:underline font-semibold text-sm">
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl">
            <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-semibold text-gray-500">No products found</p>
            <p className="text-sm text-gray-400 mt-1">Make sure the backend is running and products are seeded.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.slice(0, 8).map(p => (
              <ProductCard key={p._id} product={p} auth={auth} cartHook={cartHook} wishlistHook={wishlistHook} />
            ))}
          </div>
        )}
      </section>

      {/* ══ PROMO BANNER ══ */}
      <section className="rounded-2xl bg-[#0a1f44] text-white px-6 md:px-12 py-8
                          flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-blue-300" />
            <span className="text-xs font-bold text-blue-300 uppercase tracking-widest">TVS Assured Quality</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-black mb-2 leading-tight">
            Every Part. Every Ride.<br />Guaranteed.
          </h3>
          <p className="text-blue-200 text-sm">
            All parts carry a 1-year manufacturer warranty and pass 200+ quality checks.
          </p>
        </div>
        <button onClick={() => navigate("/products")}
          className="flex-shrink-0 bg-white text-[#0a1f44] font-black px-8 py-3 rounded-xl
                     hover:bg-blue-50 transition-colors shadow-md whitespace-nowrap">
          Browse All Parts
        </button>
      </section>

      {/* ══ FOR YOU ══ */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="section-title">Recommended For You</h2>
            <p className="text-sm text-gray-500 mt-0.5">Parts picked based on popular models</p>
          </div>
          <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full font-medium">Personalised</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {shuffledProducts.map(p => (
              <ProductCard key={`fy-${p._id}`} product={p} auth={auth} cartHook={cartHook} wishlistHook={wishlistHook} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}