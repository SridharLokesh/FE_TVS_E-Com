import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, ShoppingBag } from 'lucide-react';

export default function CartPage({ cartHook }) {
  const navigate = useNavigate();
  const { cart, updateCartItem, removeFromCart } = cartHook;

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal >= 499 ? 0 : 49;
  const total = subtotal + shipping;

  if (items.length === 0) return (
    <div className="pt-32 md:pt-28 min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <ShoppingCart className="w-20 h-20 text-gray-200 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
        <p className="text-gray-400 mb-6">Add products to get started</p>
        <button
          onClick={() => navigate('/products')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );

  return (
    <div className="pt-32 md:pt-28 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-blue-600" />
          Shopping Cart
          <span className="text-sm font-normal text-gray-500 ml-2">({items.length} items)</span>
        </h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => {
              const product = item.product;
              if (!product) return null;
              return (
                <div key={item._id || product._id} className="bg-white rounded-2xl p-4 flex gap-4 shadow-sm border border-gray-100">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-20 h-20 object-cover rounded-xl bg-gray-50 flex-shrink-0 cursor-pointer"
                    onClick={() => navigate(`/products/${product._id}`)}
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/80'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-blue-600 font-semibold">{product.brand}</p>
                    <p
                      className="text-sm font-semibold text-gray-800 line-clamp-2 cursor-pointer hover:text-blue-600"
                      onClick={() => navigate(`/products/${product._id}`)}
                    >
                      {product.title}
                    </p>
                    {item.color && (
                      <p className="text-xs text-gray-400 mt-0.5">Color: {item.color}</p>
                    )}
                    <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">₹{item.price?.toLocaleString()}</span>
                        {product.originalPrice > item.price && (
                          <span className="text-xs text-gray-400 line-through">
                            ₹{product.originalPrice?.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                          <button
                            onClick={() => updateCartItem(product._id, item.quantity - 1)}
                            className="p-1.5 hover:bg-gray-100 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-sm font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateCartItem(product._id, item.quantity + 1)}
                            className="p-1.5 hover:bg-gray-100 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(product._id)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-36">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({items.length} items)</span>
                  <span className="font-semibold text-gray-800">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Charges</span>
                  <span className={`font-semibold ${shipping === 0 ? 'text-green-600' : 'text-gray-800'}`}>
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
                {subtotal < 499 && (
                  <p className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                    Add ₹{499 - subtotal} more for FREE delivery
                  </p>
                )}
                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900">
                  <span>Total Amount</span>
                  <span className="text-lg">₹{total.toLocaleString()}</span>
                </div>
              </div>
              <button
                onClick={() => navigate('/checkout')}
                className="w-full mt-5 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 rounded-xl transition-all active:scale-95 shadow-md shadow-orange-200"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/products')}
                className="w-full mt-3 flex items-center justify-center gap-2 border border-gray-200 hover:border-blue-400 text-gray-600 font-semibold py-2.5 rounded-xl transition-all text-sm"
              >
                <ShoppingBag className="w-4 h-4" /> Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}