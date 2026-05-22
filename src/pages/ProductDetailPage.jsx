import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star, ShoppingCart, Heart, Truck, Shield,
  RotateCcw, ChevronLeft, Minus, Plus, CheckCircle
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function ProductDetailPage({ auth, cartHook, wishlistHook }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = auth;
  const { addToCart, cartLoading } = cartHook;
  const { addToWishlist, removeFromWishlist, isInWishlist } = wishlistHook;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('specs');

  const inWishlist = product ? isInWishlist(product._id) : false;

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
        window.scrollTo(0, 0);
      } catch {
        toast.error('Product not found');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!isLoggedIn) { navigate('/login'); return; }
    addToCart(product._id, quantity, product.color);
  };

  const handleBuyNow = () => {
    if (!isLoggedIn) { navigate('/login'); return; }
    addToCart(product._id, quantity, product.color);
    navigate('/cart');
  };

  const handleWishlist = () => {
    if (!isLoggedIn) { navigate('/login'); return; }
    if (inWishlist) removeFromWishlist(product._id);
    else addToWishlist(product._id);
  };

  if (loading) return (
    <div className="pt-32 md:pt-28 max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 animate-pulse">
        <div className="bg-gray-200 rounded-3xl h-96" />
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-8 bg-gray-200 rounded w-2/3" />
          <div className="h-6 bg-gray-200 rounded w-1/4" />
          <div className="h-12 bg-gray-200 rounded-xl" />
          <div className="h-12 bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  );

  if (!product) return null;

  const discount = product.discount ||
    (product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0);

  const specs = [
    { label: 'Brand', value: product.brand },
    { label: 'Model', value: product.model },
    { label: 'Color', value: product.color },
    product.ram && { label: 'RAM', value: product.ram },
    product.storage && { label: 'Storage', value: product.storage },
    product.battery && { label: 'Battery', value: product.battery },
    product.display && { label: 'Display', value: product.display },
    product.camera && { label: 'Camera', value: product.camera },
    product.network && { label: 'Network', value: product.network },
    { label: 'Category', value: product.category },
  ].filter(Boolean);

  return (
    <div className="pt-32 md:pt-28 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        {/* Main card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 grid md:grid-cols-2 gap-8">

          {/* Image */}
          <div className="relative">
            <div className="bg-gray-50 rounded-2xl p-8 flex items-center justify-center min-h-72">
              <img
                src={product.image}
                alt={product.title}
                className="max-w-full max-h-72 object-contain"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; }}
              />
            </div>
            {discount > 0 && (
              <div className="absolute top-4 left-4 bg-green-500 text-white font-bold text-sm px-3 py-1 rounded-xl">
                {discount}% OFF
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-4">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                {product.brand} · {product.category}
              </span>
              <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 mt-1 leading-tight">
                {product.title}
              </h1>
            </div>

            {/* Rating + Stock */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-xl">
                <span className="text-sm font-bold">{product.rating}</span>
                <Star className="w-3.5 h-3.5 fill-current" />
              </div>
              <span className="text-sm text-gray-500">{product.numReviews || 0} ratings</span>
              {product.stock > 0 ? (
                <span className="text-sm text-green-600 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> In Stock ({product.stock})
                </span>
              ) : (
                <span className="text-sm text-red-500 font-semibold">Out of Stock</span>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl font-extrabold text-gray-900">
                ₹{product.price?.toLocaleString()}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    ₹{product.originalPrice?.toLocaleString()}
                  </span>
                  <span className="text-green-600 font-bold text-sm">
                    Save ₹{(product.originalPrice - product.price).toLocaleString()}
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-gray-400 -mt-2">Inclusive of all taxes</p>

            {/* Quantity */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-700">Qty:</span>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-3 py-2 hover:bg-gray-100 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 font-semibold text-sm min-w-8 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock || 1, q + 1))}
                  className="px-3 py-2 hover:bg-gray-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || cartLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-300 text-white font-bold py-3 rounded-xl transition-all active:scale-95 shadow-md shadow-blue-200"
              >
                <ShoppingCart className="w-5 h-5" />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-300 disabled:to-gray-300 text-white font-bold py-3 rounded-xl transition-all active:scale-95 shadow-md shadow-orange-200"
              >
                Buy Now
              </button>
              <button
                onClick={handleWishlist}
                className={`p-3 rounded-xl border-2 transition-all ${
                  inWishlist
                    ? 'border-red-400 bg-red-50 text-red-500'
                    : 'border-gray-200 text-gray-400 hover:border-red-400 hover:text-red-400'
                }`}
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Delivery perks */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
              {[
                { icon: Truck, text: 'Free Delivery', sub: 'Above ₹499' },
                { icon: RotateCcw, text: '10 Day Return', sub: 'Easy returns' },
                { icon: Shield, text: '1 Yr Warranty', sub: 'Brand warranty' },
              ].map(({ icon: Icon, text, sub }) => (
                <div key={text} className="flex flex-col items-center gap-1 p-2 bg-gray-50 rounded-xl text-center">
                  <Icon className="w-5 h-5 text-blue-500" />
                  <span className="text-xs font-semibold text-gray-700">{text}</span>
                  <span className="text-xs text-gray-400">{sub}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Specs / Description Tabs */}
        <div className="mt-6 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            {['specs', 'description'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-semibold capitalize transition-colors ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'specs' ? 'Specifications' : 'Description'}
              </button>
            ))}
          </div>
          <div className="p-6">
            {activeTab === 'specs' ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {specs.map(({ label, value }) => (
                  <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm font-semibold text-gray-500 w-24 flex-shrink-0">
                      {label}
                    </span>
                    <span className="text-sm text-gray-800 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600 leading-relaxed">
                {product.description || 'No description available for this product.'}
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}