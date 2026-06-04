import { Heart, ShoppingCart, Star, Wrench } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProductCard({ product, auth, cartHook, wishlistHook }) {
  const navigate = useNavigate();
  const { isLoggedIn } = auth || {};
  const { addToCart, cartLoading } = cartHook || {};
  const { addToWishlist, removeFromWishlist, isInWishlist } =
    wishlistHook || {};

  if (!product) return null;

  const inWishlist = isInWishlist?.(product._id) || false;
  const discount =
    product.discount ||
    (product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100,
        )
      : 0);

  const goDetail = () => navigate(`/products/${product._id}`);

  const handleCart = (e) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    addToCart?.(product._id, 1, product.color);
  };

  const handleWish = (e) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    inWishlist
      ? removeFromWishlist?.(product._id)
      : addToWishlist?.(product._id);
  };

  return (
    <div
      onClick={goDetail}
      className="card cursor-pointer overflow-hidden group
                 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Image */}
      <div className="relative bg-gray-50 overflow-hidden">
        <img
          src={
            product.image || "https://via.placeholder.com/300x200?text=No+Image"
          }
          alt={product.title}
          className="w-full h-44 object-cover group-hover:scale-105
                     transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src =
              "https://via.placeholder.com/300x200?text=No+Image";
          }}
        />
        {/* Discount badge */}
        {discount > 0 && (
          <span
            className="absolute top-2 left-2 bg-[#de1c0e] text-white
                           text-xs font-bold px-2 py-0.5 rounded-lg"
          >
            {discount}% OFF
          </span>
        )}
        {/* Out of stock overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span
              className="bg-white text-gray-800 text-xs font-bold
                             px-3 py-1 rounded-full"
            >
              Out of Stock
            </span>
          </div>
        )}
        {/* Low stock */}
        {product.stock > 0 && product.stock <= 5 && (
          <span
            className="absolute bottom-2 left-2 bg-red-600 text-white
                           text-xs font-semibold px-2 py-0.5 rounded-full"
          >
            Only {product.stock} left!
          </span>
        )}
        {/* Wishlist button */}
        <button
          onClick={handleWish}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full shadow-md
                      flex items-center justify-center transition-all
                      ${
                        inWishlist
                          ? "bg-red-500 text-white"
                          : "bg-white text-gray-400 hover:text-red-500"
                      }`}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* Info */}
      <div className="p-3">
        {/* Brand */}
        <p className="text-xs text-[#0a1f44] font-bold uppercase tracking-wide mb-0.5 flex items-center gap-1">
          <Wrench className="w-3 h-3" /> {product.brand}
        </p>
        {/* Title */}
        <h3
          className="text-sm font-semibold text-gray-800 line-clamp-2
                       leading-snug mb-2"
        >
          {product.title}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-2">
          <span
            className="flex items-center gap-0.5 bg-green-100 text-green-800
                           text-xs font-bold px-1.5 py-0.5 rounded"
          >
            {product.rating}
            <Star className="w-3 h-3 fill-current text-yellow-500" />
          </span>
          {product.numReviews > 0 && (
            <span className="text-xs text-gray-400">
              ({product.numReviews})
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1.5 mb-3">
          <span className="text-base font-extrabold text-gray-900">
            ₹{product.price?.toLocaleString("en-IN")}
          </span>
          {product.originalPrice > product.price && (
            <span className="text-xs text-gray-400 line-through">
              ₹{product.originalPrice?.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleCart}
          disabled={product.stock === 0 || cartLoading}
          className="w-full flex items-center justify-center gap-1.5
                     bg-[#0a1f44] hover:bg-[#0d2657]
                     disabled:bg-gray-200 disabled:cursor-not-allowed
                     text-white disabled:text-gray-400
                     text-xs font-semibold py-2 rounded-xl
                     transition-colors active:scale-95"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}