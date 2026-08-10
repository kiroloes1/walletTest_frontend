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
  FaCheckCircle 
} from "react-icons/fa";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="no-print mt-auto w-full bg-[#0F172A] text-white py-10 sm:py-14 border-t border-slate-800 relative overflow-hidden">
      
      {/* خط علوي متدرج (Gradient) يعطي شكل انسيابي وراقي */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>

      {/* لمسات خلفية ناعمة جداً */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px]"></div>
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px]"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 w-full text-right" dir="rtl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="bg-cyan-500/20 p-2 rounded-lg">
                  <FaWallet className="text-cyan-400" size={20} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                   نظام <span className="text-cyan-400">المحفظة</span>
                </h2>
              </div>
            </div>
            <div className="hidden md:block h-8 w-[1px] bg-slate-800 mx-2"></div>
            <h3 className="text-slate-500 font-medium text-sm sm:text-base tracking-wide">المنصة المالية المتكاملة</h3>
          </div>

          <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/40 rounded-full border border-slate-700/50">
            <FaCheckCircle className="text-cyan-500 animate-pulse" size={14} />
            <p className="text-slate-300 text-[11px] sm:text-xs font-medium uppercase tracking-[1px]">
               حماية البيانات نشطة v2.0
            </p>
          </div>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12" dir="rtl">
          
          {/* Phone Card */}
          <div className="group bg-slate-900/50 p-5 rounded-[24px] border border-slate-800 hover:border-cyan-500/30 transition-all duration-500">
            <div className="flex items-center gap-4">
              <div className="bg-slate-800 p-3 rounded-xl group-hover:bg-cyan-500/10 transition-colors">
                <FaPhone className="text-slate-400 group-hover:text-cyan-400" size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">الدعم المباشر</p>
                <span className="text-slate-200 text-sm font-semibold tracking-wider block">
                  01126506845
                </span>
              </div>
            </div>
          </div>

          {/* Security Card */}
          <div className="group bg-slate-900/50 p-5 rounded-[24px] border border-slate-800 hover:border-cyan-500/30 transition-all duration-500">
            <div className="flex items-center gap-4">
              <div className="bg-slate-800 p-3 rounded-xl group-hover:bg-cyan-500/10 transition-colors">
                <FaShieldAlt className="text-slate-400 group-hover:text-cyan-400" size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">الخصوصية</p>
                <span className="text-slate-200 text-sm font-semibold block">
                  تشفير نهاية لنهاية
                </span>
              </div>
            </div>
          </div>

          {/* Location Card */}
          <div className="group bg-slate-900/50 p-5 rounded-[24px] border border-slate-800 hover:border-cyan-500/30 transition-all duration-500">
            <div className="flex items-center gap-4">
              <div className="bg-slate-800 p-3 rounded-xl group-hover:bg-cyan-500/10 transition-colors">
                <FaMapMarkerAlt className="text-slate-400 group-hover:text-cyan-400" size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">المقر الرئيسي</p>
                <span className="text-slate-200 text-sm font-semibold block">
                  أسيوط، جمهورية مصر
                </span>
              </div>
            </div>
          </div>

          {/* Email Card */}
          <div className="group bg-slate-900/50 p-5 rounded-[24px] border border-slate-800 hover:border-cyan-500/30 transition-all duration-500">
            <div className="flex items-center gap-4">
              <div className="bg-slate-800 p-3 rounded-xl group-hover:bg-cyan-500/10 transition-colors">
                <FaEnvelope className="text-slate-400 group-hover:text-cyan-400" size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">البريد الإلكتروني</p>
                <span className="text-slate-200 text-xs font-semibold block truncate">
                   support@fintech-sys.com
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between border-t border-slate-800/50 pt-8 gap-6">
          <div className="flex gap-6">
              <FaFacebook className="text-slate-500 hover:text-cyan-400 cursor-pointer transition-all hover:-translate-y-1" size={18} />
              <FaWhatsapp className="text-slate-500 hover:text-emerald-400 cursor-pointer transition-all hover:-translate-y-1" size={18} />
              <FaInstagram className="text-slate-500 hover:text-pink-400 cursor-pointer transition-all hover:-translate-y-1" size={18} />
          </div>
          
          <p className="text-slate-500 text-[11px] sm:text-xs font-medium tracking-wide">
            © {currentYear} جميع الحقوق محفوظة | <span className="text-slate-300">نظام المحفظة الذكي</span>
          </p>

          <div className="flex flex-col items-center md:items-end">
            <span className="text-[9px] text-slate-600 font-bold uppercase tracking-[2px] mb-1">Built by Excellence</span>
            <div className="text-[11px] text-slate-400 font-semibold">
              Kiroloes Reda <span className="text-cyan-500/50 mx-1">|</span> 01270857659
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;