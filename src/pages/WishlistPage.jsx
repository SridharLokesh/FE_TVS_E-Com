import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';

export default function WishlistPage({ auth, cartHook, wishlistHook }) {
  const { wishlist, removeFromWishlist } = wishlistHook;
  const { addToCart } = cartHook;
  const navigate = useNavigate();
  const products = wishlist?.products || [];

  const handleMoveToCart = (product) => {
    addToCart(product._id, 1, product.color);
    removeFromWishlist(product._id);
  };

  if (products.length === 0) return (
    <div className="pt-32 md:pt-28 min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Heart className="w-20 h-20 text-gray-200 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Your wishlist is empty</h2>
        <p className="text-gray-400 mb-6">Save items you like to buy later</p>
        <button onClick={() => navigate('/products')} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors">
          Explore Products
        </button>
      </div>
    </div>
  );

  return (
    <div className="pt-32 md:pt-28 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500 fill-current" /> My Wishlist
          </h1>
          <div className="text-sm text-gray-500">
            <span className="font-semibold text-gray-800">{products.length}</span>/25 items
            <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1">
              <div className="h-full bg-red-400 rounded-full" style={{ width: `${(products.length / 25) * 100}%` }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((product) => {
            if (!product || !product._id) return null;
            const discount = product.discount || 0;
            return (
              <div key={product._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group">
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-44 object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                    onClick={() => navigate(`/products/${product._id}`)}
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/200x180'; }}
                  />
                  {discount > 0 && (
                    <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">{discount}% OFF</span>
                  )}
                  <button
                    onClick={() => removeFromWishlist(product._id)}
                    className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                </div>
                <div className="p-3">
                  <p className="text-xs font-bold text-blue-600 mb-0.5">{product.brand}</p>
                  <p className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2">{product.title}</p>
                  <p className="font-bold text-gray-900 text-sm mb-3">₹{product.price?.toLocaleString()}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMoveToCart(product)}
                      className="flex-1 flex items-center justify-center gap-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold py-2 rounded-xl transition-all"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" /> Move to Cart
                    </button>
                    <button
                      onClick={() => removeFromWishlist(product._id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}