import { useState, useRef, useEffect } from 'react';
import { Upload, Save, Image, Info, CheckCircle, Palette } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

/* ── fixed logo display sizes ── */
const LOGO_LIGHT_W = 120; // px — navbar logo
const LOGO_LIGHT_H = 40;

export default function AdminSettingsNavbar() {
  const [settings, setSettings] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);

  /* form state */
  const [promoText, setPromoText]       = useState('');
  const [promoVisible, setPromoVisible] = useState(true);
  const [promoColor,   setPromoColor]   = useState('#de1c0e');

  /* logo previews (base64 or existing URL) */
  const [logoLightPreview, setLogoLightPreview] = useState(null);
  const [logoLightFile,    setLogoLightFile]    = useState(null);

  const lightRef = useRef(null);

  /* ── fetch current settings ── */
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/admin/site-settings');
        const s = data || {};
        setSettings(s);
        setPromoText(s.navbar?.promoText ?? 'Genuine TVS Parts & Accessories — Free shipping above ₹999 — 1 Year Warranty on all parts');
        setPromoVisible(s.navbar?.promoVisible ?? true);
        setPromoColor(s.navbar?.promoColor ?? '#de1c0e');
        setLogoLightPreview(s.navbar?.logoLight ?? null);
      } catch {
        /* fallback defaults */
        setPromoText('Genuine TVS Parts & Accessories — Free shipping above ₹999 — 1 Year Warranty on all parts');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* ── handle file pick ── */
  const pickFile = (ref) => ref.current?.click();

  const onLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 2 * 1024 * 1024)    { toast.error('Logo must be under 2 MB');       return; }
    const reader = new FileReader();
    reader.onload = (ev) => { setLogoLightPreview(ev.target.result); setLogoLightFile(file); };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  /* ── save ── */
  const save = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('section', 'navbar');
      fd.append('promoText',    promoText);
      fd.append('promoVisible', promoVisible);
      fd.append('promoColor',   promoColor);
      if (logoLightFile) fd.append('logoLight', logoLightFile);

      const { data } = await api.post('/admin/site-settings', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Navbar settings saved!');
      setLogoLightFile(null);
      if (data?.settings?.navbar?.logoLight) setLogoLightPreview(data.settings.navbar.logoLight);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      {[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl bg-gray-100" />)}
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h3 className="font-black text-gray-900 text-lg">
          Navbar Settings
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Categories, search, cart and wishlist are managed elsewhere. Edit logo and promo bar here.
        </p>
      </div>

      {/* ── Promo Bar ── */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: promoColor }} /> Promo Strip
          </h4>
          {/* visible toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div onClick={() => setPromoVisible(v => !v)}
              className={`w-10 h-5 rounded-full transition-colors relative ${promoVisible ? 'bg-[#0a1f44]' : 'bg-gray-200'}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${promoVisible ? 'left-5' : 'left-0.5'}`} />
            </div>
            <span className="text-xs font-semibold text-gray-600">{promoVisible ? 'Visible' : 'Hidden'}</span>
          </label>
        </div>

        <div>
          <label className="label">Promo Text</label>
          <input
            type="text"
            value={promoText}
            onChange={e => setPromoText(e.target.value)}
            maxLength={200}
            placeholder="e.g. Free shipping above ₹999 — 1 Year Warranty"
            className="input-field text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">{promoText.length}/200 characters · Use — as separator</p>
        </div>

        {/* Color picker */}
        <div>
          <label className="label flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-[#0a1f44]" /> Strip Background Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={promoColor}
              onChange={e => setPromoColor(e.target.value)}
              className="w-10 h-10 rounded-xl border-2 border-gray-200 cursor-pointer p-0.5 bg-white"
            />
            <input
              type="text"
              value={promoColor}
              onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) setPromoColor(e.target.value); }}
              maxLength={7}
              placeholder="#de1c0e"
              className="input-field text-sm font-mono w-28"
            />
            <div className="flex gap-1.5">
              {['#de1c0e','#0a1f44','#16a34a','#d97706','#7c3aed','#0891b2'].map(col => (
                <button key={col} type="button" onClick={() => setPromoColor(col)}
                  title={col}
                  className="w-6 h-6 rounded-lg border-2 transition-all hover:scale-110"
                  style={{ background: col, borderColor: promoColor === col ? '#0a1f44' : 'transparent' }} />
              ))}
            </div>
          </div>
        </div>

        {/* Live preview */}
        {promoVisible && (
          <div className="rounded-xl overflow-hidden">
            <div className="text-white py-1.5 px-4 text-center text-xs font-medium" style={{ background: promoColor }}>
              {promoText || 'Promo text will appear here'}
            </div>
          </div>
        )}
        {!promoVisible && (
          <div className="rounded-xl border-2 border-dashed border-gray-200 py-3 text-center text-xs text-gray-400">
            Promo strip is hidden — toggle to show it
          </div>
        )}
      </div>

      {/* ── Logo Light (navbar) ── */}
      <div className="card p-5 space-y-4">
        <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
          <Image className="w-4 h-4 text-[#0a1f44]" /> Navbar Logo (Light background)
        </h4>

        <div className="flex items-start gap-6 flex-wrap">
          {/* Upload zone */}
          <button
            type="button"
            onClick={() => pickFile(lightRef)}
            className="flex flex-col items-center justify-center w-40 h-24 border-2 border-dashed border-gray-200
                       rounded-2xl hover:border-[#0a1f44] hover:bg-blue-50 transition-all gap-2 flex-shrink-0">
            <Upload className="w-5 h-5 text-gray-400" />
            <span className="text-xs text-gray-500 text-center px-2">Click to upload<br/>PNG / SVG / WebP</span>
          </button>
          <input ref={lightRef} type="file" accept="image/*" className="hidden"
            onChange={e => onLogoChange(e)} />

          {/* Preview at exact display size */}
          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              Preview — rendered at {LOGO_LIGHT_W}×{LOGO_LIGHT_H}px
            </p>
            <div className="bg-white border border-gray-200 rounded-xl p-3 inline-flex items-center justify-center"
              style={{ minWidth: LOGO_LIGHT_W + 24, minHeight: LOGO_LIGHT_H + 24 }}>
              {logoLightPreview ? (
                <img src={logoLightPreview} alt="Navbar logo"
                  style={{ width: LOGO_LIGHT_W, height: LOGO_LIGHT_H, objectFit: 'contain' }} />
              ) : (
                <div style={{ width: LOGO_LIGHT_W, height: LOGO_LIGHT_H }}
                  className="flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                  <span className="text-xs text-gray-400">No logo</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400">Used in: Navbar (top bar)</p>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-3 flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700">
            Logo is always displayed at <strong>{LOGO_LIGHT_W}×{LOGO_LIGHT_H}px</strong> with <code>object-fit: contain</code>.
            Use a transparent-background PNG or SVG for best results. Max file size: 2 MB.
          </p>
        </div>

        {logoLightFile && (
          <div className="flex items-center gap-2 bg-green-50 rounded-xl px-3 py-2">
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="text-xs text-green-700 font-medium">New logo ready — click Save to apply</span>
          </div>
        )}
      </div>

      {/* ── Save button ── */}
      <button
        onClick={save}
        disabled={saving}
        className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2">
        {saving
          ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
          : <><Save className="w-4 h-4" /> Save Navbar Settings</>}
      </button>
    </div>
  );
}