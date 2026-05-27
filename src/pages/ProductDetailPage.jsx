import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Star,
  ShoppingCart,
  Heart,
  Truck,
  Shield,
  RotateCcw,
  ChevronLeft,
  Minus,
  Plus,
  CheckCircle,
  Package,
  Wrench,
} from "lucide-react";
import { useProducts } from "../hooks/useProducts";

export default function ProductDetailPage({ auth, cartHook, wishlistHook }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const { isLoggedIn } = auth || {};
  const { addToCart, cartLoading } = cartHook || {};
  const { addToWishlist, removeFromWishlist, isInWishlist } =
    wishlistHook || {};

  const { product, loading, fetchProduct } = useProducts();
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState("specs");

  useEffect(() => {
    if (id) {
      fetchProduct(id);
      window.scrollTo(0, 0);
    }
  }, [id]); // eslint-disable-line

  const inWishlist = isInWishlist?.(product?._id) || false;
  const discount =
    product?.discount ||
    (product?.originalPrice > product?.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100,
        )
      : 0);

  const handleCart = () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    addToCart?.(product._id, qty, product.color);
  };
  const handleBuy = () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    addToCart?.(product._id, qty, product.color);
    navigate("/cart");
  };
  const handleWish = () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    inWishlist
      ? removeFromWishlist?.(product._id)
      : addToWishlist?.(product._id);
  };

  /* Loading skeleton */
  if (loading || !product)
    return (
      <div className="page-wrapper">
        <div className="grid md:grid-cols-2 gap-8 animate-pulse">
          <div className="bg-gray-200 rounded-2xl h-96" />
          <div className="space-y-4 pt-4">
            {[90, 70, 40, 100, 60].map((w, i) => (
              <div
                key={i}
                className="h-4 bg-gray-200 rounded"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    );

  const specs = [
    { label: "Brand", value: product.brand },
    { label: "Model", value: product.model },
    { label: "Category", value: product.category },
    { label: "Color", value: product.color },
    product.ram && { label: "RAM", value: product.ram },
    product.storage && { label: "Storage", value: product.storage },
    product.battery && { label: "Battery", value: product.battery },
    product.display && { label: "Display", value: product.display },
    product.camera && { label: "Camera", value: product.camera },
    product.network && { label: "Network", value: product.network },
  ].filter(Boolean);

  return (
    <div className="page-wrapper">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-gray-500
                   hover:text-[#0a1f44] mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      {/* Main card */}
      <div className="card p-5 md:p-8 grid md:grid-cols-2 gap-8 mb-6">
        {/* Image */}
        <div className="relative">
          <div
            className="bg-gray-50 rounded-2xl flex items-center justify-center
                          p-8 min-h-64 border border-gray-100"
          >
            <img
              src={
                product.image ||
                "https://via.placeholder.com/400x300?text=No+Image"
              }
              alt={product.title}
              className="max-h-72 object-contain w-full"
              onError={(e) => {
                e.currentTarget.src =
                  "https://via.placeholder.com/400x300?text=No+Image";
              }}
            />
          </div>
          {discount > 0 && (
            <span
              className="absolute top-4 left-4 bg-[#de1c0e] text-white
                             font-bold text-sm px-3 py-1 rounded-xl"
            >
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-4">
          {/* Brand + Category */}
          <div>
            <p
              className="text-xs font-bold text-[#0a1f44] uppercase tracking-wider
                          mb-1 flex items-center gap-1"
            >
              <Wrench className="w-3.5 h-3.5" />
              {product.brand} · {product.category}
            </p>
            <h1 className="text-xl md:text-2xl font-black text-gray-900 leading-snug">
              {product.title}
            </h1>
          </div>

          {/* Rating + stock */}
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="flex items-center gap-1 bg-green-500 text-white
                             text-sm font-bold px-2.5 py-1 rounded-lg"
            >
              {product.rating}
              <Star className="w-3.5 h-3.5 fill-current" />
            </span>
            <span className="text-sm text-gray-500">
              {product.numReviews || 0} reviews
            </span>
            {product.stock > 0 ? (
              <span className="flex items-center gap-1 text-sm text-green-600 font-semibold">
                <CheckCircle className="w-4 h-4" /> In Stock ({product.stock})
              </span>
            ) : (
              <span className="text-sm text-red-500 font-semibold">
                Out of Stock
              </span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-3xl font-black text-gray-900">
              ₹{product.price?.toLocaleString("en-IN")}
            </span>
            {product.originalPrice > product.price && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  ₹{product.originalPrice?.toLocaleString("en-IN")}
                </span>
                <span className="text-green-600 font-bold text-sm">
                  Save ₹
                  {(product.originalPrice - product.price).toLocaleString(
                    "en-IN",
                  )}
                </span>
              </>
            )}
          </div>
          <p className="text-xs text-gray-400 -mt-3">
            Inclusive of all taxes · GST applicable
          </p>

          {/* Qty */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-700">Qty:</span>
            <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-3 py-2 hover:bg-gray-100 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 font-bold text-sm">{qty}</span>
              <button
                onClick={() =>
                  setQty((q) => Math.min(product.stock || 1, q + 1))
                }
                className="px-3 py-2 hover:bg-gray-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleCart}
              disabled={product.stock === 0 || cartLoading}
              className="flex-1 btn-primary py-3 text-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </button>
            <button
              onClick={handleBuy}
              disabled={product.stock === 0}
              className="flex-1 inline-flex items-center justify-center gap-2
                         bg-red-700  hover:bg-red-600 disabled:bg-gray-200
                         text-white font-semibold py-3 rounded-xl
                         transition-colors text-sm active:scale-95"
            >
              <Package className="w-4 h-4" /> Buy Now
            </button>
            <button
              onClick={handleWish}
              className={`p-3 rounded-xl border-2 transition-all
                ${
                  inWishlist
                    ? "border-red-400 bg-red-50 text-red-500"
                    : "border-gray-200 text-gray-400 hover:border-red-300"
                }`}
            >
              <Heart
                className={`w-5 h-5 ${inWishlist ? "fill-current" : ""}`}
              />
            </button>
          </div>

          {/* Perks */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
            {[
              { icon: Truck, text: "Free Delivery", sub: "Above ₹999" },
              { icon: RotateCcw, text: "10-Day Return", sub: "Unused parts" },
              { icon: Shield, text: "1 Yr Warranty", sub: "OEM certified" },
            ].map(({ icon: Icon, text, sub }) => (
              <div
                key={text}
                className="flex flex-col items-center gap-1 bg-gray-50
                           rounded-xl p-2 text-center"
              >
                <Icon className="w-5 h-5 text-[#0a1f44]" />
                <span className="text-xs font-semibold text-gray-800">
                  {text}
                </span>
                <span className="text-xs text-gray-400">{sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Specs / Description tabs */}
      <div className="card overflow-hidden">
        <div className="flex border-b border-gray-100">
          {["specs", "description"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-semibold capitalize transition-colors
                ${
                  activeTab === tab
                    ? "text-[#0a1f44] border-b-2 border-[#0a1f44] bg-blue-50/30"
                    : "text-gray-500 hover:text-gray-700"
                }`}
            >
              {tab === "specs" ? "Specifications" : "Description"}
            </button>
          ))}
        </div>
        <div className="p-6">
          {activeTab === "specs" ? (
            <div className="grid sm:grid-cols-2 gap-3">
              {specs.map(({ label, value }) => (
                <div
                  key={label}
                  className="flex gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
                >
                  <span className="text-sm font-semibold text-gray-500 w-24 flex-shrink-0">
                    {label}
                  </span>
                  <span className="text-sm text-gray-900 font-medium">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600 leading-relaxed">
              {product.description || "No description available for this part."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
