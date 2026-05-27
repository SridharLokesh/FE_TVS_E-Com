import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { ChevronDown, Search, SlidersHorizontal } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { useProducts } from "../hooks/useProducts";

const SORT_OPTIONS = [
  { label: "Newest First", value: "-createdAt" },
  { label: "Price: Low → High", value: "price" },
  { label: "Price: High → Low", value: "-price" },
  { label: "Top Rated", value: "-rating" },
];

const ALL_CATS = [
  "Engine",
  "Brakes",
  "Electricals",
  "Suspension",
  "Lubricants",
  "Tyres",
  "Body",
  "Accessories",
];

const CAT_LABELS = {
  Engine: "Engine Parts",
  Brakes: "Brakes",
  Electricals: "Electricals",
  Suspension: "Suspension",
  Lubricants: "Lubricants",
  Tyres: "Tyres & Wheels",
  Body: "Body Parts",
  Accessories: "Accessories",
};

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

export default function ProductsPage({ auth, cartHook, wishlistHook }) {
  const { category } = useParams();
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const searchQuery = sp.get("search") || "";

  const { products, loading, pagination, fetchProducts } = useProducts();
  const [sort, setSort] = useState("-createdAt");
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    const params = { sort, page, limit: 20 };
    if (category) params.category = category;
    if (searchQuery) params.search = searchQuery;
    fetchProducts(params);
  }, [category, searchQuery, sort, page]); // eslint-disable-line

  useEffect(() => {
    setPage(1);
  }, [category, searchQuery, sort]);
  useEffect(() => {
    load();
  }, [load]);

  const pages = pagination?.pages || 1;
  const title = category
    ? `${CAT_LABELS[category] || category}`
    : searchQuery
      ? `Results for "${searchQuery}"`
      : "All Parts";

  return (
    <div className="page-wrapper min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-black text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {pagination?.total || 0} parts found
          </p>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-gray-400" />
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="input-field pr-8 appearance-none cursor-pointer py-2 text-sm w-auto pl-3"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-2.5 top-1/2 -translate-y-1/2
                                    w-4 h-4 text-gray-400 pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => navigate("/products")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold
                      transition-all border
                      ${
                        !category
                          ? "bg-[#0a1f44] text-white border-[#0a1f44]"
                          : "bg-white text-gray-600 border-gray-200 hover:border-[#0a1f44]"
                      }`}
        >
          All Parts
        </button>
        {ALL_CATS.map((c) => (
          <button
            key={c}
            onClick={() => navigate(`/products/category/${c}`)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold
                        transition-all border
                        ${
                          category === c
                            ? "bg-[#0a1f44] text-white border-[#0a1f44]"
                            : "bg-white text-gray-600 border-gray-200 hover:border-[#0a1f44]"
                        }`}
          >
            {CAT_LABELS[c]}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <Skeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-gray-200 rounded-2xl">
          <Search className="w-14 h-14 text-gray-200 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-700 mb-2">
            No parts found
          </h2>
          <p className="text-gray-400 text-sm mb-5">
            Try a different category or search term
          </p>
          <button onClick={() => navigate("/products")} className="btn-primary">
            View All Parts
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((p) => (
              <ProductCard
                key={p._id}
                product={p}
                auth={auth}
                cartHook={cartHook}
                wishlistHook={wishlistHook}
              />
            ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="btn-ghost px-4 py-2 text-sm disabled:opacity-40 border border-gray-200"
              >
                ← Prev
              </button>
              {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(
                (p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors
                    ${
                      page === p
                        ? "bg-[#0a1f44] text-white"
                        : "bg-white border border-gray-200 text-gray-600 hover:border-[#de1c0e]"
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}
              <button
                onClick={() => setPage((p) => Math.min(p + 1, pages))}
                disabled={page === pages}
                className="btn-ghost px-4 py-2 text-sm disabled:opacity-40 border border-gray-200"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
