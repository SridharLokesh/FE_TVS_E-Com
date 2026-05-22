import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { SlidersHorizontal, ChevronDown, Search, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';

const SORT_OPTIONS = [
  { label: 'Newest First',       value: '-createdAt' },
  { label: 'Price: Low to High', value: 'price'      },
  { label: 'Price: High to Low', value: '-price'     },
  { label: 'Top Rated',          value: '-rating'    },
];

const ALL_CATEGORIES = [
  'Fashion','Games','Sports','Mens','Womens','Mobile','Electronics','Toys'
];

export default function ProductsPage({ auth, cartHook, wishlistHook }) {
  const { category: catParam } = useParams();           // /products/category/:category
  const [searchParams]         = useSearchParams();     // /products?search=...
  const navigate               = useNavigate();

  const searchQuery = searchParams.get('search') || '';
  const category    = catParam || '';                   // from URL segment

  const { products, loading, pagination, fetchProducts } = useProducts();
  const [sort,   setSort]   = useState('-createdAt');
  const [page,   setPage]   = useState(1);

  /* fetch whenever category / search / sort / page changes */
  const load = useCallback(() => {
    const params = { sort, page, limit: 20 };
    if (category)    params.category = category;
    if (searchQuery) params.search   = searchQuery;
    fetchProducts(params);
  }, [category, searchQuery, sort, page, fetchProducts]);

  useEffect(() => { setPage(1); }, [category, searchQuery, sort]);
  useEffect(() => { load(); },    [load]);

  const pages = pagination?.pages || 1;

  const title = category
    ? `${category} Products`
    : searchQuery
    ? `Results for "${searchQuery}"`
    : 'All Products';

  return (
    <div className="page-wrapper min-h-screen">

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {pagination?.total ?? 0} products found
          </p>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="input-field pr-8 appearance-none cursor-pointer text-sm py-2"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => navigate('/products')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all
            ${!category ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-orange-50'}`}
        >
          All
        </button>
        {ALL_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => navigate(`/products/category/${cat}`)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all
              ${category === cat
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-orange-50'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Loading skeleton */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="bg-gray-200 h-48 rounded-t-2xl" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-8 bg-gray-200 rounded-xl" />
              </div>
            </div>
          ))}
        </div>

      ) : products.length === 0 ? (
        <div className="text-center py-24">
          <Search className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">No products found</h2>
          <p className="text-gray-400 mb-6">Try a different category or search term</p>
          <button
            onClick={() => navigate('/products')}
            className="btn-primary px-8"
          >
            View All Products
          </button>
        </div>

      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map(product => (
              <ProductCard
                key={product._id}
                product={product}
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
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl card text-sm font-medium
                           disabled:opacity-40 hover:border-orange-400 transition-colors"
              >
                ← Prev
              </button>
              {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors
                    ${page === p
                      ? 'bg-orange-500 text-white'
                      : 'card hover:border-orange-300'}`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(p + 1, pages))}
                disabled={page === pages}
                className="px-4 py-2 rounded-xl card text-sm font-medium
                           disabled:opacity-40 hover:border-orange-400 transition-colors"
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