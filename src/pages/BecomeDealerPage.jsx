import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench, MapPin, Phone, Mail, User, Building,
  CheckCircle, ChevronDown, ArrowRight, Store,
  Shield, TrendingUp, Users, Check,
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu and Kashmir','Ladakh','Puducherry',
];

const BENEFITS = [
  { icon: TrendingUp, title: 'Earn More Revenue',    desc: 'Access TVS customer base and earn consistent income from spare parts sales.' },
  { icon: Shield,     title: 'Official Partnership', desc: 'Become an authorised TVS dealer with official credentials and branding.' },
  { icon: Store,      title: 'Your Own Dashboard',   desc: 'Manage products, track orders and monitor revenue all in one place.' },
  { icon: Users,      title: 'Dedicated Support',    desc: 'Priority support from our dealer relations team and training materials.' },
];

export default function BecomeDealerPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', businessName: '',
    businessLocation: '', state: '', message: '',
  });
  const [errors, setErrors] = useState({});

  const set = (k) => (e) => {
    setForm(p => ({ ...p, [k]: e.target.value }));
    setErrors(p => ({ ...p, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())             e.name             = 'Required';
    if (!form.email.trim())            e.email            = 'Required';
    if (!form.phone.trim())            e.phone            = 'Required';
    if (!form.businessName.trim())     e.businessName     = 'Required';
    if (!form.businessLocation.trim()) e.businessLocation = 'Required';
    if (!form.state)                   e.state            = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/dealer/request', form);
      setSubmitted(true);
      toast.success('Application submitted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="text-white py-16 px-4"
        style={{ background: 'linear-gradient(135deg, #071630 0%, #0a1f44 60%, #0d2657 100%)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(255,255,255,0.1)' }}>
            <Store className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-3">Become a TVS Dealer</h1>
          <p className="text-blue-200 text-base md:text-lg max-w-xl mx-auto">
            Partner with India's leading two-wheeler brand. Sell genuine TVS parts and grow your business.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {['No Joining Fee', '4,000+ Partners Across India', 'Your Own Dashboard'].map(t => (
              <div key={t} className="flex items-center gap-2 border border-white/20 px-4 py-2 rounded-full text-sm"
                style={{ background: 'rgba(255,255,255,0.08)' }}>
                <Check className="w-4 h-4" style={{ color: '#ffff' }} /> {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12 space-y-14">
        {/* Benefits */}
        <section>
          <h2 className="text-2xl font-black text-gray-900 text-center mb-2">Why Partner With Us?</h2>
          <p className="text-gray-500 text-sm text-center mb-8">Everything you need to build a successful parts dealership</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BENEFITS.map(({ icon: Icon, title, desc }) => (
              <div key={title}
                className="card p-5 hover:shadow-md transition-shadow hover:border-[#0a1f44]/30 border-2 border-gray-100">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: '#0a1f44' }}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1 text-sm">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Steps */}
        <section className="rounded-3xl p-8" style={{ background: '#e8edf5' }}>
          <h2 className="text-2xl font-black text-gray-900 text-center mb-8">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Apply Online',    desc: 'Fill the form with your business details' },
              { step: '02', title: 'Review',          desc: 'Our team reviews your application in 3-5 days' },
              { step: '03', title: 'Get Approved',    desc: 'Receive your Dealer ID and login credentials' },
              { step: '04', title: 'Start Selling',   desc: 'List products, manage orders and grow' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black text-white mx-auto mb-3"
                  style={{ background: '#0a1f44' }}>
                  {step}
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Application Form */}
        <section>
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-black text-gray-900 text-center mb-2">Apply Now</h2>
            <p className="text-gray-500 text-sm text-center mb-8">
              Already a dealer?{' '}
              <Link to="/login?type=dealer" className="font-bold hover:underline" style={{ color: '#0a1f44' }}>
                Login as Dealer
              </Link>
            </p>

            <div className="card p-6 md:p-8 border-2 border-gray-100">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: '#e8edf5' }}>
                    <CheckCircle className="w-8 h-8" style={{ color: '#0a1f44' }} />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">Application Submitted!</h3>
                  <p className="text-gray-500 text-sm mb-1">
                    Confirmation sent to <strong>{form.email}</strong>
                  </p>
                  <p className="text-gray-400 text-xs mb-6">
                    Our dealer relations team will contact you within 3-5 business days.
                  </p>
                  <Link to="/" className="btn-primary px-6 py-2.5 text-sm">
                    Back to Home <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <label className="label">Full Name *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input type="text" value={form.name} onChange={set('name')}
                          placeholder="Your full name"
                          className={`input-field pl-10 text-sm ${errors.name ? 'input-error' : ''}`} />
                      </div>
                      {errors.name && <p className="text-xs mt-1" style={{ color: '#de1c0e' }}>Required</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="label">Email Address *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input type="email" value={form.email} onChange={set('email')}
                          placeholder="business@example.com"
                          className={`input-field pl-10 text-sm ${errors.email ? 'input-error' : ''}`} />
                      </div>
                      {errors.email && <p className="text-xs mt-1" style={{ color: '#de1c0e' }}>Required</p>}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="label">Phone Number *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input type="tel" value={form.phone} onChange={set('phone')}
                          placeholder="+91 XXXXX XXXXX"
                          className={`input-field pl-10 text-sm ${errors.phone ? 'input-error' : ''}`} />
                      </div>
                      {errors.phone && <p className="text-xs mt-1" style={{ color: '#de1c0e' }}>Required</p>}
                    </div>

                    {/* Business Name */}
                    <div>
                      <label className="label">Business Name *</label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input type="text" value={form.businessName} onChange={set('businessName')}
                          placeholder="Your shop / company"
                          className={`input-field pl-10 text-sm ${errors.businessName ? 'input-error' : ''}`} />
                      </div>
                      {errors.businessName && <p className="text-xs mt-1" style={{ color: '#de1c0e' }}>Required</p>}
                    </div>

                    {/* Location */}
                    <div>
                      <label className="label">Business Location *</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input type="text" value={form.businessLocation} onChange={set('businessLocation')}
                          placeholder="City, Area"
                          className={`input-field pl-10 text-sm ${errors.businessLocation ? 'input-error' : ''}`} />
                      </div>
                      {errors.businessLocation && <p className="text-xs mt-1" style={{ color: '#de1c0e' }}>Required</p>}
                    </div>

                    {/* State */}
                    <div>
                      <label className="label">State *</label>
                      <div className="relative">
                        <select value={form.state} onChange={set('state')}
                          className={`input-field text-sm appearance-none cursor-pointer ${errors.state ? 'input-error' : ''}`}>
                          <option value="">Select state...</option>
                          {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                      {errors.state && <p className="text-xs mt-1" style={{ color: '#de1c0e' }}>Required</p>}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="label">
                      Additional Message <span className="font-normal text-gray-400">(optional)</span>
                    </label>
                    <textarea rows={3} value={form.message} onChange={set('message')}
                      placeholder="Tell us about your business or experience with TVS products..."
                      className="input-field resize-none text-sm" />
                  </div>

                  <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm">
                    {loading ? (
                      <span className="flex items-center gap-2 justify-center">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 justify-center">
                        Submit Application <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </button>

                  <p className="text-xs text-gray-400 text-center">
                    By submitting you agree to TVS AutoParts dealer terms. We will email you within 3-5 business days.
                  </p>
                </form>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
