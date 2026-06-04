import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, X, CheckCheck, ShoppingBag, Tag, Truck,
  Package, AlertTriangle, Users, Trash2, Info,
} from 'lucide-react';

const TYPE_CONFIG = {
  order_status:   { icon: ShoppingBag, blue: true },
  best_deal:      { icon: Tag,         red: true  },
  new_arrival:    { icon: Package,     blue: true },
  discount:       { icon: Tag,         red: true  },
  new_order:      { icon: ShoppingBag, blue: true },
  return_request: { icon: Truck,       red: true  },
  low_stock:      { icon: AlertTriangle, red: true },
  dealer_request: { icon: Users,       blue: true },
  complaint:      { icon: AlertTriangle, red: true },
  new_user:       { icon: Users,       blue: true },
};

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationPanel({
  notifications, unreadCount, markRead, markAllRead, deleteNotif, onClose,
}) {
  const navigate = useNavigate();
  const panelRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  const handleClick = (notif) => {
    markRead(notif._id);
    if (notif.link) navigate(notif.link);
    onClose();
  };

  return (
    <div ref={panelRef}
      className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white rounded-2xl
                 shadow-2xl border border-gray-100 z-50 overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 text-white"
        style={{ background: '#0a1f44' }}>
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4" />
          <span className="font-bold text-sm">Notifications</span>
          {unreadCount > 0 && (
            <span className="text-white text-xs font-black px-2 py-0.5 rounded-full"
              style={{ background: '#de1c0e' }}>
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              className="text-xs text-blue-200 hover:text-white flex items-center gap-1">
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
          )}
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-[420px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400 font-medium">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notif) => {
            const cfg  = TYPE_CONFIG[notif.type] || TYPE_CONFIG.order_status;
            const Icon = cfg.icon;
            const iconBg    = cfg.red  ? '#fde8e7' : '#e8edf5';
            const iconColor = cfg.red  ? '#de1c0e' : '#0a1f44';
            return (
              <div key={notif._id}
                className={`flex gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50
                            cursor-pointer relative group transition-colors
                            ${!notif.isRead ? 'bg-[#e8edf5]/40' : ''}`}
                onClick={() => handleClick(notif)}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: iconBg }}>
                  <Icon className="w-4 h-4" style={{ color: iconColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm text-gray-900 ${!notif.isRead ? 'font-bold' : 'font-semibold'}`}>
                    {notif.title}
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{timeAgo(notif.createdAt)}</p>
                </div>
                {!notif.isRead && (
                  <div className="w-2 h-2 rounded-full flex-shrink-0 mt-2"
                    style={{ background: '#0a1f44' }} />
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); deleteNotif(notif._id); }}
                  className="absolute right-2 top-2 opacity-0 group-hover:opacity-100
                             p-1 text-gray-300 hover:text-gray-600 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}