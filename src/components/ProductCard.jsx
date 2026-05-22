import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProductCard({ product, auth, cartHook, wishlistHook }) {
  const navigate = useNavigate();
  const { isLoggedIn } = auth;
  const { addToCart, cartLoading } = cartHook;
  const { addToWishlist, removeFromWishlist, isInWishlist } = wishlistHook;

  const inWishlist = isInWishlist(product._id);
  const discount = product.discount ||
    (product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0);

  const handleCartClick = (e) => {
    e.stopPropagation();
    if (!isLoggedIn) { navigate('/login'); return; }
    addToCart(product._id, 1, product.color);
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    if (!isLoggedIn) { navigate('/login'); return; }
    if (inWishlist) removeFromWishlist(product._id);
    else addToWishlist(product._id);
  };

  return (
    <div
      onClick={() => navigate(`/products/${product._id}`)}
      className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden group border border-gray-100 hover:border-blue-100 hover:-translate-y-0.5"
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-50">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'; }}
        />
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
            {discount}% OFF
          </span>
        )}
        {product.stock <= 5 && product.stock > 0 && (
          <span className="absolute top-2 right-10 bg-orange-400 text-white text-xs font-bold px-2 py-1 rounded-lg">
            Only {product.stock} left
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-bold bg-gray-800 px-3 py-1 rounded-lg text-sm">
              Out of Stock
            </span>
          </div>
        )}
        {/* Wishlist button */}
        <button
          onClick={handleWishlistClick}
          className={`absolute top-2 right-2 p-1.5 rounded-full shadow-md transition-all ${
            inWishlist ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-500'
          }`}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-0.5">
          {product.brand}
        </p>
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2 leading-snug">
          {product.title}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex items-center gap-0.5 bg-green-50 px-2 py-0.5 rounded-lg">
            <span className="text-xs font-bold text-green-700">{product.rating}</span>
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
          </div>
          <span className="text-xs text-gray-400">({product.numReviews || 0})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base font-bold text-gray-900">
            ₹{product.price?.toLocaleString()}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs text-gray-400 line-through">
              ₹{product.originalPrice?.toLocaleString()}
            </span>
          )}
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleCartClick}
          disabled={product.stock === 0 || cartLoading}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-300 text-white text-xs font-semibold py-2 rounded-xl transition-all active:scale-95"
        >
          <ShoppingCart className="w-4 h-4" />
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}