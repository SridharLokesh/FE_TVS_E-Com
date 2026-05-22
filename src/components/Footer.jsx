import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Wrench, Lock, ShieldCheck } from 'lucide-react';
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';

const PART_LINKS = [
  { label: 'Engine Parts', path: '/products/category/engine' },
  { label: 'Brakes', path: '/products/category/brakes' },
  { label: 'Electricals', path: '/products/category/electricals' },
  { label: 'Suspension', path: '/products/category/suspension' },
  { label: 'Tyres & Wheels', path: '/products/category/tyres' },
  { label: 'Lubricants', path: '/products/category/lubricants' },
  { label: 'Body Parts', path: '/products/category/body' },
  { label: 'Accessories', path: '/products/category/accessories' },
];

const HELP_LINKS = [
  { label: 'Customer Support', path: '/customer-care' },
  { label: 'Track My Order', path: '/orders' },
  { label: 'Return Policy', path: '/customer-care' },
  { label: 'Warranty Claims', path: '/customer-care' },
  { label: 'Become a Dealer', path: '/become-seller' },
  { label: 'Privacy Policy', path: '/privacy' },
  { label: 'Terms of Service', path: '/terms' },
];

export default function Footer() {
  return (
    <footer className="bg-[#0a1f44] text-gray-300 mt-16" aria-label="Footer">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-5" aria-label="TVS Motors Home">
              <div className="w-10 h-8 bg-white rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 48 32" className="w-9 h-6" fill="none" role="img" aria-label="TVS Logo">
                  <text
                    x="24"
                    y="22"
                    textAnchor="middle"
                    style={{
                      fontFamily: 'Inter,sans-serif',
                      fontWeight: 900,
                      fontSize: 16,
                      fill: '#0a1f44',
                      letterSpacing: 1,
                    }}
                  >
                    TVS
                  </text>
                </svg>
              </div>
              <div>
                <p className="text-sm font-black text-white tracking-wider leading-none">TVS MOTORS</p>
                <p className="text-[10px] text-blue-300 tracking-wide">Parts &amp; Accessories</p>
              </div>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              Official online store for genuine TVS spare parts, accessories and lubricants.
              Quality assured. Warranty backed.
            </p>
            {/* Socials */}
            <nav aria-label="Social Media">
              <div className="flex gap-2">
                {[
                  { Icon: FaFacebookF, label: 'Facebook', href: 'https://facebook.com/tvsmotors' },
                  { Icon: FaTwitter, label: 'Twitter', href: 'https://twitter.com/tvsmotors' },
                  { Icon: FaInstagram, label: 'Instagram', href: 'https://instagram.com/tvsmotors' },
                  { Icon: FaYoutube, label: 'YouTube', href: 'https://youtube.com/tvsmotors' },
                ].map(({ Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <Icon className="w-4 h-4 text-gray-300" />
                  </a>
                ))}
              </div>
            </nav>
          </div>

          {/* Parts */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Shop Parts</h3>
            <ul className="space-y-2">
              {PART_LINKS.map(({ label, path }) => (
                <li key={label}>
                  <Link
                    to={path}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Help &amp; Support</h3>
            <ul className="space-y-2">
              {HELP_LINKS.map(({ label, path }) => (
                <li key={label}>
                  <Link
                    to={path}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-blue-300 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-sm text-gray-300 font-medium">
                    <a href="tel:18002586454" className="hover:underline">1800-258-6454</a>
                  </p>
                  <p className="text-xs text-gray-500">Toll-free · 24 × 7</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-blue-300 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-sm text-gray-300 font-medium">
                    <a href="mailto:parts@tvsmotors.com" className="hover:underline">parts@tvsmotors.com</a>
                  </p>
                  <p className="text-xs text-gray-500">Reply within 4 hours</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-300 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-sm text-gray-300 font-medium">TVS Motor Company</p>
                  <p className="text-xs text-gray-500">Hosur, Tamil Nadu, India</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

   {/* Bottom bar */}
<div className="border-t border-white/10">
  <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
    <p className="text-xs text-gray-500">
      © {new Date().getFullYear()} TVS Motor Company. All rights reserved.
    </p>
    <div className="flex items-center gap-4 text-xs text-gray-500">
      <span className="flex items-center gap-1">
        <Wrench className="w-3 h-3" aria-hidden="true" /> OEM Certified Parts
      </span>
      <span className="flex items-center gap-1">
        <Lock className="w-3 h-3" aria-hidden="true" /> Secure Checkout
      </span>
      <span className="flex items-center gap-1">
        <ShieldCheck className="w-3 h-3" aria-hidden="true" /> 1 Year Warranty
      </span>
    </div>
  </div>
</div>
    </footer>
  );
}
