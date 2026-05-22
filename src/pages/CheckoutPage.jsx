import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, CheckCircle, ChevronRight } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function CheckoutPage({ auth, cartHook }) {
  const { user } = auth;
  const { cart, clearCart } = cartHook;
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [placing, setPlacing] = useState(false);

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal >= 499 ? 0 : 49;
  const total = subtotal + shipping;

  useEffect(() => {
    api.get('/user/profile').then(({ data }) => {
      setAddresses(data.addresses || []);
      const def = data.addresses?.find(a => a.isDefault) || data.addresses?.[0];
      if (def) setSelectedAddress(def);
    }).catch(() => {});
  }, []);

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { toast.error('Please select a delivery address'); return; }
    setPlacing(true);
    try {
      const orderItems = items.map(item => ({
        product: item.product._id,
        title: item.product.title,
        image: item.product.image,
        price: item.price,
        quantity: item.quantity,
        color: item.color,
      }));
      await api.post('/orders', {
        shippingAddress: selectedAddress,
        paymentMethod,
        orderItems,
        itemsPrice: subtotal,
        totalPrice: total,
      });
      await clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally { setPlacing(false); }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="pt-32 md:pt-28 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-6">
          {['Address', 'Payment', 'Review'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${step === i + 1 ? 'bg-blue-600 text-white' : step > i + 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                {step > i + 1 ? <CheckCircle className="w-4 h-4" /> : <span>{i + 1}</span>}
                {s}
              </div>
              {i < 2 && <ChevronRight className="w-4 h-4 text-gray-300" />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Step 1: Address */}
            {step === 1 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-500" /> Delivery Address
                </h2>
                {addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500 mb-3">No saved addresses. Please add one in your profile.</p>
                    <button onClick={() => navigate('/profile')} className="text-blue-600 font-semibold text-sm hover:underline">
                      Go to Profile →
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map(addr => (
                      <label key={addr._id} className={`flex gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddress?._id === addr._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                        <input type="radio" name="address" checked={selectedAddress?._id === addr._id} onChange={() => setSelectedAddress(addr)} className="mt-1" />
                        <div>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full mr-2 ${addr.label === 'Home' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{addr.label}</span>
                          <p className="text-sm text-gray-700 mt-1">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => selectedAddress && setStep(2)}
                  disabled={!selectedAddress}
                  className="mt-5 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition-all"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-500" /> Payment Method
                </h2>
                <div className="space-y-3">
                  {[
                    { value: 'COD', label: 'Cash on Delivery', desc: 'Pay when your order arrives', icon: '💵' },
                    { value: 'UPI', label: 'UPI Payment', desc: 'Pay using any UPI app', icon: '📱' },
                    { value: 'Card', label: 'Credit/Debit Card', desc: 'Visa, Mastercard, RuPay', icon: '💳' },
                    { value: 'NetBanking', label: 'Net Banking', desc: 'All major banks supported', icon: '🏦' },
                  ].map(({ value, label, desc, icon }) => (
                    <label key={value} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                      <input type="radio" name="payment" value={value} checked={paymentMethod === value} onChange={() => setPaymentMethod(value)} />
                      <span className="text-2xl">{icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{label}</p>
                        <p className="text-xs text-gray-400">{desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="flex gap-3 mt-5">
                  <button onClick={() => setStep(1)} className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold py-3 rounded-xl transition-all">
                    Back
                  </button>
                  <button onClick={() => setStep(3)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all">
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Review Your Order</h2>
                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={item._id} className="flex items-center gap-3">
                      <img src={item.product?.image} alt="" className="w-12 h-12 object-cover rounded-lg bg-gray-100" onError={(e) => { e.target.style.display='none'; }} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{item.product?.title}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity} × ₹{item.price?.toLocaleString()}</p>
                      </div>
                      <span className="font-semibold text-sm">₹{(item.price * item.quantity)?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-3 mb-4 text-sm space-y-2">
                  <div className="flex justify-between text-gray-600"><span>Delivery to</span><span className="text-right text-xs max-w-48">{selectedAddress?.street}, {selectedAddress?.city}</span></div>
                  <div className="flex justify-between text-gray-600"><span>Payment</span><span>{paymentMethod}</span></div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold py-3 rounded-xl transition-all">
                    Back
                  </button>
                  <button onClick={handlePlaceOrder} disabled={placing} className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-60">
                    {placing ? 'Placing...' : `Place Order · ₹${total.toLocaleString()}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-36">
              <h3 className="font-bold text-gray-900 mb-4">Price Details</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between"><span>Price ({items.length} items)</span><span>₹{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Delivery</span><span className={shipping === 0 ? 'text-green-600 font-semibold' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
                <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900 text-base">
                  <span>Total</span><span>₹{total.toLocaleString()}</span>
                </div>
              </div>
              {subtotal < 499 && <p className="text-xs text-blue-600 mt-2 bg-blue-50 px-3 py-2 rounded-lg">Add ₹{499 - subtotal} more for free delivery</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}