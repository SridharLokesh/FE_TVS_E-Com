import { useState, useRef } from 'react';
import { Search, Download, Package, Truck, CheckCircle, Clock, XCircle, Printer, FileText } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import TVS_logo from '../assets/TVS_logo.png';

const STATUS_STEPS = ['Placed', 'Processing', 'Packed', 'Shipped', 'Delivered'];

const STATUS_CONFIG = {
  Placed:     { icon: Clock,        color: '#0a1f44', bg: '#e8edf5' },
  Processing: { icon: Package,      color: '#0a1f44', bg: '#e8edf5' },
  Packed:     { icon: Package,      color: '#0a1f44', bg: '#e8edf5' },
  Shipped:    { icon: Truck,        color: '#0a1f44', bg: '#e8edf5' },
  Delivered:  { icon: CheckCircle,  color: '#fff',    bg: '#0a1f44' },
  Cancelled:  { icon: XCircle,      color: '#fff',    bg: '#de1c0e' },
};

export default function InvoicePage({ auth }) {
  const { user } = auth;
  const [query,   setQuery]   = useState('');
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(false);
  const printRef = useRef(null);

  const search = async () => {
    const q = query.trim();
    if (!q) { toast.error('Enter an invoice or order number'); return; }
    setLoading(true);
    try {
      const { data: myOrders } = await api.get('/orders/my');
      const found = myOrders.find(
        o => o.invoiceNumber?.toLowerCase() === q.toLowerCase() || o._id === q
      );
      if (found) setOrder(found);
      else toast.error('No order found with that invoice number');
    } catch (err) { toast.error(err.response?.data?.message || 'Search failed'); }
    finally { setLoading(false); }
  };

  const handleDownload = () => {
    const prev = document.title;
    document.title = `Invoice-${order.invoiceNumber}`;
    window.print();
    document.title = prev;
  };

  const currentStep = order ? STATUS_STEPS.indexOf(order.orderStatus) : -1;
  const scfg = order ? (STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.Placed) : null;
  const StatusIcon = scfg?.icon;

  return (
    <div className="page-wrapper max-w-3xl">
      <h1 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
        <FileText className="w-6 h-6" style={{ color: '#0a1f44' }} />
        Invoice & Order Tracking
      </h1>

      {/* Search */}
      <div className="card p-5 mb-6">
        <label className="label">Enter Invoice / Order Number</label>
        <div className="flex gap-3">
          <input type="text" value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="e.g. TVS-INV-XXXXXX-XXXX"
            className="input-field flex-1 text-sm font-mono" />
          <button onClick={search} disabled={loading} className="btn-primary px-5 text-sm">
            {loading
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin block" />
              : <Search className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Find your invoice number in the order confirmation email or in My Profile &gt; Orders.
        </p>
      </div>

      {order && (
        <>
          {/* Status banner */}
          {scfg && StatusIcon && (
            <div className="flex items-center gap-3 rounded-2xl p-4 mb-5"
              style={{ background: scfg.bg }}>
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
                <StatusIcon className="w-5 h-5" style={{ color: scfg.color === '#fff' ? '#0a1f44' : scfg.color }} />
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: scfg.color === '#fff' ? 'white' : scfg.color }}>
                  Order {order.orderStatus}
                </p>
                {order.trackingNumber && (
                  <p className="text-xs mt-0.5" style={{ color: scfg.color === '#fff' ? 'rgba(255,255,255,0.8)' : '#374151' }}>
                    Tracking: <span className="font-mono font-bold">{order.trackingNumber}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Progress tracker */}
          {!['Cancelled', 'Returned'].includes(order.orderStatus) && (
            <div className="card p-5 mb-5">
              <h3 className="font-bold text-gray-900 text-sm mb-4">Order Progress</h3>
              <div className="flex items-center">
                {STATUS_STEPS.map((step, idx) => {
                  const done   = idx <= currentStep;
                  const active = idx === currentStep;
                  return (
                    <div key={step} className="flex-1 flex flex-col items-center">
                      <div className="flex items-center w-full">
                        {idx > 0 && (
                          <div className="h-0.5 flex-1"
                            style={{ background: idx <= currentStep ? '#0a1f44' : '#e5e7eb' }} />
                        )}
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{
                            background: done ? '#0a1f44' : '#e5e7eb',
                            color: done ? 'white' : '#9ca3af',
                            outline: active ? '3px solid #e8edf5' : 'none',
                          }}>
                          {done && !active ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                        </div>
                        {idx < STATUS_STEPS.length - 1 && (
                          <div className="h-0.5 flex-1"
                            style={{ background: done && idx < currentStep ? '#0a1f44' : '#e5e7eb' }} />
                        )}
                      </div>
                      <p className="text-xs mt-2 font-semibold"
                        style={{ color: active ? '#0a1f44' : done ? '#374151' : '#9ca3af' }}>
                        {step}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Invoice (delivered only) */}
          {order.orderStatus === 'Delivered' ? (
            <>
              <div className="flex gap-3 mb-4 no-print">
                <button onClick={handleDownload} className="btn-primary text-sm px-5 py-2.5">
                  <Download className="w-4 h-4" /> Download Invoice
                </button>
                <button onClick={() => window.print()} className="btn-secondary text-sm px-5 py-2.5">
                  <Printer className="w-4 h-4" /> Print
                </button>
              </div>

              <div ref={printRef} id="invoice-print"
                className="card p-6 md:p-8 space-y-6 print:shadow-none print:border-0">
                {/* Invoice header */}
                <div className="flex items-start justify-between">
                  <div>
                    <img src={TVS_logo} alt="TVS" className="h-10 object-contain mb-2" />
                    <p className="text-xs text-gray-500">TVS AutoParts</p>
                    <p className="text-xs text-gray-400">Chennai, Tamil Nadu - India</p>
                    <p className="text-xs text-gray-400">support@tvsautoparts.com</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-gray-900">INVOICE</p>
                    <p className="font-mono text-sm text-gray-500 mt-1">{order.invoiceNumber}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Date: {new Date(order.deliveredAt || order.updatedAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>

                <hr className="border-gray-100" />

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="label">Bill To</p>
                    <p className="font-bold text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-sm text-gray-600">{user.phone}</p>
                  </div>
                  <div>
                    <p className="label">Ship To</p>
                    <p className="text-sm text-gray-700">
                      {[order.shippingAddress?.street, order.shippingAddress?.city,
                        order.shippingAddress?.state, order.shippingAddress?.pincode]
                        .filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>

                {/* Items table */}
                <table className="w-full text-sm">
                  <thead style={{ background: '#e8edf5' }}>
                    <tr className="text-xs text-gray-500 uppercase">
                      <th className="text-left px-3 py-2 rounded-l-lg">Item</th>
                      <th className="text-center px-3 py-2">Qty</th>
                      <th className="text-right px-3 py-2">Unit Price</th>
                      <th className="text-right px-3 py-2 rounded-r-lg">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.orderItems.map((item, i) => (
                      <tr key={i} className="border-b border-gray-50">
                        <td className="px-3 py-2.5">
                          <p className="font-semibold text-gray-800">{item.title}</p>
                          {item.color && <p className="text-xs text-gray-400">Color: {item.color}</p>}
                        </td>
                        <td className="px-3 py-2.5 text-center">{item.quantity}</td>
                        <td className="px-3 py-2.5 text-right">Rs.{item.price?.toLocaleString('en-IN')}</td>
                        <td className="px-3 py-2.5 text-right font-bold">
                          Rs.{(item.price * item.quantity)?.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end">
                  <div className="w-64 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>Rs.{order.itemsPrice?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Delivery</span>
                      <span style={order.shippingPrice === 0 ? { color: '#0a1f44', fontWeight: 700 } : {}}>
                        {order.shippingPrice === 0 ? 'FREE' : `Rs.${order.shippingPrice}`}
                      </span>
                    </div>
                    <hr className="border-gray-200" />
                    <div className="flex justify-between font-black text-gray-900 text-base">
                      <span>Total</span>
                      <span>Rs.{order.totalPrice?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Payment</span>
                      <span className="font-semibold">{order.paymentMethod}</span>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-100" />
                <div className="text-center">
                  <p className="text-xs text-gray-400">Thank you for shopping with TVS AutoParts!</p>
                  <p className="text-xs text-gray-400">For queries: support@tvsautoparts.com | 1800-258-6454</p>
                </div>
              </div>
            </>
          ) : (
            <div className="card p-5">
              <h3 className="font-bold text-gray-900 mb-1">Order Summary</h3>
              <p className="text-sm text-gray-500 mb-4">
                Invoice will be available once your order is delivered.
              </p>
              <div className="space-y-2">
                {order.orderItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <img src={item.image} alt={item.title}
                      className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                      onError={e => e.currentTarget.style.display = 'none'} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{item.title}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-sm text-gray-900 flex-shrink-0">
                      Rs.{(item.price * item.quantity).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-black text-gray-900 mt-3 pt-3 border-t border-gray-100">
                <span>Total</span>
                <span>Rs.{order.totalPrice?.toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
