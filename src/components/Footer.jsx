import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Wrench, Lock, ShieldCheck } from "lucide-react";
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa";
import TVS_Logo from "../assets/TVS_logo_white.png";

const HELP_LINKS = [
  { label: "Customer Support", path: "/customer-care"        },
  { label: "Track My Order",   path: "/profile?tab=tracking" },
  { label: "Return Policy",    path: "/customer-care"        },
  { label: "Warranty Claims",  path: "/customer-care"        },
  { label: "Become a Dealer",  path: "/become-dealer"        },
];

const TVS_INFO = [
  { label: "Founded in 1978",                value: "" },
  { label: "Headquartered in Hosur, TN",     value: "" },
  { label: "ISO 9001:2015 Certified",         value: "" },
  { label: "1 Year Warranty on All Parts",    value: "" },
  { label: "Pan-India Dealer Network",        value: "" },
  { label: "OEM-Grade Spare Parts",           value: "" },
  { label: "Over 10 Million Customers",       value: "" },
];

export default function Footer() {
  return (
    <footer className="bg-[#0a1f44] text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

          {/* ── Brand ── */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-5">
              <img src={TVS_Logo} alt="TVS Motors" className="h-9 w-auto object-contain" />
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              Official online store for genuine TVS spare parts, accessories and
              lubricants. Quality assured. Warranty backed.
            </p>
            <div className="flex gap-2">
              {[FaFacebook, FaTwitter, FaInstagram, FaYoutube].map((Icon, i) => (
                <a key={i} href="#"
                  className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg
                             flex items-center justify-center transition-colors">
                  <Icon className="w-4 h-4 text-gray-300" />
                </a>
              ))}
            </div>
          </div>

          {/* ── About TVS ── */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">
              About TVS
            </h3>
            <ul className="space-y-2">
              {TVS_INFO.map(({ label }) => (
                <li key={label} className="text-sm text-gray-400 flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          {/* ── Help & Support ── */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">
              Help &amp; Support
            </h3>
            <ul className="space-y-2">
              {HELP_LINKS.map(({ label, path }) => (
                <li key={label}>
                  <Link to={path}
                    className="text-sm text-gray-400 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contact ── */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-blue-300 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-300 font-medium">1800-258-6454</p>
                  <p className="text-xs text-gray-500">Toll-free · 24 × 7</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-blue-300 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-300 font-medium">parts@tvsmotors.com</p>
                  <p className="text-xs text-gray-500">Reply within 4 hours</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-300 mt-0.5 flex-shrink-0" />
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
              <Wrench className="w-3 h-3" /> OEM Certified Parts
            </span>
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3" /> Secure Checkout
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> 1 Year Warranty
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}