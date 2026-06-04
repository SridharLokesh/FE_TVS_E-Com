import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { ChevronDown, Search, SlidersHorizontal, ChevronRight } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { useProducts } from "../hooks/useProducts";

const SORT_OPTIONS = [
  { label: "Newest First",      value: "-createdAt" },
  { label: "Price: Low → High", value: "price"      },
  { label: "Price: High → Low", value: "-price"     },
  { label: "Top Rated",         value: "-rating"    },
];

const Skeleton = () => (
  <div className="card animate-pulse">
    <div className="bg-gray-200 h-44 rounded-t-2xl" />
    <div className="p-3 space-y-2">
      <div className="h-3 bg-gray-200 rounded w-1/3" />
      <div className="h-3 bg-gray-200 rounded" />
      <div className="h-3 bg-gray-200 rounded w-2/3" />
      <div className="h-8 bg-gray-200 rounded-xl" />
    </div>
  </div>
);

export default function ProductsPage({ auth, cartHook, wishlistHook, onSubPillsVisibilityChange }) {
  const { cat }  = useParams();
  const [sp]     = useSearchParams();
  const navigate = useNavigate();

  const searchQuery = sp.get("search") || "";
  const subSlug     = sp.get("sub")    || "";

  const [sort,       setSort]       = useState("-createdAt");
  const [page,       setPage]       = useState(1);
  const [categories, setCategories] = useState([]);
  const [catsReady,  setCatsReady]  = useState(false);

  const { products, loading, pagination, fetchProducts } = useProducts();

  // Keeps a reference to the live IntersectionObserver so we can disconnect it
  const observerRef = useRef(null);

  /* ── Fetch categories ── */
  useEffect(() => {
    fetch("/api/categories?nav=true")
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (Array.isArray(data))
          setCategories([...data].sort((a, b) => (a.navOrder ?? 99) - (b.navOrder ?? 99)));
      })
      .catch(() => {})
      .finally(() => setCatsReady(true));
  }, []);

  /* ── Resolve active category ── */
  const activeCat  = cat ? categories.find(c => c.slug === cat.toLowerCase()) || null : null;
  const activeSubs = (activeCat?.subCategories || []).filter(s => s.isActive !== false);

  /* ── Reset visibility when no category is active ── */
  useEffect(() => {
    if (!cat && onSubPillsVisibilityChange) onSubPillsVisibilityChange(true);
  }, [cat, onSubPillsVisibilityChange]);

  /* ── Ref callback on the sub-pill row div ─────────────────────────
      Using a ref CALLBACK (not useRef + useEffect) is the key fix.
      A ref callback fires synchronously when React mounts/unmounts
      the DOM node — so `el` is never null when we set up the observer.

      This fires:
        el = <div>  when activeSubs.length > 0 and the div renders
        el = null   when activeSubs.length becomes 0 and div unmounts
  ──────────────────────────────────────────────────────────────────── */
  const subPillsRef = useCallback((el) => {
    // Always disconnect the previous observer first
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    // el is null when the pill row unmounts — tell Navbar pills are "visible"
    if (!el) {
      onSubPillsVisibilityChange?.(true);
      return;
    }

    // el is the real DOM node — set up the observer
    const observer = new IntersectionObserver(
      ([entry]) => {
        // true  → pills on screen   → no dropdown needed
        // false → pills behind navbar → show dropdown on active pill
        onSubPillsVisibilityChange?.(entry.isIntersecting);
      },
      {
        threshold: 0,
        // Treat pills as "off screen" the moment they slide under the
        // fixed navbar. App.jsx sets pt-[116px] on mobile, pt-[148px]
        // on md+. Use 150px to cover the tallest navbar safely.
        rootMargin: "-150px 0px 0px 0px",
      }
    );

    observer.observe(el);
    observerRef.current = observer;
  }, [onSubPillsVisibilityChange]); // stable — onSubPillsVisibilityChange is useCallback in App.jsx

  /* ── Reset page on filter change ── */
  useEffect(() => { setPage(1); }, [cat, subSlug, searchQuery, sort]);

  /* ── Fetch products ── */
  useEffect(() => {
    if (!catsReady) return;
    const params = { sort, page, limit: 20 };
    if (cat)      params.category = activeCat ? activeCat.name : cat;
    if (subSlug && activeSubs.length > 0) {
      const subObj = activeSubs.find(s => s.slug === subSlug);
      if (subObj) params.sub = subObj.name;
    }
    if (searchQuery) params.search = searchQuery;
    fetchProducts(params);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cat, subSlug, searchQuery, sort, page, catsReady]);

  const pages = pagination?.pages || 1;

  const activeSubName = subSlug
    ? (activeSubs.find(s => s.slug === subSlug)?.name || subSlug)
    : "";

  const title = searchQuery
    ? `Results for "${searchQuery}"`
    : activeCat
      ? activeSubName ? `${activeCat.name} — ${activeSubName}` : activeCat.name
      : "All Parts";

  /* ── Breadcrumb ── */
  const Breadcrumb = () => {
    if (!activeCat && !searchQuery) return null;
    return (
      <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 flex-wrap">
        <button onClick={() => navigate("/products")} className="hover:text-[#0a1f44] transition-colors">
          All Parts
        </button>
        {activeCat && (
          <>
            <ChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
            <button
              onClick={() => navigate(`/products/category/${activeCat.slug}`)}
              className={`transition-colors ${!activeSubName ? "text-[#0a1f44] font-semibold" : "hover:text-[#0a1f44]"}`}>
              {activeCat.name}
            </button>
          </>
        )}
        {activeSubName && (
          <>
            <ChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
            <span className="text-[#0a1f44] font-semibold">{activeSubName}</span>
          </>
        )}
      </nav>
    );
  };

  return (
    <div className="page-wrapper min-h-screen">
      <Breadcrumb />

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-black text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {pagination?.total ?? 0} parts found
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-gray-400" />
          <div className="relative">
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="input-field pr-8 appearance-none cursor-pointer py-2 text-sm w-auto pl-3">
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ── Sub-category pill row ───────────────────────────────────────
          ref={subPillsRef} is a CALLBACK ref — fires the instant this
          div mounts (el = DOM node) or unmounts (el = null).
          When pills scroll behind the fixed navbar, the observer fires
          onSubPillsVisibilityChange(false) → Navbar shows the dropdown.
      ──────────────────────────────────────────────────────────────── */}
      {activeSubs.length > 0 && (
        <div ref={subPillsRef} className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => navigate(`/products/category/${activeCat.slug}`)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border
              ${!subSlug
                ? "bg-[#0a1f44] text-white border-[#0a1f44]"
                : "bg-white text-gray-500 border-gray-200 hover:border-[#0a1f44] hover:text-[#0a1f44]"}`}>
            All {activeCat.name}
          </button>

          {activeSubs.map(sub => (
            <button key={sub.slug}
              onClick={() => navigate(`/products/category/${activeCat.slug}?sub=${sub.slug}`)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border
                ${subSlug === sub.slug
                  ? "bg-[#0a1f44] text-white border-[#0a1f44]"
                  : "bg-white text-gray-500 border-gray-200 hover:border-[#0a1f44] hover:text-[#0a1f44]"}`}>
              {sub.name}
            </button>
          ))}
        </div>
      )}

      {/* Product grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 20 }).map((_, i) => <Skeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-gray-200 rounded-2xl">
          <Search className="w-14 h-14 text-gray-200 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-700 mb-2">No parts found</h2>
          <p className="text-gray-400 text-sm mb-5">
            {cat
              ? `No products listed under "${activeCat?.name || cat}" yet`
              : "Try a different search term"}
          </p>
          <button onClick={() => navigate("/products")} className="btn-primary">
            View All Parts
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map(p => (
              <ProductCard key={p._id} product={p}
                auth={auth} cartHook={cartHook} wishlistHook={wishlistHook} />
            ))}
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
              <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}
                className="btn-ghost px-4 py-2 text-sm disabled:opacity-40 border border-gray-200">
                ← Prev
              </button>
              {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors
                    ${page === p
                      ? "bg-[#0a1f44] text-white"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-[#de1c0e]"}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(p + 1, pages))} disabled={page === pages}
                className="btn-ghost px-4 py-2 text-sm disabled:opacity-40 border border-gray-200">
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}