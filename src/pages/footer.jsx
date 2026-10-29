import React from 'react';
import { 
  FaFacebook, 
  FaInstagram, 
  FaWhatsapp,
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt,
  FaShieldAlt,
  FaWallet,
} from "react-icons/fa";

function Footer() {
  const currentYear = new Date().getFullYear();

  const infoRows = [
    { icon: <FaShieldAlt size={15} />, label: 'الخصوصية', value: 'تشفير نهاية لنهاية' },
    { icon: <FaMapMarkerAlt size={15} />, label: 'المقر الرئيسي', value: 'أسيوط، جمهورية مصر' },
    { icon: <FaEnvelope size={15} />, label: 'البريد الإلكتروني', value: 'support@fintech-sys.com', href: 'mailto:support@fintech-sys.com', ltr: true },
  ];

  const socials = [
    { icon: <FaFacebook size={17} />, label: 'Facebook', hover: 'hover:bg-blue-500/15 hover:text-blue-300 hover:border-blue-400/40' },
    { icon: <FaWhatsapp size={17} />, label: 'WhatsApp', hover: 'hover:bg-emerald-500/15 hover:text-emerald-300 hover:border-emerald-400/40' },
    { icon: <FaInstagram size={17} />, label: 'Instagram', hover: 'hover:bg-pink-500/15 hover:text-pink-300 hover:border-pink-400/40' },
  ];

  return (
    <footer
      className="no-print mt-auto w-full text-white relative overflow-hidden border-t border-slate-800"
      style={{
        backgroundColor: '#0B1220',
        backgroundImage: 'radial-gradient(rgba(148,163,184,0.10) 1px, transparent 1px)',
        backgroundSize: '22px 22px',
      }}
    >
      {/* توهج خلفي هادي خلف الكارت */}
      <div className="absolute top-1/2 left-[8%] -translate-y-1/2 w-[420px] h-[420px] bg-cyan-500/10 rounded-full blur-[110px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-6 relative z-10" dir="rtl">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ============ الجانب النصي ============ */}
          <div className="text-right">
            <h2 className="text-3xl sm:text-4xl font-black leading-tight text-white">
              نظام المحافظ
            </h2>
            <p className="mt-2 text-slate-400 text-sm sm:text-base font-medium">
              المنصة المالية المتكاملة لإدارة المحافظ والتحويلات.
            </p>

            {/* صفوف المعلومات بخط فاصل رفيع بدل الكروت */}
            <ul className="mt-8 divide-y divide-slate-800/80 border-y border-slate-800/80">
              {infoRows.map((row) => (
                <li key={row.label} className="flex items-center gap-4 py-4">
                  <span className="w-9 h-9 shrink-0 rounded-full bg-slate-800/80 text-cyan-400 flex items-center justify-center">
                    {row.icon}
                  </span>
                  <span className="text-xs font-bold text-slate-500 w-28 shrink-0">{row.label}</span>
                  {row.href ? (
                    <a
                      href={row.href}
                      dir={row.ltr ? 'ltr' : undefined}
                      className="text-sm font-semibold text-slate-200 hover:text-cyan-300 transition-colors truncate"
                    >
                      {row.value}
                    </a>
                  ) : (
                    <span className="text-sm font-semibold text-slate-200">{row.value}</span>
                  )}
                </li>
              ))}
            </ul>

            {/* السوشيال */}
            <div className="mt-6 flex items-center gap-3">
              {socials.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  aria-label={s.label}
                  className={`w-10 h-10 rounded-full border border-slate-700 text-slate-400 flex items-center justify-center transition-all duration-300 hover:-translate-y-1 ${s.hover}`}
                >
                  {s.icon}
                </button>
              ))}
            </div>
          </div>

          {/* ============ الكارت ============ */}
          <div className="flex justify-center lg:justify-start" style={{ perspective: '1000px' }}>
            <div
              dir="ltr"
              className="group relative w-full max-w-[420px] aspect-[1.586/1] rounded-[22px] p-6 sm:p-7 flex flex-col justify-between overflow-hidden border border-white/10 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)] transition-transform duration-500 ease-out [transform:rotateY(-8deg)_rotateX(4deg)] hover:[transform:rotateY(0deg)_rotateX(0deg)]"
              style={{
                background:
                  'linear-gradient(135deg, #1E293B 0%, #0F172A 55%, #0c2a3a 100%)',
              }}
            >
              {/* خطوط زخرفية */}
              <svg className="absolute inset-0 w-full h-full opacity-[0.12] pointer-events-none" viewBox="0 0 400 252" fill="none" preserveAspectRatio="none">
                <circle cx="330" cy="40" r="120" stroke="#22D3EE" strokeWidth="1" />
                <circle cx="330" cy="40" r="90" stroke="#22D3EE" strokeWidth="1" />
                <circle cx="330" cy="40" r="60" stroke="#22D3EE" strokeWidth="1" />
                <path d="M-20 220 Q 120 160 260 230 T 440 200" stroke="#fff" strokeWidth="1" />
              </svg>

              {/* لمعة تتحرك مع الـ hover */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.07] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

              {/* الصف العلوي */}
              <div className="relative flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-cyan-400/15 text-cyan-300 flex items-center justify-center">
                    <FaWallet size={15} />
                  </span>
                  <span className="text-sm font-black tracking-tight">نظام المحافظ</span>
                </div>

                {/* contactless */}
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M8.5 8.5a5 5 0 0 1 0 7" />
                  <path d="M12 6a8.5 8.5 0 0 1 0 12" />
                  <path d="M15.5 3.5a12 12 0 0 1 0 17" />
                </svg>
              </div>

              {/* الشريحة + الرقم */}
              <div className="relative">
                <div className="w-11 h-8 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 mb-4 relative overflow-hidden">
                  <span className="absolute inset-x-0 top-1/2 h-px bg-amber-700/50" />
                  <span className="absolute inset-y-0 left-1/3 w-px bg-amber-700/50" />
                  <span className="absolute inset-y-0 left-2/3 w-px bg-amber-700/50" />
                </div>

                <div
                
                  className="flex items-center gap-3 text-[22px] sm:text-[26px] font-bold text-slate-100 hover:text-cyan-300 transition-colors"
                  style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', letterSpacing: '0.12em', textShadow: '0 1px 0 rgba(0,0,0,0.6)' }}
                >
                  <FaPhone size={14} className="text-cyan-400 shrink-0" />
                  0112 650 6845
                </div>
                <p className="mt-1 text-[11px] font-semibold text-slate-400" dir="rtl" style={{ textAlign: 'left' }}>
                  الدعم المباشر
                </p>
              </div>

              {/* الصف السفلي */}
              <div className="relative flex items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] text-slate-500 font-semibold mb-0.5">Built by</p>
                  <p className="text-[13px] font-bold text-slate-100 leading-tight">Kiroloes Reda</p>

                </div>
                                  <p className="text-[11px] text-slate-400 tabular-nums">01270857659</p>


              </div>
            </div>
          </div>
        </div>

        {/* ============ الشريط السفلي ============ */}
        <div className="mt-12 pt-5 border-t border-slate-800/70 text-center">
          <p className="text-slate-500 text-[11px] sm:text-xs font-medium">
            © {currentYear} جميع الحقوق محفوظة <span className="text-slate-700 mx-1">/</span> <span className="text-slate-300">نظام المحافظ </span>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;