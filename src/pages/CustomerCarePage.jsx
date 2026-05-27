import { useState } from "react";
import {
  Phone,
  Mail,
  Headphones,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Shield,
  Star,
  Wrench,
  CheckCircle,
} from "lucide-react";

/* ── TVS-specific FAQs ── */
const FAQS = [
  {
    q: "How do I check if a part is compatible with my TVS bike?",
    a: "Use the model search on our website. Enter your bike model (e.g. TVS Apache RTR 160, TVS Jupiter) and the compatible parts will be listed. You can also call our helpline for expert guidance.",
  },
  {
    q: "Are all parts on this store genuine TVS parts?",
    a: "Yes. Every part sold here is 100% genuine, sourced directly from TVS Motor Company. Each item comes with a quality seal and manufacturer warranty.",
  },
  {
    q: "How do I track my parts order?",
    a: "Go to My Orders in your profile. Each order shows real-time tracking — Placed, Processing, Shipped, or Delivered. You will also receive SMS and email updates at every stage.",
  },
  {
    q: "What is the return policy for spare parts?",
    a: "We offer a 10-day return policy for unused, unopened parts in original packaging. Electrical components and consumables (oils, filters) are non-returnable once opened. Refunds are processed within 5–7 business days.",
  },
  {
    q: "Can I cancel my order?",
    a: 'Orders can be cancelled before they are shipped. Go to My Orders, select the order and click "Cancel Order". Once dispatched, cancellation is not possible but you may initiate a return after delivery.',
  },
  {
    q: "What payment methods are accepted?",
    a: "We accept UPI, Credit/Debit Cards, Net Banking, and Cash on Delivery. All online transactions are secured with 256-bit SSL encryption and RBI-compliant payment gateways.",
  },
  {
    q: "How long does delivery take?",
    a: "Standard delivery takes 3–7 business days depending on your location. Express delivery (1–2 days) is available in select cities. Remote areas may take up to 10 business days.",
  },
  {
    q: "Do you offer installation support?",
    a: "We recommend visiting your nearest authorised TVS service centre for installation. Our customer care team can help you locate the nearest centre and schedule an appointment.",
  },
  {
    q: "How do I become an authorised TVS dealer/reseller?",
    a: 'Click "Become a Dealer" in the navigation menu and fill out the partnership form. Our dealer relations team will review your application within 3–5 business days.',
  },
  {
    q: "Is my personal data safe?",
    a: "Absolutely. We follow strict data protection standards and never share your information with third parties without your consent. Read our Privacy Policy for full details.",
  },
];

/* ── Support channels ── */
const SUPPORT_CHANNELS = [
  {
    icon: Phone,
    title: "Call Support",
    primary: "1800-258-6454",
    secondary: "Toll-free · 24 × 7",
    desc: "Speak directly with a TVS parts specialist",
  },
  {
    icon: Mail,
    title: "Email Support",
    primary: "parts@tvsmotors.com",
    secondary: "Reply within 2–4 hours",
    desc: "Send your query, order ID or invoice",
  },
  {
    icon: MessageCircle,
    title: "Live Chat",
    primary: "Available on Website",
    secondary: "Avg. response: 2 minutes",
    desc: "Instant help from a support agent",
  },
  {
    icon: Wrench,
    title: "Service Centre",
    primary: "Locate Nearest Centre",
    secondary: "4,000+ centres across India",
    desc: "For installation, repair and diagnostics",
  },
];

export default function CustomerCarePage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setContactForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="bg-white min-h-screen">
      {/* ══ HERO ══ */}
      <section className="bg-[#0a1f44] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className="w-16 h-16 bg-white/10 border border-white/20 rounded-2xl
                          flex items-center justify-center mx-auto mb-5"
          >
            <Headphones className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-3 tracking-tight">
            24 × 7 Customer Support
          </h1>
          <p className="text-blue-200 text-base md:text-lg max-w-xl mx-auto">
            Expert help for genuine TVS parts, orders, delivery and service —
            any time, any day.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-3 mt-8 text-sm">
            {[
              { icon: Clock, text: "24 × 7 Available" },
              { icon: Shield, text: "Secure & Confidential" },
              { icon: Star, text: "4.9 ★ Rated Support" },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-2 bg-white/10 border border-white/20
                           px-4 py-2 rounded-full backdrop-blur-sm text-white"
              >
                <Icon className="w-4 h-4 text-blue-300" />
                <span className="text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12 space-y-14">
        {/* ══ SUPPORT CHANNELS ══ */}
        <section>
          <h2 className="text-2xl font-black text-gray-900 mb-2 text-center">
            Contact Us
          </h2>
          <p className="text-gray-500 text-sm text-center mb-8">
            Choose the channel that works best for you
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SUPPORT_CHANNELS.map(
              ({ icon: Icon, title, primary, secondary, desc }) => (
                <div
                  key={title}
                  className="bg-white border-2 border-gray-100 rounded-2xl p-5
                           hover:border-[#0a1f44] hover:shadow-md transition-all group"
                >
                  <div
                    className="w-11 h-11 bg-[#0a1f44] rounded-xl flex items-center
                                justify-center mb-4 shadow-sm"
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1 text-sm">
                    {title}
                  </h3>
                  <p className="text-sm font-semibold text-[#0a1f44]">
                    {primary}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{secondary}</p>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                    {desc}
                  </p>
                </div>
              ),
            )}
          </div>
        </section>

        {/* ══ FAQ + CONTACT FORM ══ */}
        <div className="grid lg:grid-cols-2 gap-10">
          {/* FAQ */}
          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Quick answers to common queries about TVS parts &amp; orders
            </p>

            <div className="space-y-2">
              {FAQS.map((faq, i) => (
                <div
                  key={i}
                  className="border-2 border-gray-100 rounded-xl overflow-hidden
                             hover:border-gray-200 transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4
                               text-left bg-white hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm font-semibold text-gray-800 pr-3">
                      {faq.q}
                    </span>
                    {openFaq === i ? (
                      <ChevronUp className="w-4 h-4 text-[#0a1f44] flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400  flex-shrink-0" />
                    )}
                  </button>
                  {openFaq === i && (
                    <div
                      className="px-5 pb-4 pt-2 text-sm text-gray-600
                                    leading-relaxed border-t border-gray-100 bg-gray-50"
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Contact Form */}
          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-2">
              Send Us a Message
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Fill the form and our team will respond within 2–4 hours
            </p>

            <div className="bg-white border-2 border-gray-100 rounded-2xl p-6">
              {submitted ? (
                /* ── Success state ── */
                <div className="text-center py-12">
                  <div
                    className="w-16 h-16 bg-[#0a1f44] rounded-full
                                  flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Message Sent!
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Our support team will get back to you within 2–4 business
                    hours at your registered email.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  {/* Name + Email */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        className="text-xs font-bold text-gray-500 uppercase
                                        tracking-wider mb-1.5 block"
                      >
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={(e) => {
                          const v = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                          setContactForm((p) => ({ ...p, name: v }));
                        }}
                        placeholder="Full name"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label
                        className="text-xs font-bold text-gray-500 uppercase
                                        tracking-wider mb-1.5 block"
                      >
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={(e) => {
                          const v = e.target.value
                            .replace(/\s/g, "")
                            .toLowerCase();
                          setContactForm((p) => ({ ...p, email: v }));
                        }}
                        placeholder="you@example.com"
                        className="input-field"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label
                      className="text-xs font-bold text-gray-500 uppercase
                                      tracking-wider mb-1.5 block"
                    >
                      Subject
                    </label>
                    <select
                      required
                      value={contactForm.subject}
                      onChange={(e) =>
                        setContactForm((p) => ({
                          ...p,
                          subject: e.target.value,
                        }))
                      }
                      className="input-field"
                    >
                      <option value="">Select a topic</option>
                      <option>Part Compatibility Query</option>
                      <option>Order Issue</option>
                      <option>Payment Problem</option>
                      <option>Return / Refund</option>
                      <option>Warranty Claim</option>
                      <option>Dealer / Reseller Enquiry</option>
                      <option>Account Issue</option>
                      <option>Other</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label
                      className="text-xs font-bold text-gray-500 uppercase
                                      tracking-wider mb-1.5 block"
                    >
                      Message
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={contactForm.message}
                      onChange={(e) =>
                        setContactForm((p) => ({
                          ...p,
                          message: e.target.value,
                        }))
                      }
                      placeholder="Describe your issue in detail (include order ID if applicable)…"
                      className="input-field resize-none"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="btn-primary w-full py-3 text-sm"
                  >
                    Send Message
                  </button>

                  <p className="text-xs text-gray-400 text-center">
                    Or email us at{" "}
                    <span className="text-[#0a1f44] font-semibold">
                      parts@tvsmotors.com
                    </span>
                  </p>
                </form>
              )}
            </div>
          </section>
        </div>

        {/* ══ BOTTOM CALLOUT ══ */}
        <section className="bg-[#0a1f44] rounded-3xl p-8 md:p-10 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-black mb-2">Still need help?</h3>
            <p className="text-blue-200 text-sm mb-8">
              Our senior technical team handles escalated queries with priority
              turnaround.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              {[
                { icon: "📞", label: "Toll-Free", value: "1800-258-6454" },
                { icon: "📧", label: "Email", value: "parts@tvsmotors.com" },
                { icon: "🕐", label: "Support Hours", value: "24 × 7 × 365" },
              ].map(({ icon, label, value }) => (
                <div
                  key={label}
                  className="bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-center min-w-[160px]"
                >
                  <p className="text-xl mb-1">{icon}</p>
                  <p className="text-xs text-blue-300 font-medium mb-0.5">
                    {label}
                  </p>
                  <p className="text-sm font-bold text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
